package com.example.demo.repository;

import com.example.demo.model.Message;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByDateEnvoiAsc(String conversationId);
    List<Message> findBySenderId(String senderId);
}
