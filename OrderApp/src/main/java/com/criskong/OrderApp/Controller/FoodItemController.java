package com.criskong.OrderApp.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.criskong.OrderApp.repository.FoodItemRepository;
import com.criskong.OrderApp.Entity.FoodItem;

/**
 * Questa classe rappresenta un Controller in Spring.
 *
 * In Spring Boot:
 * - Un Controller gestisce le richieste HTTP provenienti dal client (browser o API consumer).
 * - Riceve le richieste tramite endpoint definiti con annotazioni come @GetMapping, @PostMapping, ecc.
 * - Elabora la richiesta (spesso delegando la logica ai Service).
 * - Restituisce una risposta al client (una view, JSON, o altri dati).
 */

@RestController
@RequestMapping("/api/foods")
public class FoodItemController {

    private final FoodItemRepository foodItemRepository;

    public FoodItemController(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    // GET /api/foods — tutti gli articoli
    @GetMapping
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    // POST /api/foods — crea un nuovo articolo
    @PostMapping
    public FoodItem createFoodItem(@RequestBody FoodItem foodItem) { // ← aggiunto @RequestBody
        return foodItemRepository.save(foodItem);
    }

    // GET /api/foods/{id} — articolo per id
    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItemById(@PathVariable Long id) {
        return foodItemRepository.findById(id)
                .map(ResponseEntity::ok)                        // ← restituisce 200 con il dato
                .orElse(ResponseEntity.notFound().build());     // ← restituisce 404 se non trovato
    }

    // PUT /api/foods/{id} — aggiorna un articolo esistente
    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItem foodItemDetails) {            // ← aggiunto @RequestBody

        return foodItemRepository.findById(id)
                .map(foodItem -> {
                    foodItem.setName(foodItemDetails.getName());
                    foodItem.setPrice(foodItemDetails.getPrice());
                    return ResponseEntity.ok(foodItemRepository.save(foodItem));
                })
                .orElse(ResponseEntity.notFound().build());     // ← evita save(null)
    }

    // DELETE /api/foods/{id} — elimina un articolo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        if (!foodItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();           // ← 404 se non esiste
        }
        foodItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();              // ← 204 No Content
    }
}