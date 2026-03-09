package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "avis")
public class Avis {
    @Id
    private String id;

    private String clientId;
    private String clientName;
    private Integer note;
    private String commentaire;
    private Instant date;
    private String salleId;   // if reviewing a gym
    private String coachId;   // if reviewing a coach

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }

    public String getSalleId() { return salleId; }
    public void setSalleId(String salleId) { this.salleId = salleId; }

    public String getCoachId() { return coachId; }
    public void setCoachId(String coachId) { this.coachId = coachId; }
}
