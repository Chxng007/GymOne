package gymOne.gym.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.VentaItemRequest;
import gymOne.gym.dto.VentaItemResponse;
import gymOne.gym.dto.VentaRequest;
import gymOne.gym.dto.VentaResponse;
import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.Producto;
import gymOne.gym.entity.Usuario;
import gymOne.gym.entity.Venta;
import gymOne.gym.entity.VentaItem;
import gymOne.gym.repository.UsuarioRepository;
import gymOne.gym.repository.VentaRepository;

@Service
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository;
    private final CajaService cajaService;

    public VentaService(
            VentaRepository ventaRepository,
            ProductoService productoService,
            UsuarioRepository usuarioRepository,
            CajaService cajaService) {
        this.ventaRepository = ventaRepository;
        this.productoService = productoService;
        this.usuarioRepository = usuarioRepository;
        this.cajaService = cajaService;
    }

    public List<VentaResponse> listar() {
        return ventaRepository.findAllByOrderByFechaDesc().stream().map(this::toResponse).toList();
    }

    public VentaResponse crear(VentaRequest request, String correoUsuario) {
        Usuario registradoPor = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Venta venta = new Venta();
        venta.setDescuento(request.descuento() != null ? request.descuento() : BigDecimal.ZERO);
        venta.setMetodoPago(Venta.MetodoPago.valueOf(request.metodoPago()));
        venta.setRegistradoPor(registradoPor);

        BigDecimal subtotalGeneral = BigDecimal.ZERO;

        for (VentaItemRequest itemRequest : request.items()) {
            Producto producto = productoService.buscarOFallar(itemRequest.productoId());

            if (producto.getStock() < itemRequest.cantidad()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuficiente para " + producto.getNombre() + " (disponible: " + producto.getStock() + ")");
            }

            producto.setStock(producto.getStock() - itemRequest.cantidad());

            VentaItem item = new VentaItem();
            item.setVenta(venta);
            item.setProducto(producto);
            item.setCantidad(itemRequest.cantidad());
            item.setPrecioUnitario(producto.getPrecio());
            venta.getItems().add(item);

            subtotalGeneral = subtotalGeneral.add(producto.getPrecio().multiply(BigDecimal.valueOf(itemRequest.cantidad())));
        }

        venta.setTotal(subtotalGeneral.subtract(venta.getDescuento()));

        Venta ventaGuardada;
        try {
            ventaGuardada = ventaRepository.saveAndFlush(venta);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El stock cambió mientras se registraba la venta. Vuelve a intentarlo.");
        }

        if (ventaGuardada.getMetodoPago() == Venta.MetodoPago.EFECTIVO) {
            cajaService.registrarMovimientoAutomatico(
                    CajaMovimiento.TipoMovimiento.INGRESO,
                    "Venta #" + ventaGuardada.getId(),
                    ventaGuardada.getTotal(),
                    null);
        }

        return toResponse(ventaGuardada);
    }

    private VentaResponse toResponse(Venta venta) {
        List<VentaItemResponse> items = venta.getItems().stream()
                .map(item -> new VentaItemResponse(
                        item.getProducto().getId(),
                        item.getProducto().getNombre(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad()))))
                .toList();

        return new VentaResponse(
                venta.getId(),
                venta.getFecha(),
                venta.getTotal(),
                venta.getDescuento(),
                venta.getMetodoPago().name(),
                venta.getRegistradoPor().getNombre(),
                items);
    }
}
