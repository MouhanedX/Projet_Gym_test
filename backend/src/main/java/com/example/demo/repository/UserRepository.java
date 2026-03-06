package com.example.demo.repository;

import com.example.demo.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    List<User> findByGymId(String gymId);
    List<User> findByRoleAndCity(String role, String city);
    boolean existsByEmail(String email);
}
