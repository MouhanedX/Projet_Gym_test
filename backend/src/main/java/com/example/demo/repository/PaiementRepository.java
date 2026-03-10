package com.example.demo.repository;

import com.example.demo.model.Paiement;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaiementRepository extends MongoRepository<Paiement, String> {
    List<Paiement> findByClientId(String clientId);
    List<Paiement> findByInscriptionId(String inscriptionId);
    List<Paiement> findByStatut(String statut);
    List<Paiement> findBySalleId(String salleId);
}
