package com.example.demo.controller;

import com.example.demo.model.Gym;
import com.example.demo.repository.GymRepository;
import com.example.demo.repository.UserRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gyms")
public class GymController {
    private final GymRepository gymRepository;
    private final UserRepository userRepository;

    public GymController(GymRepository gymRepository, UserRepository userRepository) {
        this.gymRepository = gymRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Gym> list() {
        return gymRepository.findAll();
    }

    @GetMapping("/active")
    public List<Gym> listActive() {
        return gymRepository.findByIsActive(true);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gym> get(@PathVariable String id) {
        return gymRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/owner/{ownerId}")
    public List<Gym> getByOwner(@PathVariable String ownerId) {
        return gymRepository.findByOwnerId(ownerId);
    }

    @GetMapping("/search")
    public List<Gym> search(@RequestParam String q) {
        return gymRepository.findByNameContainingIgnoreCase(q);
    }

    @PostMapping
    public ResponseEntity<Gym> create(@Valid @RequestBody Gym gym) {
        gym.setCreatedAt(Instant.now());
        gym.setIsActive(true);
        if (gym.getMemberCount() == null) gym.setMemberCount(0);
        if (gym.getRating() == null) gym.setRating(0.0);

        // Set owner name
        if (gym.getOwnerId() != null) {
            userRepository.findById(gym.getOwnerId())
                    .ifPresent(owner -> gym.setOwnerName(owner.getName()));
        }

        Gym saved = gymRepository.save(gym);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gym> update(@PathVariable String id, @Valid @RequestBody Gym update) {
        return gymRepository.findById(id)
                .map(existing -> {
                    existing.setName(update.getName());
                    existing.setDescription(update.getDescription());
                    existing.setAddress(update.getAddress());
                    existing.setCity(update.getCity());
                    existing.setPhone(update.getPhone());
                    existing.setAmenities(update.getAmenities());
                    existing.setOpeningHours(update.getOpeningHours());
                    existing.setMonthlyPrice(update.getMonthlyPrice());
                    existing.setImage(update.getImage());
                    existing.setImages(update.getImages());
                    existing.setLatitude(update.getLatitude());
                    existing.setLongitude(update.getLongitude());
                    existing.setCapacite(update.getCapacite());
                    if (update.getIsActive() != null) existing.setIsActive(update.getIsActive());
                    Gym saved = gymRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!gymRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        gymRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
