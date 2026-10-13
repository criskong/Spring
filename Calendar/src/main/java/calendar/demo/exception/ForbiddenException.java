package calendar.demo.exception;

// L'utente è autenticato ma non può accedere alla risorsa -> 403
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
