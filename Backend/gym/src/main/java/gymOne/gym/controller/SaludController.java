package gymOne.gym.controller;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.SaludResponse;

/**
 * Sonda pública que sostiene el despliegue de demostración.
 *
 * <p>La instancia gratuita de Render apaga el contenedor tras 15 minutos sin
 * tráfico y el proyecto gratuito de Supabase se pausa tras 7 días sin
 * actividad. Un único ping periódico contra este endpoint evita las dos cosas,
 * y por eso la consulta a la base no es decorativa: sin tocarla, el ping
 * mantendría viva la API pero dejaría que la base se pausara igual.
 *
 * <p>El frontend la usa además para distinguir "el servidor está arrancando"
 * de "las credenciales son inválidas", que es lo que parecía antes.
 */
@RestController
@RequestMapping("/api/salud")
public class SaludController {

    private final JdbcTemplate jdbcTemplate;

    public SaludController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<SaludResponse> salud() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return ResponseEntity.ok(new SaludResponse("ok", "ok"));
        } catch (DataAccessException e) {
            // 503 a propósito: así el servicio de monitoreo avisa cuando la base
            // se cae o se pausa, en vez de dar por buena una API a medias.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new SaludResponse("ok", "error"));
        }
    }
}
