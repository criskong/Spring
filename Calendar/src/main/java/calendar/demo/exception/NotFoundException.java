package calendar.demo.exception;

// Risorsa non trovata (es. evento inesistente) -> 404
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
