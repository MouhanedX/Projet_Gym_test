package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.model.Program;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.ProgramRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingRepository bookingRepository;
    private final ProgramRepository programRepository;

    public BookingController(BookingRepository bookingRepository, ProgramRepository programRepository) {
        this.bookingRepository = bookingRepository;
        this.programRepository = programRepository;
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

    @GetMapping("/coach/{coachId}/reservations")
    public List<Booking> getCoachReservations(@PathVariable String coachId) {
        return bookingRepository.findByCoachIdAndType(coachId, "COACH_RESERVATION");
    }

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody Booking booking) {
        booking.setCreatedAt(Instant.now());
        if (booking.getStatus() == null) booking.setStatus("PENDING");

        // Prevent duplicate: same member + same program + same date (excluding cancelled)
        if (booking.getMemberId() != null && booking.getProgramId() != null && booking.getDate() != null) {
            boolean duplicate = bookingRepository.existsByMemberIdAndProgramIdAndDateAndStatusNot(
                    booking.getMemberId(), booking.getProgramId(), booking.getDate(), "CANCELLED");
            if (duplicate) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        // Ensure gymId is populated from the program if missing
        if ((booking.getGymId() == null || booking.getGymId().isEmpty()) && booking.getProgramId() != null) {
            Optional<Program> program = programRepository.findById(booking.getProgramId());
            if (program.isPresent()) {
                Program p = program.get();
                booking.setGymId(p.getGymId());
                if (booking.getGymName() == null || booking.getGymName().isEmpty()) {
                    booking.setGymName(p.getGymName());
                }
                if (booking.getProgramTitle() == null || booking.getProgramTitle().isEmpty()) {
                    booking.setProgramTitle(p.getTitle());
                }
            }
        }
        
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
