package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/coaches")
    public List<User> getCoaches() {
        return userRepository.findByRole("COACH").stream()
                .peek(u -> u.setPassword(null))
                .collect(Collectors.toList());
    }

    @GetMapping("/coaches/gym/{gymId}")
    public List<User> getCoachesByGym(@PathVariable String gymId) {
        return userRepository.findByGymId(gymId).stream()
                .filter(u -> "COACH".equals(u.getRole()))
                .peek(u -> u.setPassword(null))
                .collect(Collectors.toList());
    }

    @GetMapping("/members")
    public List<User> getMembers() {
        return userRepository.findByRole("MEMBER").stream()
                .peek(u -> u.setPassword(null))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> get(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
                .map(existing -> {
                    if (updatedUser.getName() != null) existing.setName(updatedUser.getName());
                    if (updatedUser.getPhone() != null) existing.setPhone(updatedUser.getPhone());
                    if (updatedUser.getBio() != null) existing.setBio(updatedUser.getBio());
                    if (updatedUser.getCity() != null) existing.setCity(updatedUser.getCity());
                    if (updatedUser.getAddress() != null) existing.setAddress(updatedUser.getAddress());
                    if (updatedUser.getLatitude() != null) existing.setLatitude(updatedUser.getLatitude());
                    if (updatedUser.getLongitude() != null) existing.setLongitude(updatedUser.getLongitude());
                    if (updatedUser.getAvatar() != null) existing.setAvatar(updatedUser.getAvatar());
                    if (updatedUser.getPointsFidelite() != null) existing.setPointsFidelite(updatedUser.getPointsFidelite());
                    User saved = userRepository.save(existing);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
