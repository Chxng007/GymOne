package gymOne.gym.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import gymOne.gym.dto.VentaItemRequest;
import gymOne.gym.dto.VentaRequest;
import gymOne.gym.entity.Producto;
import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.CajaMovimientoRepository;
import gymOne.gym.repository.CajaSesionRepository;
import gymOne.gym.repository.ProductoRepository;
import gymOne.gym.repository.UsuarioRepository;
import gymOne.gym.repository.VentaRepository;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class ConcurrenciaVentaTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private VentaService ventaService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private CajaMovimientoRepository cajaMovimientoRepository;

    @Autowired
    private CajaSesionRepository cajaSesionRepository;

    private static final String CORREO = "cajero-concurrencia@gymone.local";

    @BeforeEach
    void limpiar() {
        cajaMovimientoRepository.deleteAll();
        ventaRepository.deleteAll();
        cajaSesionRepository.deleteAll();
        productoRepository.deleteAll();
        usuarioRepository.deleteAll();

        Usuario usuario = new Usuario();
        usuario.setNombre("Cajero");
        usuario.setCorreo(CORREO);
        usuario.setContrasenaHash("hash-de-prueba");
        usuario.setRol(Usuario.Rol.ADMINISTRADOR);
        usuarioRepository.save(usuario);
    }

    private Long crearProductoConStock(int stock) {
        Producto producto = new Producto();
        producto.setNombre("Producto de prueba");
        producto.setCategoria(Producto.Categoria.ACCESORIO);
        producto.setCosto(new BigDecimal("1000"));
        producto.setPrecio(new BigDecimal("2000"));
        producto.setStock(stock);
        return productoRepository.save(producto).getId();
    }

    @Test
    void dosVentasConcurrentesNoSobrevendenElStock() throws Exception {
        Long productoId = crearProductoConStock(10);
        VentaRequest request = new VentaRequest(List.of(new VentaItemRequest(productoId, 6)), BigDecimal.ZERO, "EFECTIVO");

        int hilos = 2;
        ExecutorService executor = Executors.newFixedThreadPool(hilos);
        CountDownLatch listos = new CountDownLatch(hilos);
        CountDownLatch arrancar = new CountDownLatch(1);
        List<Future<Boolean>> resultados = new ArrayList<>();

        for (int i = 0; i < hilos; i++) {
            resultados.add(executor.submit(() -> {
                listos.countDown();
                arrancar.await();
                try {
                    ventaService.crear(request, CORREO);
                    return true;
                } catch (ResponseStatusException ex) {
                    return false;
                }
            }));
        }

        listos.await();
        arrancar.countDown();

        int exitos = 0;
        for (Future<Boolean> resultado : resultados) {
            if (resultado.get()) {
                exitos++;
            }
        }
        executor.shutdown();

        Producto productoFinal = productoRepository.findById(productoId).orElseThrow();

        assertThat(exitos).isEqualTo(1);
        assertThat(productoFinal.getStock()).isEqualTo(4);
    }

    @Test
    void ventaUnicaDescuentaStockNormalmente() {
        Long productoId = crearProductoConStock(10);
        VentaRequest request = new VentaRequest(List.of(new VentaItemRequest(productoId, 6)), BigDecimal.ZERO, "EFECTIVO");

        ventaService.crear(request, CORREO);

        Producto productoFinal = productoRepository.findById(productoId).orElseThrow();
        assertThat(productoFinal.getStock()).isEqualTo(4);
    }
}
