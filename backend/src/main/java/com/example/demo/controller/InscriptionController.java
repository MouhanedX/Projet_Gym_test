package com.example.demo.controller;

import com.example.demo.model.Inscription;
import com.example.demo.model.Paiement;
import com.example.demo.repository.InscriptionRepository;
import com.example.demo.repository.PaiementRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inscriptions")
public class InscriptionController {
    private final InscriptionRepository inscriptionRepository;
    private final PaiementRepository paiementRepository;

    public InscriptionController(InscriptionRepository inscriptionRepository, PaiementRepository paiementRepository) {
        this.inscriptionRepository = inscriptionRepository;
        this.paiementRepository = paiementRepository;
    }

    @GetMapping
    public List<Inscription> list() {
        return inscriptionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inscription> get(@PathVariable String id) {
        return inscriptionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Inscription> getByClient(@PathVariable String clientId) {
        return inscriptionRepository.findByClientId(clientId);
    }

    @GetMapping("/salle/{salleId}")
    public List<Inscription> getBySalle(@PathVariable String salleId) {
        return inscriptionRepository.findBySalleId(salleId);
    }

    @GetMapping("/proprietaire/{proprietaireId}")
    public List<Inscription> getByProprietaire(@PathVariable String proprietaireId) {
        return inscriptionRepository.findByProprietaireId(proprietaireId);
    }

    @PostMapping
    public Inscription create(@RequestBody Inscription inscription) {
        inscription.setDateDemande(Instant.now());
        if (inscription.getStatut() == null) {
            inscription.setStatut("EN_ATTENTE");
        }
        return inscriptionRepository.save(inscription);
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Inscription> updateStatut(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return inscriptionRepository.findById(id)
                .map(inscription -> {
                    inscription.setStatut(body.get("statut"));
                    return ResponseEntity.ok(inscriptionRepository.save(inscription));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (inscriptionRepository.existsById(id)) {
            inscriptionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
