package com.example.demo.controller;

import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getByUser(@PathVariable String userId) {
        return notificationRepository.findByUserIdOrderByDateEnvoiDesc(userId);
    }

    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnread(@PathVariable String userId) {
        return notificationRepository.findByUserIdAndLu(userId, false);
    }

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        notification.setDateEnvoi(Instant.now());
        if (notification.getLu() == null) {
            notification.setLu(false);
        }
        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return notificationRepository.findById(id)
                .map(notif -> {
                    notif.setLu(true);
                    return ResponseEntity.ok(notificationRepository.save(notif));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndLu(userId, false);
        for (Notification notif : unread) {
            notif.setLu(true);
            notificationRepository.save(notif);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
