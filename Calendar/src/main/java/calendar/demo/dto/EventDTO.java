package calendar.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
public class EventDTO {

    @NotBlank(message = "Titolo obbligatorio")
    @Size(max = 150)
    private String title;

    private String description;

    @NotNull(message = "Data inizio obbligatoria")
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private boolean allDay;

    @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Colore non valido")
    private String color;
}