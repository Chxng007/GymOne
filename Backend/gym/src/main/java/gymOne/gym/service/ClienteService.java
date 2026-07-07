package gymOne.gym.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.ClienteRequest;
import gymOne.gym.dto.ClienteResponse;
import gymOne.gym.entity.Cliente;
import gymOne.gym.repository.ClienteRepository;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<ClienteResponse> listar(String busqueda) {
        List<Cliente> clientes = (busqueda == null || busqueda.isBlank())
                ? clienteRepository.findAll()
                : clienteRepository.findByPrimerNombreContainingIgnoreCaseOrSegundoNombreContainingIgnoreCaseOrDocumentoContainingIgnoreCase(
                        busqueda, busqueda, busqueda);

        return clientes.stream().map(this::toResponse).toList();
    }

    public ClienteResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    public ClienteResponse crear(ClienteRequest request) {
        if (clienteRepository.existsByDocumento(request.documento())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese documento");
        }

        Cliente cliente = new Cliente();
        aplicar(cliente, request);
        return toResponse(clienteRepository.save(cliente));
    }

    public ClienteResponse actualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscarOFallar(id);

        if (clienteRepository.existsByDocumentoAndIdNot(request.documento(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese documento");
        }

        aplicar(cliente, request);
        return toResponse(clienteRepository.save(cliente));
    }

    public void eliminar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        clienteRepository.deleteById(id);
    }

    private Cliente buscarOFallar(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
    }

    private void aplicar(Cliente cliente, ClienteRequest request) {
        cliente.setFotoUrl(request.fotoUrl());
        cliente.setPrimerNombre(request.primerNombre());
        cliente.setSegundoNombre(request.segundoNombre());
        cliente.setDocumento(request.documento());
        cliente.setFechaNacimiento(request.fechaNacimiento());
        cliente.setTelefono(request.telefono());
        cliente.setCorreo(request.correo());
        cliente.setDireccion(request.direccion());
        cliente.setContactoEmergenciaNombre(request.contactoEmergenciaNombre());
        cliente.setContactoEmergenciaTelefono(request.contactoEmergenciaTelefono());
        cliente.setEps(request.eps());
        cliente.setObservaciones(request.observaciones());
        cliente.setPesoKg(request.pesoKg());
        cliente.setAlturaCm(request.alturaCm());
        cliente.setObjetivo(request.objetivo());

        if (request.estado() != null) {
            cliente.setEstado(Cliente.EstadoCliente.valueOf(request.estado()));
        }
    }

    private ClienteResponse toResponse(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getFotoUrl(),
                cliente.getPrimerNombre(),
                cliente.getSegundoNombre(),
                cliente.getDocumento(),
                cliente.getFechaNacimiento(),
                calcularEdad(cliente.getFechaNacimiento()),
                cliente.getTelefono(),
                cliente.getCorreo(),
                cliente.getDireccion(),
                cliente.getContactoEmergenciaNombre(),
                cliente.getContactoEmergenciaTelefono(),
                cliente.getEps(),
                cliente.getObservaciones(),
                cliente.getPesoKg(),
                cliente.getAlturaCm(),
                calcularImc(cliente.getPesoKg(), cliente.getAlturaCm()),
                cliente.getObjetivo(),
                cliente.getEstado().name());
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }

    private Double calcularImc(Double pesoKg, Double alturaCm) {
        if (pesoKg == null || alturaCm == null || alturaCm == 0) {
            return null;
        }
        double alturaM = alturaCm / 100.0;
        double imc = pesoKg / (alturaM * alturaM);
        return Math.round(imc * 10.0) / 10.0;
    }
}
