package com.example.demo.repository;

import com.example.demo.model.Avis;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AvisRepository extends MongoRepository<Avis, String> {
    List<Avis> findByClientId(String clientId);
    List<Avis> findBySalleId(String salleId);
    List<Avis> findByCoachId(String coachId);
}
