package gymOne.gym.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findAllByOrderByCreatedAtDesc();

    boolean existsByTipoAndClienteRelacionadoIdAndCreatedAtBetween(
            Notificacion.Tipo tipo, Long clienteId, LocalDateTime desde, LocalDateTime hasta);

    boolean existsByTipoAndMensajeAndCreatedAtBetween(
            Notificacion.Tipo tipo, String mensaje, LocalDateTime desde, LocalDateTime hasta);
}
