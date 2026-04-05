package Calendar.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class RegisterDTO {
    
    @NotBlank(message = "Username obbligatorio")
    @Size(min = 3, max = 50, message = "Username tra 3 e 50 caratteri")
    private String username;

    @NotBlank(message = "Email obbligatoria")
    @Email(message = "Email non valida")
    private String email;

    @NotBlank(message = "Password obbligatoria")
    @Size(min = 6, message = "Password minimo 6 caratteri")
    private String password;
}