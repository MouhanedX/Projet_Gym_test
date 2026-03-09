package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "echanges")
public class Echange {
    @Id
    private String id;

    private String clientId;
    private String clientName;
    private String recompenseId;
    private String recompenseTitre;
    private Instant dateEchange;
    private String codePromoGenere;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getRecompenseId() { return recompenseId; }
    public void setRecompenseId(String recompenseId) { this.recompenseId = recompenseId; }

    public String getRecompenseTitre() { return recompenseTitre; }
    public void setRecompenseTitre(String recompenseTitre) { this.recompenseTitre = recompenseTitre; }

    public Instant getDateEchange() { return dateEchange; }
    public void setDateEchange(Instant dateEchange) { this.dateEchange = dateEchange; }

    public String getCodePromoGenere() { return codePromoGenere; }
    public void setCodePromoGenere(String codePromoGenere) { this.codePromoGenere = codePromoGenere; }
}
