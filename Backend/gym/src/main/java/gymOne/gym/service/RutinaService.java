package gymOne.gym.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.RutinaDiaRequest;
import gymOne.gym.dto.RutinaDiaResponse;
import gymOne.gym.dto.RutinaEjercicioRequest;
import gymOne.gym.dto.RutinaEjercicioResponse;
import gymOne.gym.dto.RutinaRequest;
import gymOne.gym.dto.RutinaResponse;
import gymOne.gym.entity.Cliente;
import gymOne.gym.entity.Entrenador;
import gymOne.gym.entity.Rutina;
import gymOne.gym.entity.RutinaDia;
import gymOne.gym.entity.RutinaEjercicio;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.RutinaRepository;

@Service
@Transactional
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final ClienteRepository clienteRepository;
    private final EntrenadorService entrenadorService;

    public RutinaService(RutinaRepository rutinaRepository, ClienteRepository clienteRepository, EntrenadorService entrenadorService) {
        this.rutinaRepository = rutinaRepository;
        this.clienteRepository = clienteRepository;
        this.entrenadorService = entrenadorService;
    }

    public List<RutinaResponse> listarPorCliente(Long clienteId) {
        return rutinaRepository.findByClienteIdOrderByFechaInicioDesc(clienteId).stream().map(this::toResponse).toList();
    }

    public RutinaResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    public RutinaResponse crear(RutinaRequest request) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        Rutina rutina = new Rutina();
        rutina.setCliente(cliente);
        rutina.setNombre(request.nombre());
        rutina.setFechaInicio(request.fechaInicio() != null ? request.fechaInicio() : LocalDate.now());

        if (request.entrenadorId() != null) {
            Entrenador entrenador = entrenadorService.buscarOFallar(request.entrenadorId());
            rutina.setEntrenador(entrenador);
        }

        aplicarDias(rutina, request.dias());

        return toResponse(rutinaRepository.save(rutina));
    }

    public RutinaResponse actualizar(Long id, RutinaRequest request) {
        Rutina rutina = buscarOFallar(id);
        rutina.setNombre(request.nombre());
        if (request.fechaInicio() != null) {
            rutina.setFechaInicio(request.fechaInicio());
        }
        rutina.setEntrenador(request.entrenadorId() != null ? entrenadorService.buscarOFallar(request.entrenadorId()) : null);

        rutina.getDias().clear();
        aplicarDias(rutina, request.dias());

        return toResponse(rutinaRepository.save(rutina));
    }

    public void eliminar(Long id) {
        if (!rutinaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rutina no encontrada");
        }
        rutinaRepository.deleteById(id);
    }

    private void aplicarDias(Rutina rutina, List<RutinaDiaRequest> diasRequest) {
        for (RutinaDiaRequest diaRequest : diasRequest) {
            RutinaDia dia = new RutinaDia();
            dia.setRutina(rutina);
            dia.setDia(diaRequest.dia());

            for (RutinaEjercicioRequest ejercicioRequest : diaRequest.ejercicios()) {
                RutinaEjercicio ejercicio = new RutinaEjercicio();
                ejercicio.setRutinaDia(dia);
                ejercicio.setEjercicio(ejercicioRequest.ejercicio());
                ejercicio.setSeries(ejercicioRequest.series());
                ejercicio.setRepeticiones(ejercicioRequest.repeticiones());
                ejercicio.setPeso(ejercicioRequest.peso());
                ejercicio.setDescansoSegundos(ejercicioRequest.descansoSegundos());
                ejercicio.setNotas(ejercicioRequest.notas());
                ejercicio.setVideoUrl(ejercicioRequest.videoUrl());
                dia.getEjercicios().add(ejercicio);
            }

            rutina.getDias().add(dia);
        }
    }

    private Rutina buscarOFallar(Long id) {
        return rutinaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rutina no encontrada"));
    }

    private RutinaResponse toResponse(Rutina rutina) {
        List<RutinaDiaResponse> dias = rutina.getDias().stream()
                .map(dia -> new RutinaDiaResponse(
                        dia.getId(),
                        dia.getDia(),
                        dia.getEjercicios().stream()
                                .map(ej -> new RutinaEjercicioResponse(
                                        ej.getId(), ej.getEjercicio(), ej.getSeries(), ej.getRepeticiones(),
                                        ej.getPeso(), ej.getDescansoSegundos(), ej.getNotas(), ej.getVideoUrl()))
                                .toList()))
                .toList();

        return new RutinaResponse(
                rutina.getId(),
                rutina.getCliente().getId(),
                rutina.getEntrenador() != null ? rutina.getEntrenador().getId() : null,
                rutina.getEntrenador() != null ? rutina.getEntrenador().getNombre() : null,
                rutina.getNombre(),
                rutina.getFechaInicio(),
                dias);
    }
}
