package gymOne.gym.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    /**
     * Patrones aparte de la lista exacta, porque Vercel acuña un dominio nuevo en
     * cada despliegue y además mantiene alias por rama: enumerarlos uno a uno es
     * una carrera que siempre se pierde.
     */
    @Value("${app.cors.allowed-origin-patterns}")
    private String allowedOriginPatterns;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // setAllowedOriginPatterns admite orígenes exactos y comodines por igual, y
        // es el único que Spring acepta junto a allowCredentials(true).
        configuration.setAllowedOriginPatterns(
                Stream.concat(separar(allowedOrigin), separar(allowedOriginPatterns)).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static Stream<String> separar(String valores) {
        return Arrays.stream(valores.split(",")).map(String::trim).filter(v -> !v.isEmpty());
    }
}
