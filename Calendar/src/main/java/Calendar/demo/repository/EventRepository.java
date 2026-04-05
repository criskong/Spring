package Calendar.demo.repository;

import Calendar.demo.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Tutti gli eventi di un utente
    List<Event> findByUserId(Long userId);
    
    // Eventi di un utente in un intervallo di date
    List<Event> findByUserIdAndStartTimeBetween(
        Long userId, 
        LocalDateTime start, 
        LocalDateTime end
    );
}