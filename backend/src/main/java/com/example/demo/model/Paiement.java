package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "paiements")
public class Paiement {
    @Id
    private String id;

    private String inscriptionId;
    private String clientId;
    private String clientName;
    private Double montant;
    private Instant datePaiement;
    private String statut; // CONFIRME, ECHOUE
    private String methode; // CARTE, ESPECES, VIREMENT
    private String cardLast4;
    private String cardHolder;
    private String salleId;
    private String salleName;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInscriptionId() { return inscriptionId; }
    public void setInscriptionId(String inscriptionId) { this.inscriptionId = inscriptionId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }

    public Instant getDatePaiement() { return datePaiement; }
    public void setDatePaiement(Instant datePaiement) { this.datePaiement = datePaiement; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getMethode() { return methode; }
    public void setMethode(String methode) { this.methode = methode; }

    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }

    public String getCardHolder() { return cardHolder; }
    public void setCardHolder(String cardHolder) { this.cardHolder = cardHolder; }

    public String getSalleId() { return salleId; }
    public void setSalleId(String salleId) { this.salleId = salleId; }

    public String getSalleName() { return salleName; }
    public void setSalleName(String salleName) { this.salleName = salleName; }
}
