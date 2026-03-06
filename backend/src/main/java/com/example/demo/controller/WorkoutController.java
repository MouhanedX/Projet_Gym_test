package com.example.demo.controller;

import com.example.demo.model.WorkoutLog;
import com.example.demo.repository.WorkoutLogRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {
    private final WorkoutLogRepository workoutLogRepository;

    public WorkoutController(WorkoutLogRepository workoutLogRepository) {
        this.workoutLogRepository = workoutLogRepository;
    }

    @GetMapping
    public List<WorkoutLog> list() {
        return workoutLogRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutLog> get(@PathVariable String id) {
        return workoutLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public List<WorkoutLog> getByMember(@PathVariable String memberId) {
        return workoutLogRepository.findByMemberIdOrderByDateDesc(memberId);
    }

    @PostMapping
    public ResponseEntity<WorkoutLog> create(@Valid @RequestBody WorkoutLog log) {
        log.setCreatedAt(Instant.now());
        WorkoutLog saved = workoutLogRepository.save(log);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutLog> update(@PathVariable String id, @Valid @RequestBody WorkoutLog update) {
        return workoutLogRepository.findById(id)
                .map(existing -> {
                    existing.setDate(update.getDate());
                    existing.setType(update.getType());
                    existing.setExercises(update.getExercises());
                    existing.setDurationMinutes(update.getDurationMinutes());
                    existing.setCaloriesBurned(update.getCaloriesBurned());
                    existing.setNotes(update.getNotes());
                    existing.setMood(update.getMood());
                    WorkoutLog saved = workoutLogRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!workoutLogRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        workoutLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
