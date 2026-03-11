package com.example.demo.repository;

import com.example.demo.model.CoachGymRequest;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CoachGymRequestRepository extends MongoRepository<CoachGymRequest, String> {
    List<CoachGymRequest> findByCoachId(String coachId);
    List<CoachGymRequest> findByGymId(String gymId);
    List<CoachGymRequest> findByOwnerId(String ownerId);
    List<CoachGymRequest> findByOwnerIdAndStatut(String ownerId, String statut);
    List<CoachGymRequest> findByCoachIdAndGymId(String coachId, String gymId);
}
