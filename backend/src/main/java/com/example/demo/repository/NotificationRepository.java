package com.example.demo.repository;

import com.example.demo.model.Notification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);
    List<Notification> findByUserIdAndLu(String userId, Boolean lu);
    List<Notification> findByUserIdOrderByDateEnvoiDesc(String userId);
}
