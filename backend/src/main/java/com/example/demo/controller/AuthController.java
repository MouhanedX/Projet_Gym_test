package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        user.setCreatedAt(Instant.now());
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("MEMBER");
        }
        User saved = userRepository.save(user);
        // Don't return password
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Don't return password
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable String id, @RequestBody User update) {
        return userRepository.findById(id)
                .map(existing -> {
                    if (update.getName() != null) existing.setName(update.getName());
                    if (update.getPhone() != null) existing.setPhone(update.getPhone());
                    if (update.getBio() != null) existing.setBio(update.getBio());
                    if (update.getCity() != null) existing.setCity(update.getCity());
                    if (update.getAvatar() != null) existing.setAvatar(update.getAvatar());
                    if (update.getSpecialties() != null) existing.setSpecialties(update.getSpecialties());
                    if (update.getExperienceYears() != null) existing.setExperienceYears(update.getExperienceYears());
                    User saved = userRepository.save(existing);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
