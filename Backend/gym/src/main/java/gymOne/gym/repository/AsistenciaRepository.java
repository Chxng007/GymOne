package gymOne.gym.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import gymOne.gym.entity.Asistencia;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    List<Asistencia> findByFechaOrderByHoraEntradaDesc(LocalDate fecha);

    List<Asistencia> findByClienteIdOrderByHoraEntradaDesc(Long clienteId);

    Optional<Asistencia> findByClienteIdAndFechaAndHoraSalidaIsNull(Long clienteId, LocalDate fecha);
}
