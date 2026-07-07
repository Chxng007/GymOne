package gymOne.gym.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Gasto;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findAllByOrderByFechaDesc();

    List<Gasto> findByFechaBetween(LocalDate desde, LocalDate hasta);
}
