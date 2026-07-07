package gymOne.gym.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdNot(String documento, Long id);

    List<Cliente> findByPrimerNombreContainingIgnoreCaseOrSegundoNombreContainingIgnoreCaseOrDocumentoContainingIgnoreCase(
            String primerNombre, String segundoNombre, String documento);

    long countByEstado(Cliente.EstadoCliente estado);

    List<Cliente> findByEstado(Cliente.EstadoCliente estado);

    long countByCreatedAt(LocalDate fecha);
}
