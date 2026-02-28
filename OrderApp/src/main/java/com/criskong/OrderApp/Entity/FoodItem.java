package main.java.com.criskong.OrderApp.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType; 
import jakarta.persistence.Id;

/**
 * Questa classe rappresenta l'entità FoodItem nel database.
 * 
 * In Spring Boot con JPA:
 * - Un'entità è una classe che mappa una tabella del database.
 * - Ogni istanza corrisponde a una riga nella tabella.
 **/

@Entity
public class FoodItem {



    //Genera automaticamente l'id del prodotto
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int id;
    private String name;
    private double price;

    //costruttore vuoto
    public FoodItem(){

    }
    //costruttore default
    public FoodItem(int id, String name, double price){
            this.id = id;
            this.name = name;
            this.price = price;
    }
    
    public int getId(){
        return id;
    }
    public void setId(int id){
        this.id = id;
    }

       public String getName(){
        return name;
    }
    public void setName(String name){
        this.name = name;
    }

           public double getPrice(){
        return price;
    }
    public void setPrice(double price){
        this.price = price;
    }


}
