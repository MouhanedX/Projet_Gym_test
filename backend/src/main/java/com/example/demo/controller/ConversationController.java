package com.example.demo.controller;

import com.example.demo.model.Conversation;
import com.example.demo.model.Message;
import com.example.demo.model.Notification;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.NotificationRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;

    public ConversationController(ConversationRepository conversationRepository, MessageRepository messageRepository, NotificationRepository notificationRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Conversation> list() {
        return conversationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> get(@PathVariable String id) {
        return conversationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Conversation> getByUser(@PathVariable String userId) {
        return conversationRepository.findByParticipantIdsContaining(userId);
    }

    @PostMapping
    public Conversation create(@RequestBody Conversation conversation) {
        conversation.setDateCreation(Instant.now());
        return conversationRepository.save(conversation);
    }

    // --- Messages within a conversation ---

    @GetMapping("/{conversationId}/messages")
    public List<Message> getMessages(@PathVariable String conversationId) {
        return messageRepository.findByConversationIdOrderByDateEnvoiAsc(conversationId);
    }

    @PostMapping("/{conversationId}/messages")
    public Message sendMessage(@PathVariable String conversationId, @RequestBody Message message) {
        message.setConversationId(conversationId);
        message.setDateEnvoi(Instant.now());
        Message saved = messageRepository.save(message);

        // Create notification for other participants
        conversationRepository.findById(conversationId).ifPresent(conv -> {            if (conv.getParticipantIds() == null) return;            for (String participantId : conv.getParticipantIds()) {
                if (!participantId.equals(message.getSenderId())) {
                    Notification notif = new Notification();
                    notif.setUserId(participantId);
                    notif.setType("MESSAGE");
                    notif.setContenu("Nouveau message de " + message.getSenderName());
                    notif.setDateEnvoi(Instant.now());
                    notif.setLu(false);
                    notificationRepository.save(notif);
                }
            }
        });

        return saved;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (conversationRepository.existsById(id)) {
            conversationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
