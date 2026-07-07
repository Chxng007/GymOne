package gymOne.gym.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.CajaSesion;

public interface CajaSesionRepository extends JpaRepository<CajaSesion, Long> {

    Optional<CajaSesion> findByFechaAndEstado(LocalDate fecha, CajaSesion.EstadoCaja estado);

    Optional<CajaSesion> findTopByFechaOrderByHoraAperturaDesc(LocalDate fecha);

    List<CajaSesion> findAllByOrderByFechaDesc();

    List<CajaSesion> findByEstadoAndFechaBefore(CajaSesion.EstadoCaja estado, LocalDate fecha);
}
