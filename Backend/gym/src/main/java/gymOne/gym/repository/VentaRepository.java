package gymOne.gym.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import gymOne.gym.entity.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findAllByOrderByFechaDesc();

    List<Venta> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    @Query("SELECT DISTINCT v FROM Venta v LEFT JOIN FETCH v.items WHERE v.fecha BETWEEN :desde AND :hasta")
    List<Venta> findByFechaBetweenWithItems(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
