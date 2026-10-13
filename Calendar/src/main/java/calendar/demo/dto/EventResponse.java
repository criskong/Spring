package calendar.demo.dto;

import calendar.demo.model.Event;
import lombok.Data;

import java.time.LocalDateTime;

// Dati dell'evento restituiti al frontend.
// Uso un DTO invece dell'entity così non espongo l'utente collegato
// e decido io esattamente quali campi vengono inviati
@Data
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean allDay;
    private String color;

    public static EventResponse from(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setStartTime(event.getStartTime());
        response.setEndTime(event.getEndTime());
        response.setAllDay(event.isAllDay());
        response.setColor(event.getColor());
        return response;
    }
}
