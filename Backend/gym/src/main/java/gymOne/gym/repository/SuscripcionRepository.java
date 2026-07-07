package gymOne.gym.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Suscripcion;

public interface SuscripcionRepository extends JpaRepository<Suscripcion, Long> {

    List<Suscripcion> findByClienteIdOrderByFechaInicioDesc(Long clienteId);

    List<Suscripcion> findAllByOrderByFechaInicioDesc();

    long countByUltimaRenovacion(LocalDate fecha);

    List<Suscripcion> findByFechaFinAndEstado(LocalDate fechaFin, Suscripcion.EstadoSuscripcion estado);
}
