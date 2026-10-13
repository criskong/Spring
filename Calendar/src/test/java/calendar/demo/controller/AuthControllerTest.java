package calendar.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Test di integrazione: avvia tutta l'applicazione (con H2 al posto di MySQL)
// e simula le richieste HTTP con MockMvc, senza avviare un vero server.
// @Transactional annulla le modifiche al database dopo ogni test
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /register con dati validi -> 200")
    void register_success() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("mario", "mario@email.it", "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registrazione avvenuta con successo"));
    }

    @Test
    @DisplayName("POST /register con username già usato -> 409")
    void register_duplicateUsername() throws Exception {
        register("mario", "mario@email.it", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("mario", "altra@email.it", "password123")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Username già in uso"));
    }

    @Test
    @DisplayName("POST /register con email non valida -> 400")
    void register_invalidEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("mario", "non-una-email", "password123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email non valida"));
    }

    @Test
    @DisplayName("POST /login con credenziali corrette -> 200 con token")
    void login_success() throws Exception {
        register("mario", "mario@email.it", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("mario", "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("mario"));
    }

    @Test
    @DisplayName("POST /login con password sbagliata -> 401")
    void login_wrongPassword() throws Exception {
        register("mario", "mario@email.it", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("mario", "sbagliata")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Username o password non validi"));
    }

    // ─── METODI DI SUPPORTO ───

    private void register(String username, String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerJson(username, email, password)));
    }

    private String registerJson(String username, String email, String password) {
        return """
                { "username": "%s", "email": "%s", "password": "%s" }
                """.formatted(username, email, password);
    }

    private String loginJson(String username, String password) {
        return """
                { "username": "%s", "password": "%s" }
                """.formatted(username, password);
    }
}
