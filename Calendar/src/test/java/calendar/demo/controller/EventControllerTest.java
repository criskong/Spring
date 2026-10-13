package calendar.demo.controller;

import calendar.demo.config.JwtService;
import calendar.demo.model.Event;
import calendar.demo.model.User;
import calendar.demo.repository.EventRepository;
import calendar.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JwtService jwtService;

    private User mario;
    private String marioToken;

    @BeforeEach
    void setUp() {
        // Creo l'utente direttamente nel database e genero il suo token
        mario = saveUser("mario");
        marioToken = jwtService.generateToken("mario");
    }

    // ─── SICUREZZA ───

    @Test
    @DisplayName("GET /events senza token -> 401")
    void getEvents_withoutToken() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /events con token non valido -> 401")
    void getEvents_withInvalidToken() throws Exception {
        mockMvc.perform(get("/api/events")
                        .header("Authorization", "Bearer token-non-valido"))
                .andExpect(status().isUnauthorized());
    }

    // ─── CRUD ───

    @Test
    @DisplayName("POST /events crea l'evento e GET /events lo restituisce")
    void createEvent_thenGetEvents() throws Exception {
        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + marioToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Dentista",
                                  "startTime": "2026-05-10T09:00:00",
                                  "endTime": "2026-05-10T10:00:00",
                                  "color": "#22c55e"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Dentista"))
                .andExpect(jsonPath("$.color").value("#22c55e"))
                // La risposta non deve contenere i dati dell'utente
                .andExpect(jsonPath("$.user").doesNotExist());

        mockMvc.perform(get("/api/events")
                        .header("Authorization", "Bearer " + marioToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Dentista"));
    }

    @Test
    @DisplayName("POST /events senza titolo -> 400")
    void createEvent_withoutTitle() throws Exception {
        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + marioToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "title": "", "startTime": "2026-05-10T09:00:00" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Titolo obbligatorio"));
    }

    @Test
    @DisplayName("POST /events con fine prima dell'inizio -> 400")
    void createEvent_endBeforeStart() throws Exception {
        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + marioToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Dentista",
                                  "startTime": "2026-05-10T10:00:00",
                                  "endTime": "2026-05-10T09:00:00"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("La data di fine deve essere dopo la data di inizio"));
    }

    @Test
    @DisplayName("DELETE /events/{id} di un altro utente -> 403")
    void deleteEvent_ofAnotherUser() throws Exception {
        User luigi = saveUser("luigi");
        Event luigiEvent = saveEvent("Evento di Luigi", luigi);

        mockMvc.perform(delete("/api/events/" + luigiEvent.getId())
                        .header("Authorization", "Bearer " + marioToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /events/{id} inesistente -> 404")
    void deleteEvent_notFound() throws Exception {
        mockMvc.perform(delete("/api/events/9999")
                        .header("Authorization", "Bearer " + marioToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Evento non trovato"));
    }

    @Test
    @DisplayName("DELETE /events/{id} del proprietario -> 200")
    void deleteEvent_success() throws Exception {
        Event event = saveEvent("Da eliminare", mario);

        mockMvc.perform(delete("/api/events/" + event.getId())
                        .header("Authorization", "Bearer " + marioToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events")
                        .header("Authorization", "Bearer " + marioToken))
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ─── METODI DI SUPPORTO ───

    private User saveUser(String username) {
        return userRepository.save(User.builder()
                .username(username)
                .email(username + "@email.it")
                .password("password")
                .build());
    }

    private Event saveEvent(String title, User user) {
        return eventRepository.save(Event.builder()
                .title(title)
                .startTime(LocalDateTime.of(2026, 5, 10, 9, 0))
                .color("#3b82f6")
                .user(user)
                .build());
    }
}
