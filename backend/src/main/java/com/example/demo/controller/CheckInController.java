package com.example.demo.controller;

import com.example.demo.model.CheckIn;
import com.example.demo.model.User;
import com.example.demo.repository.CheckInRepository;
import com.example.demo.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkins")
public class CheckInController {
    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;

    public CheckInController(CheckInRepository checkInRepository, UserRepository userRepository) {
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CheckIn> list() {
        return checkInRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CheckIn> get(@PathVariable String id) {
        return checkInRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<CheckIn> getByClient(@PathVariable String clientId) {
        return checkInRepository.findByClientIdOrderByDateHeureDesc(clientId);
    }

    @GetMapping("/salle/{salleId}")
    public List<CheckIn> getBySalle(@PathVariable String salleId) {
        return checkInRepository.findBySalleId(salleId);
    }

    @PostMapping
    public CheckIn create(@RequestBody CheckIn checkIn) {
        checkIn.setDateHeure(Instant.now());
        if (checkIn.getPointsGagnes() == null) {
            checkIn.setPointsGagnes(10); // Default points per check-in
        }
        CheckIn saved = checkInRepository.save(checkIn);
        // Update user's loyalty points
        userRepository.findById(checkIn.getClientId()).ifPresent(user -> {
            int current = user.getPointsFidelite() != null ? user.getPointsFidelite() : 0;
            user.setPointsFidelite(current + saved.getPointsGagnes());
            userRepository.save(user);
        });
        return saved;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (checkInRepository.existsById(id)) {
            checkInRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
