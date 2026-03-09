package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "checkins")
public class CheckIn {
    @Id
    private String id;

    private String clientId;
    private String clientName;
    private String salleId;
    private String salleName;
    private Instant dateHeure;
    private Integer pointsGagnes;
    private String qrCodeScanne;

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

    public Instant getDateHeure() { return dateHeure; }
    public void setDateHeure(Instant dateHeure) { this.dateHeure = dateHeure; }

    public Integer getPointsGagnes() { return pointsGagnes; }
    public void setPointsGagnes(Integer pointsGagnes) { this.pointsGagnes = pointsGagnes; }

    public String getQrCodeScanne() { return qrCodeScanne; }
    public void setQrCodeScanne(String qrCodeScanne) { this.qrCodeScanne = qrCodeScanne; }
}
