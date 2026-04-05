package Calendar.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class LoginDTO {

    @NotBlank(message = "Username obbligatorio")
    private String username;

    @NotBlank(message = "Password obbligatoria")
    private String password;
}