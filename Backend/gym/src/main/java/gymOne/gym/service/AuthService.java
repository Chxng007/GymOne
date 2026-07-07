package gymOne.gym.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

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

    public AuthService(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository,
            JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.contrasena()));

        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado tras autenticar"));

        String token = jwtUtil.generateToken(usuario.getCorreo());

        return new LoginResponse(token, usuario.getNombre(), usuario.getCorreo(), usuario.getRol().name());
    }
}
