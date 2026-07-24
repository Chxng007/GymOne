package gymOne.gym.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.GastoRequest;
import gymOne.gym.dto.GastoResponse;
import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.Gasto;
import gymOne.gym.repository.GastoRepository;

@Service
@Transactional
public class GastoService {

    private final GastoRepository gastoRepository;
    private final CajaService cajaService;

    public GastoService(GastoRepository gastoRepository, CajaService cajaService) {
        this.gastoRepository = gastoRepository;
        this.cajaService = cajaService;
    }

    public List<GastoResponse> listar() {
        return gastoRepository.findAllByOrderByFechaDesc().stream().map(this::toResponse).toList();
    }

    public GastoResponse crear(GastoRequest request) {
        Gasto gasto = new Gasto();
        aplicar(gasto, request);
        Gasto gastoGuardado = gastoRepository.save(gasto);

        cajaService.registrarMovimientoAutomatico(
                CajaMovimiento.TipoMovimiento.EGRESO,
                "Gasto #" + gastoGuardado.getId() + " - " + gastoGuardado.getDescripcion(),
                gastoGuardado.getMonto(),
                null);

        return toResponse(gastoGuardado);
    }

    public GastoResponse actualizar(Long id, GastoRequest request) {
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gasto no encontrado"));
        aplicar(gasto, request);
        return toResponse(gastoRepository.save(gasto));
    }

    public void eliminar(Long id) {
        if (!gastoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gasto no encontrado");
        }
        gastoRepository.deleteById(id);
    }

    private void aplicar(Gasto gasto, GastoRequest request) {
        gasto.setCategoria(Gasto.Categoria.valueOf(request.categoria()));
        gasto.setDescripcion(request.descripcion());
        gasto.setMonto(request.monto());
    }

    private GastoResponse toResponse(Gasto gasto) {
        return new GastoResponse(gasto.getId(), gasto.getCategoria().name(), gasto.getDescripcion(), gasto.getMonto(), gasto.getFecha());
    }
}
