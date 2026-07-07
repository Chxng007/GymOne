package gymOne.gym.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Entrenador;

public interface EntrenadorRepository extends JpaRepository<Entrenador, Long> {
}
