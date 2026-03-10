package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    @NotBlank
    private String memberId;

    private String memberName;

    @NotBlank
    private String programId;

    private String programTitle;
    private String gymId;
    private String gymName;
    private String coachId;
    private String coachName;
    private String date;
    private String timeSlot;
    private String status; // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private String type; // PROGRAM, COACH_RESERVATION
    private String notes;
    private Instant createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }

    public String getProgramId() { return programId; }
    public void setProgramId(String programId) { this.programId = programId; }

    public String getProgramTitle() { return programTitle; }
    public void setProgramTitle(String programTitle) { this.programTitle = programTitle; }

    public String getGymId() { return gymId; }
    public void setGymId(String gymId) { this.gymId = gymId; }

    public String getGymName() { return gymName; }
    public void setGymName(String gymName) { this.gymName = gymName; }

    public String getCoachId() { return coachId; }
    public void setCoachId(String coachId) { this.coachId = coachId; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
