package com.example.demo.controller;

import com.example.demo.model.Recompense;
import com.example.demo.repository.RecompenseRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recompenses")
public class RecompenseController {
    private final RecompenseRepository recompenseRepository;

    public RecompenseController(RecompenseRepository recompenseRepository) {
        this.recompenseRepository = recompenseRepository;
    }

    @GetMapping
    public List<Recompense> list() {
        return recompenseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recompense> get(@PathVariable String id) {
        return recompenseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/salle/{salleId}")
    public List<Recompense> getBySalle(@PathVariable String salleId) {
        return recompenseRepository.findBySalleIdsContaining(salleId);
    }

    @PostMapping
    public Recompense create(@RequestBody Recompense recompense) {
        return recompenseRepository.save(recompense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recompense> update(@PathVariable String id, @RequestBody Recompense update) {
        return recompenseRepository.findById(id)
                .map(existing -> {
                    if (update.getTitre() != null) existing.setTitre(update.getTitre());
                    if (update.getDescription() != null) existing.setDescription(update.getDescription());
                    if (update.getCoutEnPoints() != null) existing.setCoutEnPoints(update.getCoutEnPoints());
                    if (update.getPartenaireFournisseur() != null) existing.setPartenaireFournisseur(update.getPartenaireFournisseur());
                    if (update.getSalleIds() != null) existing.setSalleIds(update.getSalleIds());
                    return ResponseEntity.ok(recompenseRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (recompenseRepository.existsById(id)) {
            recompenseRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
