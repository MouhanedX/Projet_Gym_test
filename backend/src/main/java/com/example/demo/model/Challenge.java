package com.example.demo.model;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "challenges")
public class Challenge {
    @Id
    private String id;

    private String clientId;
    private String clientName;
    private String titre;
    private String description;
    private Instant dateDebut;
    private Instant dateFin;
    private String statut; // EN_COURS, TERMINE, ABANDONNE
    private List<ChallengeStep> etapes;

    public static class ChallengeStep {
        private String titre;
        private String jour; // Jour 1, Jour 2, etc.
        private List<StepExercise> exercices;
        private boolean complete;

        public String getTitre() { return titre; }
        public void setTitre(String titre) { this.titre = titre; }
        public String getJour() { return jour; }
        public void setJour(String jour) { this.jour = jour; }
        public List<StepExercise> getExercices() { return exercices; }
        public void setExercices(List<StepExercise> exercices) { this.exercices = exercices; }
        public boolean isComplete() { return complete; }
        public void setComplete(boolean complete) { this.complete = complete; }
    }

    public static class StepExercise {
        private String nom;
        private String details;
        private boolean done;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public boolean isDone() { return done; }
        public void setDone(boolean done) { this.done = done; }
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getDateDebut() { return dateDebut; }
    public void setDateDebut(Instant dateDebut) { this.dateDebut = dateDebut; }
    public Instant getDateFin() { return dateFin; }
    public void setDateFin(Instant dateFin) { this.dateFin = dateFin; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public List<ChallengeStep> getEtapes() { return etapes; }
    public void setEtapes(List<ChallengeStep> etapes) { this.etapes = etapes; }
}
