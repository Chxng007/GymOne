package gymOne.gym.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.EntrenadorRequest;
import gymOne.gym.dto.EntrenadorResponse;
import gymOne.gym.entity.Entrenador;
import gymOne.gym.repository.EntrenadorRepository;

@Service
@Transactional
public class EntrenadorService {

    private final EntrenadorRepository entrenadorRepository;

    public EntrenadorService(EntrenadorRepository entrenadorRepository) {
        this.entrenadorRepository = entrenadorRepository;
    }

    public List<EntrenadorResponse> listar() {
        return entrenadorRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EntrenadorResponse crear(EntrenadorRequest request) {
        Entrenador entrenador = new Entrenador();
        aplicar(entrenador, request);
        return toResponse(entrenadorRepository.save(entrenador));
    }

    public EntrenadorResponse actualizar(Long id, EntrenadorRequest request) {
        Entrenador entrenador = buscarOFallar(id);
        aplicar(entrenador, request);
        return toResponse(entrenadorRepository.save(entrenador));
    }

    public void eliminar(Long id) {
        if (!entrenadorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenador no encontrado");
        }
        entrenadorRepository.deleteById(id);
    }

    Entrenador buscarOFallar(Long id) {
        return entrenadorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenador no encontrado"));
    }

    private void aplicar(Entrenador entrenador, EntrenadorRequest request) {
        entrenador.setNombre(request.nombre());
        entrenador.setTelefono(request.telefono());
        entrenador.setEspecialidad(request.especialidad());
        entrenador.setHorario(request.horario());
    }

    private EntrenadorResponse toResponse(Entrenador entrenador) {
        return new EntrenadorResponse(
                entrenador.getId(), entrenador.getNombre(), entrenador.getTelefono(), entrenador.getEspecialidad(), entrenador.getHorario());
    }
}
