package com.example.demo.controller;

import com.example.demo.model.CoachGymRequest;
import com.example.demo.repository.CoachGymRequestRepository;
import com.example.demo.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach-gym-requests")
public class CoachGymRequestController {

    private final CoachGymRequestRepository requestRepository;
    private final UserRepository userRepository;

    public CoachGymRequestController(CoachGymRequestRepository requestRepository, UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CoachGymRequest> list() {
        return requestRepository.findAll();
    }

    @GetMapping("/coach/{coachId}")
    public List<CoachGymRequest> getByCoach(@PathVariable String coachId) {
        return requestRepository.findByCoachId(coachId);
    }

    @GetMapping("/gym/{gymId}")
    public List<CoachGymRequest> getByGym(@PathVariable String gymId) {
        return requestRepository.findByGymId(gymId);
    }

    @GetMapping("/owner/{ownerId}")
    public List<CoachGymRequest> getByOwner(@PathVariable String ownerId) {
        return requestRepository.findByOwnerId(ownerId);
    }

    @GetMapping("/owner/{ownerId}/pending")
    public List<CoachGymRequest> getPendingByOwner(@PathVariable String ownerId) {
        return requestRepository.findByOwnerIdAndStatut(ownerId, "EN_ATTENTE");
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CoachGymRequest request) {
        // Prevent duplicate pending request
        List<CoachGymRequest> existing = requestRepository.findByCoachIdAndGymId(request.getCoachId(), request.getGymId());
        boolean hasPending = existing.stream().anyMatch(r -> "EN_ATTENTE".equals(r.getStatut()));
        if (hasPending) {
            return ResponseEntity.badRequest().body(Map.of("error", "Une demande est déjà en attente pour cette salle."));
        }
        request.setStatut("EN_ATTENTE");
        request.setCreatedAt(Instant.now());
        return ResponseEntity.ok(requestRepository.save(request));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<CoachGymRequest> accept(@PathVariable String id) {
        return requestRepository.findById(id)
                .map(req -> {
                    req.setStatut("ACCEPTEE");
                    // Update the coach's gymId
                    userRepository.findById(req.getCoachId()).ifPresent(coach -> {
                        coach.setGymId(req.getGymId());
                        userRepository.save(coach);
                    });
                    return ResponseEntity.ok(requestRepository.save(req));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<CoachGymRequest> reject(@PathVariable String id) {
        return requestRepository.findById(id)
                .map(req -> {
                    req.setStatut("REFUSEE");
                    return ResponseEntity.ok(requestRepository.save(req));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (requestRepository.existsById(id)) {
            requestRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
