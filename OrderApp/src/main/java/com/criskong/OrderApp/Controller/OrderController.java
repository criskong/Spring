package com.criskong.OrderApp.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

//serve per ricevere domande dall'url e restituire risposte.
@RestController
public class OrderController {

    //Viene utilizzato nel momento in cui nell'url dopo il percorso principale,
    //viene inserito /hello e mostra a video la stringa associata a quell'url
    @GetMapping("/order")
    public String order(@RequestParam String item) {
        return "Your order for " + item + " has been recived";
    }
}