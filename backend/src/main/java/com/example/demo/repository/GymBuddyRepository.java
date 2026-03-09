package com.example.demo.repository;

import com.example.demo.model.GymBuddy;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GymBuddyRepository extends MongoRepository<GymBuddy, String> {
    List<GymBuddy> findByClientId(String clientId);
    List<GymBuddy> findByGymId(String gymId);
    List<GymBuddy> findByStatus(String status);
    List<GymBuddy> findByStatusAndGymId(String status, String gymId);
}
