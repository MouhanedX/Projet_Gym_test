package com.example.demo.repository;

import com.example.demo.model.Challenge;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChallengeRepository extends MongoRepository<Challenge, String> {
    List<Challenge> findByClientId(String clientId);
    List<Challenge> findByStatut(String statut);
}
