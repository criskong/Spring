package com.criskong.OrderApp.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class OrderController {

  /**
 * @RequestParam è un'annotazione di Spring usata per leggere parametri
 * passati nella query dell'URL di una richiesta HTTP.
 *
 * In Spring Boot:
 * - Permette di recuperare valori dalla query string della richiesta.
 * - Il valore viene automaticamente assegnato a un parametro del metodo.
 * - È spesso usato nelle richieste GET.
 *
 * Esempio:
 * /foods?name=pizza
 * -> "pizza" viene letto tramite @RequestParam("name")
 */

    @GetMapping("/order")
    public String order(@RequestParam String item) {
        return "Your order for " + item + " has been recived";
    }
}