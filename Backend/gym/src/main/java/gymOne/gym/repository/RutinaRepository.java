package gymOne.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Rutina;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {

    List<Rutina> findByClienteIdOrderByFechaInicioDesc(Long clienteId);
}
