package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.repository.BookingRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public List<Booking> list() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> get(@PathVariable String id) {
        return bookingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public List<Booking> getByMember(@PathVariable String memberId) {
        return bookingRepository.findByMemberId(memberId);
    }

    @GetMapping("/gym/{gymId}")
    public List<Booking> getByGym(@PathVariable String gymId) {
        return bookingRepository.findByGymId(gymId);
    }

    @GetMapping("/coach/{coachId}")
    public List<Booking> getByCoach(@PathVariable String coachId) {
        return bookingRepository.findByCoachId(coachId);
    }

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody Booking booking) {
        booking.setCreatedAt(Instant.now());
        if (booking.getStatus() == null) booking.setStatus("PENDING");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return bookingRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(body.get("status"));
                    Booking saved = bookingRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
