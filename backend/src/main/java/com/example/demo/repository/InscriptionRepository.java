package com.example.demo.repository;

import com.example.demo.model.Inscription;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InscriptionRepository extends MongoRepository<Inscription, String> {
    List<Inscription> findByClientId(String clientId);
    List<Inscription> findBySalleId(String salleId);
    List<Inscription> findByProprietaireId(String proprietaireId);
    List<Inscription> findByStatut(String statut);
    List<Inscription> findByProprietaireIdAndStatut(String proprietaireId, String statut);
    List<Inscription> findByClientIdAndSalleId(String clientId, String salleId);
}
