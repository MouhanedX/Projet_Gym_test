package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "inscriptions")
public class Inscription {
    @Id
    private String id;

    private String clientId;
    private String clientName;
    private String salleId;
    private String salleName;
    private String proprietaireId;
    private Instant dateDemande;
    private String statut; // EN_ATTENTE, ACCEPTEE, REFUSEE

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getSalleId() { return salleId; }
    public void setSalleId(String salleId) { this.salleId = salleId; }

    public String getSalleName() { return salleName; }
    public void setSalleName(String salleName) { this.salleName = salleName; }

    public String getProprietaireId() { return proprietaireId; }
    public void setProprietaireId(String proprietaireId) { this.proprietaireId = proprietaireId; }

    public Instant getDateDemande() { return dateDemande; }
    public void setDateDemande(Instant dateDemande) { this.dateDemande = dateDemande; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}
