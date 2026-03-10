package com.example.demo.controller;

import com.example.demo.model.GymBuddy;
import com.example.demo.model.User;
import com.example.demo.repository.GymBuddyRepository;
import com.example.demo.repository.GymRepository;
import com.example.demo.repository.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gymbuddy")
public class GymBuddyController {
    private final GymBuddyRepository gymBuddyRepository;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;

    public GymBuddyController(GymBuddyRepository gymBuddyRepository, UserRepository userRepository, GymRepository gymRepository) {
        this.gymBuddyRepository = gymBuddyRepository;
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
    }

    // List all active posts
    @GetMapping
    public List<GymBuddy> list() {
        return gymBuddyRepository.findByStatus("ACTIVE");
    }

    // Get specific post
    @GetMapping("/{id}")
    public ResponseEntity<GymBuddy> get(@PathVariable String id) {
        return gymBuddyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get my posts
    @GetMapping("/my/{clientId}")
    public List<GymBuddy> getMyPosts(@PathVariable String clientId) {
        return gymBuddyRepository.findByClientId(clientId);
    }

    // Get other members' posts
    @GetMapping("/others/{clientId}")
    public List<GymBuddy> getOthersPosts(@PathVariable String clientId) {
        return gymBuddyRepository.findByStatus("ACTIVE")
                .stream()
                .filter(post -> post.getClientId() != null && !post.getClientId().equals(clientId))
                .collect(Collectors.toList());
    }

    // Get posts by gym
    @GetMapping("/gym/{gymId}")
    public List<GymBuddy> getByGym(@PathVariable String gymId) {
        return gymBuddyRepository.findByStatusAndGymId("ACTIVE", gymId);
    }

    // Create new post
    @PostMapping
    public ResponseEntity<?> create(@RequestBody GymBuddy gymBuddy) {
        // Verify user exists
        var userOpt = userRepository.findById(gymBuddy.getClientId());
        if (userOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        User user = userOpt.get();
        gymBuddy.setClientName(user.getName());
        gymBuddy.setClientAvatar(user.getAvatar());

        // Verify gym exists if provided
        if (gymBuddy.getGymId() != null && !gymBuddy.getGymId().isEmpty()) {
            var gymOpt = gymRepository.findById(gymBuddy.getGymId());
            if (gymOpt.isPresent()) {
                gymBuddy.setGymName(gymOpt.get().getName());
            }
        }

        gymBuddy.setStatus("ACTIVE");
        gymBuddy.setCreatedAt(Instant.now());
        gymBuddy.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(gymBuddyRepository.save(gymBuddy));
    }

    // Update post
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody GymBuddy updated) {
        var existingOpt = gymBuddyRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GymBuddy existing = existingOpt.get();
        
        // Only owner can update
        if (!existing.getClientId().equals(updated.getClientId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setSpecifications(updated.getSpecifications());
        existing.setStatus(updated.getStatus());
        existing.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(gymBuddyRepository.save(existing));
    }

    // Delete post
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        var existingOpt = gymBuddyRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GymBuddy existing = existingOpt.get();
        existing.setStatus("CLOSED");
        existing.setUpdatedAt(Instant.now());
        gymBuddyRepository.save(existing);

        return ResponseEntity.ok().build();
    }

    // Mark as matched / interested
    @PostMapping("/{id}/match/{matchedPostId}")
    public ResponseEntity<?> addMatch(@PathVariable String id, @PathVariable String matchedPostId) {
        var existingOpt = gymBuddyRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GymBuddy existing = existingOpt.get();
        if (existing.getMatches() == null) {
            existing.setMatches(new java.util.ArrayList<>());
        }

        if (!existing.getMatches().contains(matchedPostId)) {
            existing.getMatches().add(matchedPostId);
        }

        existing.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(gymBuddyRepository.save(existing));
    }
}
