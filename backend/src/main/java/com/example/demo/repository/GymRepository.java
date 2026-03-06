package com.example.demo.repository;

import com.example.demo.model.Gym;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GymRepository extends MongoRepository<Gym, String> {
    List<Gym> findByOwnerId(String ownerId);
    List<Gym> findByCity(String city);
    List<Gym> findByIsActive(Boolean isActive);
    List<Gym> findByNameContainingIgnoreCase(String name);
}
