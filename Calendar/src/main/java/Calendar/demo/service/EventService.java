package Calendar.demo.service;

import Calendar.demo.dto.EventDTO;
import Calendar.demo.model.Event;
import Calendar.demo.model.User;
import Calendar.demo.repository.EventRepository;
import Calendar.demo.repository.UserRepository;
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
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

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
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        return eventRepository.findByUserId(user.getId());
    }

    public List<Event> getByRange(String username, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        return eventRepository.findByUserIdAndStartTimeBetween(user.getId(), start, end);
    }

    public Event update(Long id, EventDTO dto, String username) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        if (!event.getUser().getUsername().equals(username))
            throw new RuntimeException("Non autorizzato");

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setAllDay(dto.isAllDay());
        if (dto.getColor() != null) event.setColor(dto.getColor());

        return eventRepository.save(event);
    }

    public void delete(Long id, String username) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        if (!event.getUser().getUsername().equals(username))
            throw new RuntimeException("Non autorizzato");

        eventRepository.delete(event);
    }
}