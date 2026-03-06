package com.example.demo.repository;

import com.example.demo.model.Program;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProgramRepository extends MongoRepository<Program, String> {
    List<Program> findByGymId(String gymId);
    List<Program> findByCoachId(String coachId);
    List<Program> findByType(String type);
    List<Program> findByDifficulty(String difficulty);
    List<Program> findByIsActive(Boolean isActive);
    List<Program> findByGymIdAndIsActive(String gymId, Boolean isActive);
}
