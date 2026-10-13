package calendar.demo.service;

import calendar.demo.dto.EventDTO;
import calendar.demo.exception.ForbiddenException;
import calendar.demo.exception.NotFoundException;
import calendar.demo.model.Event;
import calendar.demo.model.User;
import calendar.demo.repository.EventRepository;
import calendar.demo.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EventService eventService;

    private final User mario = User.builder().id(1L).username("mario").build();
    private final User luigi = User.builder().id(2L).username("luigi").build();

    // ─── CREAZIONE ───

    @Test
    @DisplayName("Creazione: se non c'è il colore usa quello di default")
    void create_usesDefaultColor() {
        EventDTO dto = eventDTO("Dentista", LocalDateTime.of(2026, 5, 10, 9, 0), null);

        when(userRepository.findByUsername("mario")).thenReturn(Optional.of(mario));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event created = eventService.create(dto, "mario");

        assertThat(created.getTitle()).isEqualTo("Dentista");
        assertThat(created.getColor()).isEqualTo("#3498db");
        assertThat(created.getUser()).isEqualTo(mario);
    }

    @Test
    @DisplayName("Creazione: errore se la data di fine è prima di quella di inizio")
    void create_endBeforeStart() {
        EventDTO dto = eventDTO("Dentista",
                LocalDateTime.of(2026, 5, 10, 10, 0),
                LocalDateTime.of(2026, 5, 10, 9, 0));

        assertThrows(IllegalArgumentException.class, () -> eventService.create(dto, "mario"));
        verify(eventRepository, never()).save(any());
    }

    // ─── MODIFICA ───

    @Test
    @DisplayName("Modifica: aggiorna i campi dell'evento")
    void update_success() {
        Event event = existingEvent(10L, mario);
        EventDTO dto = eventDTO("Titolo nuovo", LocalDateTime.of(2026, 6, 1, 15, 0), null);

        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event updated = eventService.update(10L, dto, "mario");

        assertThat(updated.getTitle()).isEqualTo("Titolo nuovo");
        assertThat(updated.getStartTime()).isEqualTo(LocalDateTime.of(2026, 6, 1, 15, 0));
    }

    @Test
    @DisplayName("Modifica: un utente non può modificare l'evento di un altro")
    void update_otherUsersEvent() {
        Event event = existingEvent(10L, luigi);
        EventDTO dto = eventDTO("Titolo nuovo", LocalDateTime.of(2026, 6, 1, 15, 0), null);

        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));

        assertThrows(ForbiddenException.class, () -> eventService.update(10L, dto, "mario"));
        verify(eventRepository, never()).save(any());
    }

    // ─── ELIMINAZIONE ───

    @Test
    @DisplayName("Eliminazione: elimina l'evento del proprietario")
    void delete_success() {
        Event event = existingEvent(10L, mario);
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));

        eventService.delete(10L, "mario");

        verify(eventRepository).delete(event);
    }

    @Test
    @DisplayName("Eliminazione: errore se l'evento non esiste")
    void delete_notFound() {
        when(eventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> eventService.delete(99L, "mario"));
    }

    // ─── METODI DI SUPPORTO ───

    private EventDTO eventDTO(String title, LocalDateTime start, LocalDateTime end) {
        EventDTO dto = new EventDTO();
        dto.setTitle(title);
        dto.setStartTime(start);
        dto.setEndTime(end);
        return dto;
    }

    private Event existingEvent(Long id, User owner) {
        return Event.builder()
                .id(id)
                .title("Evento")
                .startTime(LocalDateTime.of(2026, 5, 10, 9, 0))
                .color("#3b82f6")
                .user(owner)
                .build();
    }
}
