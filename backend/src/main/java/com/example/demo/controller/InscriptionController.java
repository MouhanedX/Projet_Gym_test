package com.example.demo.controller;

import com.example.demo.model.Inscription;
import com.example.demo.repository.InscriptionRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inscriptions")
public class InscriptionController {
    private final InscriptionRepository inscriptionRepository;

    public InscriptionController(InscriptionRepository inscriptionRepository) {
        this.inscriptionRepository = inscriptionRepository;
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
                    String newStatut = body.get("statut");
                    inscription.setStatut(newStatut);
                    if ("ACCEPTEE".equals(newStatut) && inscription.getPaiementStatut() == null) {
                        inscription.setPaiementStatut("NON_PAYE");
                    }
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

    @PutMapping("/{id}/paiement-statut")
    public ResponseEntity<Inscription> updatePaiementStatut(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return inscriptionRepository.findById(id)
                .map(inscription -> {
                    inscription.setPaiementStatut(body.get("paiementStatut"));
                    return ResponseEntity.ok(inscriptionRepository.save(inscription));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
