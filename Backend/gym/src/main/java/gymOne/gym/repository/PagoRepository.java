package gymOne.gym.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Pago;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByClienteIdOrderByFechaDesc(Long clienteId);

    List<Pago> findAllByOrderByFechaDesc();

    List<Pago> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
}
