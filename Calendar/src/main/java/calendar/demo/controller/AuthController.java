package calendar.demo.controller;

import calendar.demo.dto.LoginDTO;
import calendar.demo.dto.RegisterDTO;
import calendar.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        userService.register(dto);
        return ResponseEntity.ok(Map.of("message", "Registrazione avvenuta con successo"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        return ResponseEntity.ok(userService.login(dto));
    }
}