package com.example.smartcitygovernance.serviceImpl;

import com.example.smartcitygovernance.dto.ComplaintRequest;
import com.example.smartcitygovernance.dto.ComplaintResponse;
import com.example.smartcitygovernance.model.Complaint;
import com.example.smartcitygovernance.model.StatusHistory;
import com.example.smartcitygovernance.model.User;
import com.example.smartcitygovernance.repository.ComplaintRepository;
import com.example.smartcitygovernance.repository.StatusHistoryRepository;
import com.example.smartcitygovernance.repository.UserRepository;
import com.example.smartcitygovernance.service.ComplaintService;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            StatusHistoryRepository statusHistoryRepository
    ) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    // Raise complaint with optional image
    @Override
    public ComplaintResponse raiseComplaint(ComplaintRequest request,
                                            String username,
                                            MultipartFile image) {

        User citizen = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setCitizen(citizen);
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());

        //  Save image if provided
        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = "uploads/complaints/";
                Path uploadPath = Paths.get(uploadDir);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();

                Files.copy(
                        image.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                complaint.setImagePath(uploadDir + fileName);

            } catch (IOException e) {
                throw new RuntimeException("Image upload failed: " + e.getMessage());
            }
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Save status history
        StatusHistory history = new StatusHistory();
        history.setComplaint(savedComplaint);
        history.setStatus("PENDING");
        history.setUpdatedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        return mapToResponse(savedComplaint);
    }

    // Admin gets all complaints
    @Override
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Citizen gets own complaints
    @Override
    public List<ComplaintResponse> getComplaintsByCitizen(String username) {

        User citizen = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return complaintRepository.findByCitizenId(citizen.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Officer gets assigned complaints
    @Override
    public List<ComplaintResponse> getComplaintsByOfficer(String username) {

        User officer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return complaintRepository.findByAssignedOfficerId(officer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Simple status update
    @Override
    public ComplaintResponse updateStatus(Long complaintId, String status) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);

        StatusHistory history = new StatusHistory();
        history.setComplaint(updated);
        history.setStatus(status);
        history.setUpdatedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        return mapToResponse(updated);
    }

    // Admin assigns complaint
    @Override
    public ComplaintResponse assignComplaint(Long complaintId, Long officerId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        complaint.setAssignedOfficer(officer);
        complaint.setStatus("IN_PROGRESS");

        Complaint updated = complaintRepository.save(complaint);

        StatusHistory history = new StatusHistory();
        history.setComplaint(updated);
        history.setStatus("IN_PROGRESS");
        history.setUpdatedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        return mapToResponse(updated);
    }

    // Officer updates status with validation
    @Override
    public ComplaintResponse updateStatus(Long complaintId,
                                          String status,
                                          String officerUsername) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = userRepository.findByUsername(officerUsername)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (complaint.getAssignedOfficer() == null ||
                !complaint.getAssignedOfficer().getId().equals(officer.getId())) {
            throw new RuntimeException("You are not assigned to this complaint");
        }

        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);

        StatusHistory history = new StatusHistory();
        history.setComplaint(updated);
        history.setStatus(status);
        history.setUpdatedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        return mapToResponse(updated);
    }

    // Get assigned complaints
    @Override
    public List<ComplaintResponse> getAssignedComplaints(String officerUsername) {

        User officer = userRepository.findByUsername(officerUsername)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        return complaintRepository.findByAssignedOfficerId(officer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get single complaint
    @Override
    public ComplaintResponse getComplaintById(Long complaintId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        return mapToResponse(complaint);
    }

    //feedback
    @Override
    public ComplaintResponse submitFeedback(Long id, Integer rating, String feedback, String username) {

        System.out.println("RATING: " + rating);
        System.out.println("FEEDBACK: " + feedback);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!complaint.getCitizen().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        if (!"RESOLVED".equalsIgnoreCase(complaint.getStatus())) {
            throw new RuntimeException("Feedback allowed only after resolution");
        }

        complaint.setRating(rating);
        complaint.setFeedback(feedback);

        complaintRepository.save(complaint);

        return mapToResponse(complaint);
    }

    // Convert Entity → DTO
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

        if (complaint.getCitizen() != null) {
            response.setCitizenName(complaint.getCitizen().getUsername());
        }

        if (complaint.getAssignedOfficer() != null) {
            response.setAssignedOfficerName(
                    complaint.getAssignedOfficer().getUsername()
            );
        }

        return response;
    }
}