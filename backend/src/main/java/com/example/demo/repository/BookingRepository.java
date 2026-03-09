package com.example.demo.repository;

import com.example.demo.model.Booking;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByMemberId(String memberId);
    List<Booking> findByProgramId(String programId);
    List<Booking> findByGymId(String gymId);
    List<Booking> findByCoachId(String coachId);
    List<Booking> findByStatus(String status);
    List<Booking> findByMemberIdAndStatus(String memberId, String status);
    List<Booking> findByGymIdAndStatus(String gymId, String status);
    boolean existsByMemberIdAndProgramIdAndDateAndStatusNot(String memberId, String programId, String date, String status);
}
