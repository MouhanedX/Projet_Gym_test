package com.example.demo.controller;

import com.example.demo.model.Avis;
import com.example.demo.repository.AvisRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avis")
public class AvisController {
    private final AvisRepository avisRepository;

    public AvisController(AvisRepository avisRepository) {
        this.avisRepository = avisRepository;
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
        return avisRepository.save(avis);
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
        if (avisRepository.existsById(id)) {
            avisRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
