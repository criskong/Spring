package com.criskong.OrderApp.Controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;

import com.criskong.OrderApp.repository.FoodItemRepository;
import com.criskong.OrderApp.Entity.FoodItem;

@RestController
@RequestMapping("/api/foods")
public class FoodItemController {

    private final FoodItemRepository foodItemRepository;

    public FoodItemController(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    //Endpoint per ottenere tutti gli articoli alimentari
    @GetMapping
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }
    //Endpoint per creare un nuovo articolo alimentare
    @PostMapping
    public FoodItem createFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }
    //Endpoint per ottenere un articolo alimentare specifico per id
    @GetMapping("/{id}")
    public FoodItem getFoodItemById(@PathVariable Long id) {
        return foodItemRepository.findById(id).orElse(null);
    }

    //Endpoint per aggiornare un articolo alimentare esistente
    @PutMapping("/{id}")
    public FoodItem updateFoodItem(@PathVariable Long id, FoodItem foodItemDetails) {
        FoodItem foodItem = foodItemRepository.findById(id).orElse(null);
        if (foodItem != null) {
            foodItem.setName(foodItemDetails.getName());
            foodItem.setPrice(foodItemDetails.getPrice());
        }
        return foodItemRepository.save(foodItem);
    }

    //Endpoint per eliminare un articolo alimentare
    @DeleteMapping("/{id}")
    public void deleteFoodItem(@PathVariable Long id) {
        foodItemRepository.deleteById(id);
    }

}