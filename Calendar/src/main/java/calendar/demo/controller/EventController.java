package calendar.demo.controller;

import calendar.demo.dto.EventDTO;
import calendar.demo.dto.EventResponse;
import calendar.demo.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventResponse> create(
            @Valid @RequestBody EventDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(EventResponse.from(eventService.create(dto, userDetails.getUsername())));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<EventResponse> events = eventService.getAll(userDetails.getUsername())
                .stream()
                .map(EventResponse::from)
                .toList();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/range")
    public ResponseEntity<List<EventResponse>> getByRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<EventResponse> events = eventService.getByRange(userDetails.getUsername(), start, end)
                .stream()
                .map(EventResponse::from)
                .toList();
        return ResponseEntity.ok(events);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EventDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(EventResponse.from(eventService.update(id, dto, userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Evento eliminato"));
    }
}