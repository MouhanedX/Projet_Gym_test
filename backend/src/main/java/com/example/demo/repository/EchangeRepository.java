package com.example.demo.repository;

import com.example.demo.model.Echange;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EchangeRepository extends MongoRepository<Echange, String> {
    List<Echange> findByClientId(String clientId);
    List<Echange> findByRecompenseId(String recompenseId);
}
