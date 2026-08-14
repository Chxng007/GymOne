package gymOne.gym.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.LoginRequest;
import gymOne.gym.dto.LoginResponse;
import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.UsuarioRepository;
import gymOne.gym.security.JwtUtil;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.enabled}")
    private boolean demoEnabled;

    @Value("${app.demo.email}")
    private String demoEmail;

    @Value("${app.demo.nombre}")
    private String demoNombre;

    public AuthService(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository,
            JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.contrasena()));

        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado tras autenticar"));

        String token = jwtUtil.generateToken(usuario.getCorreo());

        return new LoginResponse(token, usuario.getNombre(), usuario.getCorreo(), usuario.getRol().name());
    }

    /**
     * Emite un token para la cuenta de invitado sin pedir credenciales, para que
     * cualquiera pueda recorrer la plataforma desplegada. Se apaga con
     * DEMO_ENABLED=false.
     */
    public LoginResponse demoLogin() {
        if (!demoEnabled) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El acceso de demostración está desactivado");
        }

        Usuario demo = usuarioRepository.findByCorreo(demoEmail).orElseGet(this::crearInvitado);
        String token = jwtUtil.generateToken(demo.getCorreo());

        return new LoginResponse(token, demo.getNombre(), demo.getCorreo(), demo.getRol().name());
    }

    private Usuario crearInvitado() {
        Usuario demo = new Usuario();
        demo.setNombre(demoNombre);
        demo.setCorreo(demoEmail);
        // Contraseña aleatoria que no conoce nadie, ni siquiera este proceso una vez
        // termina el método: al invitado se entra por /auth/demo, nunca por /auth/login.
        demo.setContrasenaHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        demo.setRol(Usuario.Rol.ADMINISTRADOR);
        demo.setActivo(true);

        try {
            return usuarioRepository.save(demo);
        } catch (DataIntegrityViolationException e) {
            // Dos visitantes entrando a la vez: el correo es único, así que uno de los
            // dos pierde la carrera y se queda con el usuario que creó el otro.
            return usuarioRepository.findByCorreo(demoEmail)
                    .orElseThrow(() -> new IllegalStateException("No se pudo crear el usuario de demostración", e));
        }
    }
}
