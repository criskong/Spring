package com.criskong.HelloWorld.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

//serve per ricevere domande dall'url e restituire risposte.
@RestController
public class HelloController {

    //Viene utilizzato nel momento in cui nell'url dopo il percorso principale,
    //viene inserito /hello e mostra a video la stringa associata a quell'url
    @GetMapping("/hello")
    public String hello() {
        return "Hello World!";
    }

    @GetMapping("/hello/{nome}")
    public String helloNome(@PathVariable String nome) {
        return "Hello " + nome + "!";
    }
}