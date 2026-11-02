package com.example.smartcitygovernance.serviceImpl;

import com.example.smartcitygovernance.dto.ComplaintResponse;
import com.example.smartcitygovernance.model.Complaint;
import com.example.smartcitygovernance.model.User;
import com.example.smartcitygovernance.repository.ComplaintRepository;
import com.example.smartcitygovernance.repository.UserRepository;
import com.example.smartcitygovernance.service.AdminService;
import com.example.smartcitygovernance.service.EmailService;
import com.example.smartcitygovernance.websocket.NotificationMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final ComplaintRepository    complaintRepository;
    private final UserRepository         userRepository;
    private final EmailService           emailService;
    private final SimpMessagingTemplate  messagingTemplate;

    public AdminServiceImpl(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            EmailService emailService,
                            SimpMessagingTemplate messagingTemplate) {
        this.complaintRepository = complaintRepository;
        this.userRepository      = userRepository;
        this.emailService        = emailService;
        this.messagingTemplate   = messagingTemplate;
    }

    @Override
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ComplaintResponse assignOfficer(Long complaintId, String officerUsername) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = userRepository.findByUsername(officerUsername)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        complaint.setAssignedOfficer(officer);
        complaint.setStatus("IN_PROGRESS");

        Complaint updatedComplaint = complaintRepository.save(complaint);

        // Send WebSocket notification to officer
        NotificationMessage notification = new NotificationMessage(
                "COMPLAINT_ASSIGNED",
                "You have been assigned a new complaint: " + complaint.getTitle(),
                complaint.getId(),
                complaint.getTitle(),
                officerUsername
        );
        messagingTemplate.convertAndSendToUser(
                officerUsername,
                "/queue/notifications",
                notification
        );

        // Send email notification to officer
        if (officer.getEmail() != null && !officer.getEmail().isEmpty()) {
            emailService.sendAssignmentEmail(
                    officer.getEmail(),
                    officer.getUsername(),
                    complaint.getTitle(),
                    complaint.getId()
            );
        }

        return mapToResponse(updatedComplaint);
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setStatus(complaint.getStatus());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setImagePath(complaint.getImagePath());
        response.setRating(complaint.getRating());
        response.setFeedback(complaint.getFeedback());
        response.setImagePath(complaint.getImagePath());

        if (complaint.getCitizen() != null)
            response.setCitizenName(complaint.getCitizen().getUsername());
        if (complaint.getAssignedOfficer() != null)
            response.setAssignedOfficerName(complaint.getAssignedOfficer().getUsername());
        return response;
    }
}