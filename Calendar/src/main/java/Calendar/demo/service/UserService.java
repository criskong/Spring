package Calendar.demo.service;

import Calendar.demo.config.JwtService;
import Calendar.demo.dto.LoginDTO;
import Calendar.demo.dto.RegisterDTO;
import Calendar.demo.model.User;
import Calendar.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public User register(RegisterDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername()))
            throw new RuntimeException("Username già in uso");
        if (userRepository.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Email già in uso");

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();

        return userRepository.save(user);
    }

    public Map<String, String> login(LoginDTO dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword()))
            throw new RuntimeException("Password errata");

        String token = jwtService.generateToken(user.getUsername());
        return Map.of("token", token, "username", user.getUsername());
    }
}