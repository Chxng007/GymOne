package gymOne.gym.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
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

import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.CajaMovimientoRepository;
import gymOne.gym.repository.CajaSesionRepository;
import gymOne.gym.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class ConcurrenciaCajaTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private CajaService cajaService;

    @Autowired
    private CajaSesionRepository cajaSesionRepository;

    @Autowired
    private CajaMovimientoRepository cajaMovimientoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final String CORREO = "responsable-concurrencia@gymone.local";

    @BeforeEach
    void limpiar() {
        cajaMovimientoRepository.deleteAll();
        cajaSesionRepository.deleteAll();
        usuarioRepository.deleteAll();

        Usuario usuario = new Usuario();
        usuario.setNombre("Responsable");
        usuario.setCorreo(CORREO);
        usuario.setContrasenaHash("hash-de-prueba");
        usuario.setRol(Usuario.Rol.ADMINISTRADOR);
        usuarioRepository.save(usuario);
    }

    @Test
    void dosAperturasConcurrentesSoloCreanUnaSesion() throws Exception {
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
                    cajaService.abrir(new BigDecimal("100000"), CORREO);
                    return true;
                } catch (Exception ex) {
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

        long sesionesHoy = cajaSesionRepository.findAllByOrderByFechaDesc().stream()
                .filter(sesion -> sesion.getFecha().equals(LocalDate.now()))
                .count();

        assertThat(exitos).isEqualTo(1);
        assertThat(sesionesHoy).isEqualTo(1);
    }

    @Test
    void abrirDosVecesEnSecuenciaDevuelveConflict() {
        cajaService.abrir(new BigDecimal("100000"), CORREO);

        assertThatThrownBy(() -> cajaService.abrir(new BigDecimal("50000"), CORREO))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
    }
}
