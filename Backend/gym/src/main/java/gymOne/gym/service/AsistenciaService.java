package gymOne.gym.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.AsistenciaResponse;
import gymOne.gym.entity.Asistencia;
import gymOne.gym.entity.Cliente;
import gymOne.gym.repository.AsistenciaRepository;
import gymOne.gym.repository.ClienteRepository;

@Service
@Transactional
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final ClienteRepository clienteRepository;

    public AsistenciaService(AsistenciaRepository asistenciaRepository, ClienteRepository clienteRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<AsistenciaResponse> listarHoy() {
        return asistenciaRepository.findByFechaOrderByHoraEntradaDesc(LocalDate.now()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AsistenciaResponse> listarPorCliente(Long clienteId) {
        return asistenciaRepository.findByClienteIdOrderByHoraEntradaDesc(clienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    public AsistenciaResponse registrarEntrada(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        LocalDate hoy = LocalDate.now();
        if (asistenciaRepository.findByClienteIdAndFechaAndHoraSalidaIsNull(clienteId, hoy).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El cliente ya tiene una entrada sin salida registrada hoy");
        }

        Asistencia asistencia = new Asistencia();
        asistencia.setCliente(cliente);

        return toResponse(asistenciaRepository.save(asistencia));
    }

    public AsistenciaResponse registrarSalida(Long asistenciaId) {
        Asistencia asistencia = asistenciaRepository.findById(asistenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asistencia no encontrada"));

        if (asistencia.getHoraSalida() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta asistencia ya tiene salida registrada");
        }

        asistencia.setHoraSalida(LocalDateTime.now());
        return toResponse(asistenciaRepository.save(asistencia));
    }

    private AsistenciaResponse toResponse(Asistencia asistencia) {
        return new AsistenciaResponse(
                asistencia.getId(),
                asistencia.getCliente().getId(),
                asistencia.getCliente().getPrimerNombre() + " " + (asistencia.getCliente().getSegundoNombre() != null ? asistencia.getCliente().getSegundoNombre() : ""),
                asistencia.getHoraEntrada(),
                asistencia.getHoraSalida(),
                asistencia.getFecha());
    }
}
