package calendar.demo.exception;

// Username o password sbagliati in fase di login -> 401
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
