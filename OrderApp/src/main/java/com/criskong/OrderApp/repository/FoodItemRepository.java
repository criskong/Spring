package com.criskong.OrderApp.repository;

/**
 * Questo è un repository Spring Data JPA per l'entità FoodItem.
 * 
 * Un repository in Spring Boot serve come strato di accesso ai dati,
 * permettendo di eseguire operazioni CRUD (Create, Read, Update, Delete)
 * e query sul database senza dover scrivere manualmente SQL.
 **/

import org.springframework.data.jpa.repository.JpaRepository;
import com.criskong.OrderApp.Entity.FoodItem;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    
}
