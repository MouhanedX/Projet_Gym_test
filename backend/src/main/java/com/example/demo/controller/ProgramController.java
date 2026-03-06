package com.example.demo.controller;

import com.example.demo.model.Program;
import com.example.demo.repository.ProgramRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {
    private final ProgramRepository programRepository;

    public ProgramController(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    @GetMapping
    public List<Program> list() {
        return programRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Program> get(@PathVariable String id) {
        return programRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/gym/{gymId}")
    public List<Program> getByGym(@PathVariable String gymId) {
        return programRepository.findByGymId(gymId);
    }

    @GetMapping("/coach/{coachId}")
    public List<Program> getByCoach(@PathVariable String coachId) {
        return programRepository.findByCoachId(coachId);
    }

    @GetMapping("/type/{type}")
    public List<Program> getByType(@PathVariable String type) {
        return programRepository.findByType(type);
    }

    @PostMapping
    public ResponseEntity<Program> create(@Valid @RequestBody Program program) {
        program.setCreatedAt(Instant.now());
        program.setIsActive(true);
        if (program.getEnrolledCount() == null) program.setEnrolledCount(0);
        Program saved = programRepository.save(program);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Program> update(@PathVariable String id, @Valid @RequestBody Program update) {
        return programRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(update.getTitle());
                    existing.setDescription(update.getDescription());
                    existing.setType(update.getType());
                    existing.setDifficulty(update.getDifficulty());
                    existing.setDaysOfWeek(update.getDaysOfWeek());
                    existing.setStartTime(update.getStartTime());
                    existing.setEndTime(update.getEndTime());
                    existing.setCapacity(update.getCapacity());
                    existing.setPrice(update.getPrice());
                    existing.setImage(update.getImage());
                    if (update.getCoachId() != null) existing.setCoachId(update.getCoachId());
                    if (update.getCoachName() != null) existing.setCoachName(update.getCoachName());
                    if (update.getIsActive() != null) existing.setIsActive(update.getIsActive());
                    Program saved = programRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/enroll")
    public ResponseEntity<Program> enroll(@PathVariable String id) {
        return programRepository.findById(id)
                .map(program -> {
                    int enrolled = program.getEnrolledCount() != null ? program.getEnrolledCount() : 0;
                    int capacity = program.getCapacity() != null ? program.getCapacity() : Integer.MAX_VALUE;
                    if (enrolled >= capacity) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).<Program>build();
                    }
                    program.setEnrolledCount(enrolled + 1);
                    Program saved = programRepository.save(program);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!programRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        programRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
