package com.example.demo.repository;

import com.example.demo.model.WorkoutLog;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WorkoutLogRepository extends MongoRepository<WorkoutLog, String> {
    List<WorkoutLog> findByMemberId(String memberId);
    List<WorkoutLog> findByMemberIdOrderByDateDesc(String memberId);
    List<WorkoutLog> findByMemberIdAndType(String memberId, String type);
}
