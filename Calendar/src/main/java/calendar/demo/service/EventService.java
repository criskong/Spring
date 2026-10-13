package calendar.demo.service;

import calendar.demo.dto.EventDTO;
import calendar.demo.exception.ForbiddenException;
import calendar.demo.exception.NotFoundException;
import calendar.demo.model.Event;
import calendar.demo.model.User;
import calendar.demo.repository.EventRepository;
import calendar.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public Event create(EventDTO dto, String username) {
        checkDates(dto);
        User user = findUser(username);

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .allDay(dto.isAllDay())
                .color(dto.getColor() != null ? dto.getColor() : "#3498db")
                .user(user)
                .build();

        return eventRepository.save(event);
    }

    public List<Event> getAll(String username) {
        User user = findUser(username);
        return eventRepository.findByUserId(user.getId());
    }

    public List<Event> getByRange(String username, LocalDateTime start, LocalDateTime end) {
        User user = findUser(username);
        return eventRepository.findByUserIdAndStartTimeBetween(user.getId(), start, end);
    }

    public Event update(Long id, EventDTO dto, String username) {
        checkDates(dto);
        Event event = findOwnedEvent(id, username);

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setAllDay(dto.isAllDay());
        if (dto.getColor() != null) event.setColor(dto.getColor());

        return eventRepository.save(event);
    }

    public void delete(Long id, String username) {
        Event event = findOwnedEvent(id, username);
        eventRepository.delete(event);
    }

    // ─── METODI DI SUPPORTO ───

    // La data di fine (se presente) non può essere prima della data di inizio
    private void checkDates(EventDTO dto) {
        if (dto.getEndTime() != null && dto.getEndTime().isBefore(dto.getStartTime()))
            throw new IllegalArgumentException("La data di fine deve essere dopo la data di inizio");
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Utente non trovato"));
    }

    // Cerca l'evento e controlla che appartenga all'utente loggato
    private Event findOwnedEvent(Long id, String username) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evento non trovato"));

        if (!event.getUser().getUsername().equals(username))
            throw new ForbiddenException("Non puoi modificare eventi di altri utenti");

        return event;
    }
}
