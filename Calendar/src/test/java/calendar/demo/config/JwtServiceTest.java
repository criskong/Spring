package calendar.demo.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

// Unit test: creo JwtService a mano, senza avviare Spring
class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // I campi @Value normalmente li riempie Spring: qui li imposto io
        ReflectionTestUtils.setField(jwtService, "secret", "chiave-segreta-usata-solo-nei-test-lunga-almeno-256-bit");
        ReflectionTestUtils.setField(jwtService, "expiration", 60000L);
    }

    @Test
    @DisplayName("Dal token generato si ricava lo stesso username")
    void generateToken_thenExtractUsername() {
        String token = jwtService.generateToken("mario");

        assertThat(jwtService.extractUsername(token)).isEqualTo("mario");
    }

    @Test
    @DisplayName("Un token appena generato è valido")
    void isTokenValid_withValidToken() {
        String token = jwtService.generateToken("mario");

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Un token modificato non è valido")
    void isTokenValid_withTamperedToken() {
        String token = jwtService.generateToken("mario") + "abc";

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("Un token scaduto non è valido")
    void isTokenValid_withExpiredToken() {
        // Scadenza nel passato: il token nasce già scaduto
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L);
        String token = jwtService.generateToken("mario");

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("Un token vuoto non è valido")
    void isTokenValid_withEmptyToken() {
        assertThat(jwtService.isTokenValid("")).isFalse();
    }
}
