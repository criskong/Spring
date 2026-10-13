package calendar.demo.repository;

import calendar.demo.model.Event;
import calendar.demo.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// @DataJpaTest avvia solo la parte JPA di Spring con un database H2 in memoria.
// Ogni test gira in una transazione che viene annullata alla fine
@DataJpaTest
class EventRepositoryTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Trova solo gli eventi dell'utente compresi nell'intervallo di date")
    void findByUserIdAndStartTimeBetween() {
        User mario = saveUser("mario");
        User luigi = saveUser("luigi");

        saveEvent("Maggio", LocalDateTime.of(2026, 5, 10, 9, 0), mario);
        saveEvent("Giugno", LocalDateTime.of(2026, 6, 10, 9, 0), mario);
        saveEvent("Maggio di Luigi", LocalDateTime.of(2026, 5, 15, 9, 0), luigi);

        List<Event> result = eventRepository.findByUserIdAndStartTimeBetween(
                mario.getId(),
                LocalDateTime.of(2026, 5, 1, 0, 0),
                LocalDateTime.of(2026, 5, 31, 23, 59));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Maggio");
    }

    @Test
    @DisplayName("Trova tutti gli eventi di un utente")
    void findByUserId() {
        User mario = saveUser("mario");
        User luigi = saveUser("luigi");

        saveEvent("Evento 1", LocalDateTime.of(2026, 5, 10, 9, 0), mario);
        saveEvent("Evento 2", LocalDateTime.of(2026, 6, 10, 9, 0), mario);
        saveEvent("Evento di Luigi", LocalDateTime.of(2026, 5, 15, 9, 0), luigi);

        List<Event> result = eventRepository.findByUserId(mario.getId());

        assertThat(result).extracting(Event::getTitle)
                .containsExactlyInAnyOrder("Evento 1", "Evento 2");
    }

    // ─── METODI DI SUPPORTO ───

    private User saveUser(String username) {
        return userRepository.save(User.builder()
                .username(username)
                .email(username + "@email.it")
                .password("password")
                .build());
    }

    private void saveEvent(String title, LocalDateTime start, User user) {
        eventRepository.save(Event.builder()
                .title(title)
                .startTime(start)
                .user(user)
                .build());
    }
}
