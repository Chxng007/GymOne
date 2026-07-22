package gymOne.gym.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private static final String SECRETO = "dGVzdC1vbmx5LXNpZ25pbmcta2V5LW5vdC11c2VkLWluLXByb2R1Y3Rpb24tMDEyMzQ1Njc4OQ==";
    private static final String OTRO_SECRETO = "b3RyYS1jbGF2ZS1kZS1wcnVlYmEtY29tcGxldGFtZW50ZS1kaXN0aW50YS1kZS1sYS1hbnRlcmlvcg==";

    @Test
    void tokenGeneradoEsValidoYContieneElCorreo() {
        JwtUtil jwtUtil = new JwtUtil(SECRETO, 3600000);

        String token = jwtUtil.generateToken("alguien@example.invalid");

        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractCorreo(token)).isEqualTo("alguien@example.invalid");
    }

    @Test
    void tokenExpiradoNoEsValido() {
        JwtUtil jwtUtil = new JwtUtil(SECRETO, -1000);

        String token = jwtUtil.generateToken("alguien@example.invalid");

        assertThat(jwtUtil.isTokenValid(token)).isFalse();
    }

    @Test
    void tokenAlteradoNoEsValido() {
        JwtUtil jwtUtil = new JwtUtil(SECRETO, 3600000);

        String token = jwtUtil.generateToken("alguien@example.invalid");
        int ultimoPunto = token.lastIndexOf('.');
        char ultimoCaracter = token.charAt(token.length() - 1);
        char reemplazo = ultimoCaracter == 'A' ? 'B' : 'A';
        String tokenAlterado = token.substring(0, token.length() - 1) + reemplazo;

        assertThat(ultimoPunto).isPositive();
        assertThat(jwtUtil.isTokenValid(tokenAlterado)).isFalse();
    }

    @Test
    void tokenFirmadoConOtraClaveNoEsValido() {
        JwtUtil jwtUtil = new JwtUtil(SECRETO, 3600000);
        JwtUtil otroJwtUtil = new JwtUtil(OTRO_SECRETO, 3600000);

        String token = otroJwtUtil.generateToken("alguien@example.invalid");

        assertThat(jwtUtil.isTokenValid(token)).isFalse();
    }
}
