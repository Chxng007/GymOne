package gymOne.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.CajaMovimiento;

public interface CajaMovimientoRepository extends JpaRepository<CajaMovimiento, Long> {

    List<CajaMovimiento> findByCajaSesionIdOrderByFechaDesc(Long cajaSesionId);
}
