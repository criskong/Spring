# HelloWorld Spring Boot Project

## Descrizione

Questo progetto è una semplice applicazione **Spring Boot** creata per
comprendere la struttura base di un servizio REST e il funzionamento del
framework.

L'applicazione espone un endpoint HTTP che restituisce una stringa di
risposta quando viene chiamato dal browser o da un client HTTP.

------------------------------------------------------------------------

## Creazione del progetto

Il progetto è stato generato tramite **Spring Initializr**, uno
strumento ufficiale che permette di creare rapidamente la struttura base
di un'applicazione Spring Boot.

Durante la generazione sono state selezionate configurazioni standard:

-   Project: Maven
-   Language: Java
-   Spring Boot: versione stabile corrente
-   Packaging: Jar
-   Java: versione installata localmente

Spring Initializr ha creato automaticamente:

-   struttura cartelle Maven
-   file `pom.xml` con dipendenze
-   classe principale con annotazione `@SpringBootApplication`
-   Maven Wrapper (`mvnw`) per eseguire il progetto senza installare
    Maven globalmente

------------------------------------------------------------------------

## Classe principale

La classe:

`HelloWorldApplication.java`

contiene:

    @SpringBootApplication
    public class HelloWorldApplication {
        public static void main(String[] args) {
            SpringApplication.run(HelloWorldApplication.class, args);
        }
    }

### Perché serve

Questa classe è il punto di ingresso dell'applicazione.

L'annotazione:

    @SpringBootApplication

dice a Spring di:

-   abilitare configurazione automatica
-   cercare componenti nelle sottocartelle
-   inizializzare il contesto applicativo

Il metodo `main` avvia il server embedded (Tomcat).

------------------------------------------------------------------------

## Creazione del Controller

È stato creato il file:

`HelloController.java`

con codice:

    @RestController
    public class HelloController {

        @GetMapping("/hello")
        public String hello() {
            return "Hello World!";
        }
    }

### Perché creare un controller

In Spring Boot, un **Controller** serve a gestire le richieste HTTP.

Senza controller: → il server partirebbe ma non risponderebbe a nessuna
rotta.

Il controller è quindi il componente che definisce cosa deve succedere
quando un client chiama un endpoint.

------------------------------------------------------------------------

### Spiegazione annotazioni

**@RestController** - indica che la classe gestisce richieste REST -
dice a Spring di registrarla automaticamente

**@GetMapping("/hello")** - associa l'URL `/hello` - risponde solo a
richieste HTTP GET

Quando un utente visita:

    http://localhost:8080/hello

Spring chiama il metodo `hello()` e restituisce il valore ritornato.

------------------------------------------------------------------------

## Avvio del progetto

Da terminale, nella cartella root:

    mvnw spring-boot:run

oppure su Windows:

    mvnw.cmd spring-boot:run

Se l'avvio è corretto, comparirà:

    Tomcat started on port 8080

------------------------------------------------------------------------

## Test endpoint

Aprire il browser:

    http://localhost:8080/hello

Output previsto:

    Hello World!
Altrimenti se l'output desiderato è Hello + Nome!
Aprire il browser:

    http://localhost:8080/hello/Nome

Output previsto:

    Hello Nome!

------------------------------------------------------------------------

## Obiettivo didattico

Questo progetto dimostra:

-   struttura base di un'app Spring Boot
-   creazione di un endpoint REST
-   funzionamento di controller e annotazioni
-   avvio server embedded

------------------------------------------------------------------------

**Autore:** Progetto di esercitazione personale su Spring Boot
