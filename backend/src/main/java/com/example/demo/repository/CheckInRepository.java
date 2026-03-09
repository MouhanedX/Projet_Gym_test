package com.example.demo.repository;

import com.example.demo.model.CheckIn;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CheckInRepository extends MongoRepository<CheckIn, String> {
    List<CheckIn> findByClientId(String clientId);
    List<CheckIn> findBySalleId(String salleId);
    List<CheckIn> findByClientIdOrderByDateHeureDesc(String clientId);
}
