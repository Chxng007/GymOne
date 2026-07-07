package gymOne.gym.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
