package gymOne.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import gymOne.gym.entity.Rutina;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {

    @Query("SELECT DISTINCT r FROM Rutina r LEFT JOIN FETCH r.dias WHERE r.cliente.id = :clienteId ORDER BY r.fechaInicio DESC")
    List<Rutina> findByClienteIdOrderByFechaInicioDesc(@Param("clienteId") Long clienteId);
}
