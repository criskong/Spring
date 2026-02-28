# OrderApp Spring Boot Project

## Descrizione

Questo progetto è un'applicazione **Spring Boot** che gestisce un semplice sistema di ordini alimentari, permettendo di creare, leggere, aggiornare ed eliminare articoli alimentari (`FoodItem`) tramite API REST.

L'applicazione è collegata a un database **MySQL**, e tutte le operazioni CRUD aggiornano automaticamente le tabelle corrispondenti.

---

## Struttura del progetto

Il progetto utilizza **Maven** come gestore di dipendenze e **Spring Boot** per creare rapidamente un servizio REST.
È composto da tre componenti principali:

1. **Entità (`FoodItem`)**
2. **Repository (`FoodItemRepository`)**
3. **Controller (`FoodItemController`)**

---

## Classe principale

`OrderAppApplication.java`

```java
@SpringBootApplication
public class OrderAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderAppApplication.class, args);
    }
}
```

### Funzione

* Punto di ingresso dell'applicazione.
* `@SpringBootApplication` abilita:

  * configurazione automatica di Spring Boot
  * scansione dei componenti (`@Entity`, `@Controller`, `@Repository`, ecc.)
  * inizializzazione del contesto applicativo.
* Avvia il server embedded **Tomcat**.

---

## Entità: `FoodItem`

```java
@Entity
public class FoodItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private double price;
    
    // costruttori, getter e setter
}
```

### Funzione

* Rappresenta la tabella `food_item` nel database.
* Ogni oggetto `FoodItem` corrisponde a una riga della tabella.
* `@Id` e `@GeneratedValue` permettono a MySQL di generare automaticamente l'ID.
* Include costruttori e metodi getter/setter per leggere e modificare i dati.

---

## Repository: `FoodItemRepository`

```java
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {}
```

### Funzione

* Strato di accesso ai dati.
* Estende `JpaRepository` per avere metodi CRUD già pronti:

  * `findAll()`, `findById()`, `save()`, `deleteById()`
* Spring Boot genera automaticamente l'implementazione concreta.

---

## Controller: `FoodItemController`

```java
@RestController
@RequestMapping("/api/foods")
public class FoodItemController {

    private final FoodItemRepository foodItemRepository;

    public FoodItemController(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @GetMapping
    public List<FoodItem> getAllFoodItems() { ... }

    @PostMapping
    public FoodItem createFoodItem(@RequestBody FoodItem foodItem) { ... }

    @GetMapping("/{id}")
    public FoodItem getFoodItemById(@PathVariable Long id) { ... }

    @PutMapping("/{id}")
    public FoodItem updateFoodItem(@PathVariable Long id, @RequestBody FoodItem foodItemDetails) { ... }

    @DeleteMapping("/{id}")
    public void deleteFoodItem(@PathVariable Long id) { ... }
}
```

### Funzione

* Gestisce tutte le richieste HTTP verso `/api/foods`.
* Gli endpoint supportano le operazioni CRUD:

  * `GET /api/foods` → restituisce tutti i prodotti
  * `POST /api/foods` → crea un nuovo prodotto
  * `GET /api/foods/{id}` → legge un prodotto specifico
  * `PUT /api/foods/{id}` → aggiorna un prodotto
  * `DELETE /api/foods/{id}` → elimina un prodotto
* I dati sono scambiati in formato **JSON**.

---

## Connessione a MySQL

L'applicazione è configurata per utilizzare **MySQL** tramite `application.properties`:

```properties
spring.application.name=OrderApp
spring.datasource.url=jdbc:mysql://localhost:3306/springboot_curd
spring.datasource.username=root
spring.datasource.password=root

# Aggiornamento automatico delle tabelle
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### Dettagli

* Il database `springboot_curd` viene aggiornato automaticamente quando l'applicazione parte.
* `spring.jpa.show-sql=true` permette di vedere le query SQL eseguite da Hibernate.
* `ddl-auto=update` aggiorna la struttura delle tabelle senza cancellare i dati esistenti.

---

## `pom.xml`

* Contiene tutte le dipendenze necessarie:

  * `spring-boot-starter-data-jpa` → per JPA e repository
  * `spring-boot-starter-web` → per il server web e controller REST
  * `mysql-connector-java` → driver per connettersi a MySQL
  * Plugin Spring Boot per build e esecuzione

---

## Test API con Postman

Tutte le operazioni CRUD sono state testate con **Postman**:

* `GET /api/foods` → restituisce lista dei prodotti
* `POST /api/foods` → crea nuovi prodotti, aggiornando il database
* `PUT /api/foods/{id}` → aggiorna prodotti esistenti
* `DELETE /api/foods/{id}` → elimina prodotti

Le modifiche vengono riflesse direttamente nel database MySQL.

---

## Avvio del progetto

Da terminale nella cartella del progetto:

```bash
./mvnw spring-boot:run
```

Oppure su Windows:

```bash
mvnw.cmd spring-boot:run
```

Il server parte su `http://localhost:8080`.

---

## Obiettivi didattici

Questo progetto dimostra:

* Struttura base di un'applicazione Spring Boot con MySQL
* Creazione di entità e mapping JPA
* Uso dei repository per le operazioni CRUD
* Creazione di controller REST e gestione delle richieste HTTP
* Collegamento e aggiornamento di un database MySQL
* Test delle API con Postman

---

**Autore:** Progetto di esercitazione personale su Spring Boot, MySQL e REST API

---

## Diagramma del flusso CRUD

```text
[Client HTTP / Postman]
          |
          v
[FoodItemController] ---> [FoodItemRepository] ---> [MySQL Database]
          ^                                     |
          |-------------------------------------|
```

* Le richieste HTTP passano dal controller al repository, che aggiorna o legge dal database.
* Le risposte tornano al client come JSON.
