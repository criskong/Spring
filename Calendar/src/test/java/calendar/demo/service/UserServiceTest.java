package calendar.demo.service;

import calendar.demo.config.JwtService;
import calendar.demo.dto.LoginDTO;
import calendar.demo.dto.RegisterDTO;
import calendar.demo.exception.AlreadyExistsException;
import calendar.demo.exception.InvalidCredentialsException;
import calendar.demo.model.User;
import calendar.demo.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Unit test con Mockito: le dipendenze di UserService sono finte (mock),
// così testo solo la logica del service senza database
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    // ─── REGISTRAZIONE ───

    @Test
    @DisplayName("Registrazione: salva l'utente con la password criptata")
    void register_success() {
        RegisterDTO dto = registerDTO("mario", "mario@email.it", "password123");

        when(userRepository.existsByUsername("mario")).thenReturn(false);
        when(userRepository.existsByEmail("mario@email.it")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("password-criptata");
        // save restituisce lo stesso utente che riceve
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = userService.register(dto);

        assertThat(saved.getUsername()).isEqualTo("mario");
        assertThat(saved.getEmail()).isEqualTo("mario@email.it");
        assertThat(saved.getPassword()).isEqualTo("password-criptata");
    }

    @Test
    @DisplayName("Registrazione: errore se lo username è già usato")
    void register_usernameAlreadyExists() {
        RegisterDTO dto = registerDTO("mario", "mario@email.it", "password123");
        when(userRepository.existsByUsername("mario")).thenReturn(true);

        assertThrows(AlreadyExistsException.class, () -> userService.register(dto));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registrazione: errore se l'email è già usata")
    void register_emailAlreadyExists() {
        RegisterDTO dto = registerDTO("mario", "mario@email.it", "password123");
        when(userRepository.existsByUsername("mario")).thenReturn(false);
        when(userRepository.existsByEmail("mario@email.it")).thenReturn(true);

        assertThrows(AlreadyExistsException.class, () -> userService.register(dto));
        verify(userRepository, never()).save(any());
    }

    // ─── LOGIN ───

    @Test
    @DisplayName("Login: con credenziali corrette restituisce il token")
    void login_success() {
        User user = User.builder().username("mario").password("password-criptata").build();

        when(userRepository.findByUsername("mario")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "password-criptata")).thenReturn(true);
        when(jwtService.generateToken("mario")).thenReturn("token-finto");

        Map<String, String> result = userService.login(loginDTO("mario", "password123"));

        assertThat(result.get("token")).isEqualTo("token-finto");
        assertThat(result.get("username")).isEqualTo("mario");
    }

    @Test
    @DisplayName("Login: errore se la password è sbagliata")
    void login_wrongPassword() {
        User user = User.builder().username("mario").password("password-criptata").build();

        when(userRepository.findByUsername("mario")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("sbagliata", "password-criptata")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class,
                () -> userService.login(loginDTO("mario", "sbagliata")));
    }

    @Test
    @DisplayName("Login: errore se l'utente non esiste")
    void login_userNotFound() {
        when(userRepository.findByUsername("nessuno")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class,
                () -> userService.login(loginDTO("nessuno", "password123")));
    }

    // ─── METODI DI SUPPORTO ───

    private RegisterDTO registerDTO(String username, String email, String password) {
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername(username);
        dto.setEmail(email);
        dto.setPassword(password);
        return dto;
    }

    private LoginDTO loginDTO(String username, String password) {
        LoginDTO dto = new LoginDTO();
        dto.setUsername(username);
        dto.setPassword(password);
        return dto;
    }
}
