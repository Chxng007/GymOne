package gymOne.gym.security;

import java.io.IOException;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Deja al invitado recorrer la plataforma pero no modificarla.
 *
 * La cuenta de demostración tiene rol ADMINISTRADOR para que todas las secciones
 * sean visibles, así que el rol no sirve para distinguirla: el corte se hace por
 * el correo del usuario autenticado y el método HTTP.
 */
@Component
public class InvitadoSoloLecturaFilter extends OncePerRequestFilter {

    private static final Set<String> METODOS_DE_LECTURA = Set.of("GET", "HEAD", "OPTIONS");

    private static final String CUERPO_RECHAZO = """
            {"error":"Estás en modo invitado: podés ver todo, pero no guardar cambios."}""";

    @Value("${app.demo.enabled}")
    private boolean demoEnabled;

    @Value("${app.demo.email}")
    private String demoEmail;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (demoEnabled && !METODOS_DE_LECTURA.contains(request.getMethod()) && esInvitado()) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(CUERPO_RECHAZO);
            return;
        }

        chain.doFilter(request, response);
    }

    /**
     * El login de invitado (POST /api/auth/demo) llega sin autenticar todavía, así
     * que este método devuelve false y la petición pasa: solo se bloquean las
     * escrituras posteriores, ya con el token en la mano.
     */
    private boolean esInvitado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && demoEmail.equalsIgnoreCase(auth.getName());
    }
}
