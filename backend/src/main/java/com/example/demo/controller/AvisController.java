package com.example.demo.controller;

import com.example.demo.model.Avis;
import com.example.demo.repository.AvisRepository;
import com.example.demo.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avis")
public class AvisController {
    private final AvisRepository avisRepository;
    private final UserRepository userRepository;

    public AvisController(AvisRepository avisRepository, UserRepository userRepository) {
        this.avisRepository = avisRepository;
        this.userRepository = userRepository;
    }

    /** Recompute average rating for a coach from all their avis and save it. */
    private void recalcCoachRating(String coachId) {
        if (coachId == null) return;
        List<Avis> allAvis = avisRepository.findByCoachId(coachId);
        if (allAvis.isEmpty()) {
            userRepository.findById(coachId).ifPresent(u -> { u.setRating(null); userRepository.save(u); });
            return;
        }
        double avg = allAvis.stream().mapToInt(a -> a.getNote() != null ? a.getNote() : 0).average().orElse(0);
        double rounded = Math.round(avg * 10.0) / 10.0;
        userRepository.findById(coachId).ifPresent(u -> { u.setRating(rounded); userRepository.save(u); });
    }

    @GetMapping
    public List<Avis> list() {
        return avisRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avis> get(@PathVariable String id) {
        return avisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Avis> getByClient(@PathVariable String clientId) {
        return avisRepository.findByClientId(clientId);
    }

    @GetMapping("/salle/{salleId}")
    public List<Avis> getBySalle(@PathVariable String salleId) {
        return avisRepository.findBySalleId(salleId);
    }

    @GetMapping("/coach/{coachId}")
    public List<Avis> getByCoach(@PathVariable String coachId) {
        return avisRepository.findByCoachId(coachId);
    }

    @PostMapping
    public Avis create(@RequestBody Avis avis) {
        avis.setDate(Instant.now());
        Avis saved = avisRepository.save(avis);
        if (saved.getCoachId() != null) recalcCoachRating(saved.getCoachId());
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Avis> update(@PathVariable String id, @RequestBody Avis update) {
        return avisRepository.findById(id)
                .map(existing -> {
                    if (update.getNote() != null) existing.setNote(update.getNote());
                    if (update.getCommentaire() != null) existing.setCommentaire(update.getCommentaire());
                    return ResponseEntity.ok(avisRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return avisRepository.findById(id).map(avis -> {
            String coachId = avis.getCoachId();
            avisRepository.deleteById(id);
            if (coachId != null) recalcCoachRating(coachId);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
