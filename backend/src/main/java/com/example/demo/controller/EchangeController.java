package com.example.demo.controller;

import com.example.demo.model.Echange;
import com.example.demo.model.Recompense;
import com.example.demo.model.User;
import com.example.demo.repository.EchangeRepository;
import com.example.demo.repository.RecompenseRepository;
import com.example.demo.repository.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/echanges")
public class EchangeController {
    private final EchangeRepository echangeRepository;
    private final RecompenseRepository recompenseRepository;
    private final UserRepository userRepository;

    public EchangeController(EchangeRepository echangeRepository, RecompenseRepository recompenseRepository, UserRepository userRepository) {
        this.echangeRepository = echangeRepository;
        this.recompenseRepository = recompenseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Echange> list() {
        return echangeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Echange> get(@PathVariable String id) {
        return echangeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Echange> getByClient(@PathVariable String clientId) {
        return echangeRepository.findByClientId(clientId);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Echange echange) {
        // Verify user has enough points
        var userOpt = userRepository.findById(echange.getClientId());
        if (userOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        var recompenseOpt = recompenseRepository.findById(echange.getRecompenseId());
        if (recompenseOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Reward not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        User user = userOpt.get();
        Recompense recompense = recompenseOpt.get();
        int points = user.getPointsFidelite() != null ? user.getPointsFidelite() : 0;

        if (points < recompense.getCoutEnPoints()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Not enough points");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Deduct points
        user.setPointsFidelite(points - recompense.getCoutEnPoints());
        userRepository.save(user);

        // Create exchange with promo code
        echange.setDateEchange(Instant.now());
        echange.setRecompenseTitre(recompense.getTitre());
        echange.setCodePromoGenere("PROMO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return ResponseEntity.ok(echangeRepository.save(echange));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (echangeRepository.existsById(id)) {
            echangeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
