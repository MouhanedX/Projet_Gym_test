package com.example.demo.model;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recompenses")
public class Recompense {
    @Id
    private String id;

    private String titre;
    private String description;
    private Integer coutEnPoints;
    private String partenaireFournisseur;
    private List<String> salleIds; // participating gyms
    private String imageBase64;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCoutEnPoints() { return coutEnPoints; }
    public void setCoutEnPoints(Integer coutEnPoints) { this.coutEnPoints = coutEnPoints; }

    public String getPartenaireFournisseur() { return partenaireFournisseur; }
    public void setPartenaireFournisseur(String partenaireFournisseur) { this.partenaireFournisseur = partenaireFournisseur; }

    public List<String> getSalleIds() { return salleIds; }
    public void setSalleIds(List<String> salleIds) { this.salleIds = salleIds; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
}
