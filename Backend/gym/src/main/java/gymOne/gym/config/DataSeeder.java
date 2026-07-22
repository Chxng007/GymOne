package gymOne.gym.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.UsuarioRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password}")
    private String defaultAdminPassword;

    public DataSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setCorreo(defaultAdminEmail);
        admin.setContrasenaHash(passwordEncoder.encode(defaultAdminPassword));
        admin.setRol(Usuario.Rol.ADMINISTRADOR);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        log.info("========================================================");
        log.info(" Usuario administrador creado (seed inicial)");
        log.info(" Correo: {}", defaultAdminEmail);
        log.info(" Contrasena: la del entorno (ADMIN_PASSWORD). Cambiala tras el primer login.");
        log.info("========================================================");
    }
}
