package com.example.demo.controller;

import com.example.demo.model.Challenge;
import com.example.demo.repository.ChallengeRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {
    private final ChallengeRepository challengeRepository;

    public ChallengeController(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    @GetMapping
    public List<Challenge> list() {
        return challengeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Challenge> get(@PathVariable String id) {
        return challengeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Challenge> getByClient(@PathVariable String clientId) {
        return challengeRepository.findByClientId(clientId);
    }

    @PostMapping
    public Challenge create(@RequestBody Challenge challenge) {
        if (challenge.getStatut() == null) {
            challenge.setStatut("EN_COURS");
        }
        if (challenge.getDateDebut() == null) {
            challenge.setDateDebut(Instant.now());
        }
        return challengeRepository.save(challenge);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Challenge> update(@PathVariable String id, @RequestBody Challenge challenge) {
        return challengeRepository.findById(id)
                .map(existing -> {
                    challenge.setId(id);
                    return ResponseEntity.ok(challengeRepository.save(challenge));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Challenge> updateStatut(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return challengeRepository.findById(id)
                .map(challenge -> {
                    challenge.setStatut(body.get("statut"));
                    return ResponseEntity.ok(challengeRepository.save(challenge));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (challengeRepository.existsById(id)) {
            challengeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
