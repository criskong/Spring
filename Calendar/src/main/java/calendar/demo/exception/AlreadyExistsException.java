package calendar.demo.exception;

// Dato già presente (es. username o email già registrati) -> 409
public class AlreadyExistsException extends RuntimeException {

    public AlreadyExistsException(String message) {
        super(message);
    }
}
