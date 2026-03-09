package com.example.demo.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String userId;
    private String type;
    private String contenu;
    private Instant dateEnvoi;
    private Boolean lu;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public Instant getDateEnvoi() { return dateEnvoi; }
    public void setDateEnvoi(Instant dateEnvoi) { this.dateEnvoi = dateEnvoi; }

    public Boolean getLu() { return lu; }
    public void setLu(Boolean lu) { this.lu = lu; }
}
