package com.example.demo.model;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "gymbuddy")
public class GymBuddy {
    @Id
    private String id;

    @NotBlank
    private String clientId;

    private String clientName;
    private String clientAvatar;

    @NotBlank
    private String title;

    private String description;
    private List<String> specifications; // Ex: "Niveau: Avancé", "Jours: Lundi-Mercredi-Vendredi"
    private String gymId;
    private String gymName;
    private String status; // ACTIVE, MATCHED, CLOSED
    private List<String> matches; // IDs des autres posts intéressés
    private Instant createdAt;
    private Instant updatedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientAvatar() { return clientAvatar; }
    public void setClientAvatar(String clientAvatar) { this.clientAvatar = clientAvatar; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSpecifications() { return specifications; }
    public void setSpecifications(List<String> specifications) { this.specifications = specifications; }

    public String getGymId() { return gymId; }
    public void setGymId(String gymId) { this.gymId = gymId; }

    public String getGymName() { return gymName; }
    public void setGymName(String gymName) { this.gymName = gymName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getMatches() { return matches; }
    public void setMatches(List<String> matches) { this.matches = matches; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
