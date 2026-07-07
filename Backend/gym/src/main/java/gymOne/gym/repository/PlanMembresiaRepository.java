package gymOne.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.PlanMembresia;

public interface PlanMembresiaRepository extends JpaRepository<PlanMembresia, Long> {

    List<PlanMembresia> findByActivoTrue();
}
