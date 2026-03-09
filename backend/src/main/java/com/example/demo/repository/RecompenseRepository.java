package com.example.demo.repository;

import com.example.demo.model.Recompense;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RecompenseRepository extends MongoRepository<Recompense, String> {
    List<Recompense> findBySalleIdsContaining(String salleId);
}
