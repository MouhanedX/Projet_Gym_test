package com.example.demo.repository;

import com.example.demo.model.Conversation;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByParticipantIdsContaining(String userId);
}
