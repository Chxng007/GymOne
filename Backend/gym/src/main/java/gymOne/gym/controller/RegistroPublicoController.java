package gymOne.gym.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.ClienteRequest;
import gymOne.gym.dto.ClienteResponse;
import gymOne.gym.service.ClienteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registro-publico")
public class RegistroPublicoController {

    private final ClienteService clienteService;

    public RegistroPublicoController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> registrar(@Valid @RequestBody gymOne.gym.dto.RegistroPublicoRequest request) {
        ClienteRequest clienteRequest = new ClienteRequest(
                null,
                request.primerNombre(),
                request.segundoNombre(),
                request.documento(),
                request.fechaNacimiento(),
                request.telefono(),
                request.correo(),
                request.direccion(),
                request.contactoEmergenciaNombre(),
                request.contactoEmergenciaTelefono(),
                request.eps(),
                null,
                request.pesoKg(),
                request.alturaCm(),
                request.objetivo(),
                null);

        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(clienteRequest));
    }
}
