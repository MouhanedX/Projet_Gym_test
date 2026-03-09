package com.example.demo.controller;

import com.example.demo.model.Paiement;
import com.example.demo.repository.PaiementRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/paiements")
public class PaiementController {
    private final PaiementRepository paiementRepository;

    public PaiementController(PaiementRepository paiementRepository) {
        this.paiementRepository = paiementRepository;
    }

    @GetMapping
    public List<Paiement> list() {
        return paiementRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paiement> get(@PathVariable String id) {
        return paiementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Paiement> getByClient(@PathVariable String clientId) {
        return paiementRepository.findByClientId(clientId);
    }

    @GetMapping("/inscription/{inscriptionId}")
    public List<Paiement> getByInscription(@PathVariable String inscriptionId) {
        return paiementRepository.findByInscriptionId(inscriptionId);
    }

    @PostMapping
    public Paiement create(@RequestBody Paiement paiement) {
        paiement.setDatePaiement(Instant.now());
        if (paiement.getStatut() == null) {
            paiement.setStatut("EN_ATTENTE");
        }
        return paiementRepository.save(paiement);
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Paiement> updateStatut(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return paiementRepository.findById(id)
                .map(paiement -> {
                    paiement.setStatut(body.get("statut"));
                    return ResponseEntity.ok(paiementRepository.save(paiement));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (paiementRepository.existsById(id)) {
            paiementRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
