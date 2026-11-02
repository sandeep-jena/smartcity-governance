package com.example.smartcitygovernance.service;

import com.example.smartcitygovernance.dto.ComplaintRequest;
import com.example.smartcitygovernance.dto.ComplaintResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ComplaintService {

    // Citizen raises complaint (with optional image)
    ComplaintResponse raiseComplaint(
            ComplaintRequest request,
            String username,
            MultipartFile image
    );

    // Admin gets all complaints
    List<ComplaintResponse> getAllComplaints();

    // Citizen gets own complaints
    List<ComplaintResponse> getComplaintsByCitizen(String username);

    // Officer gets complaints assigned to them
    List<ComplaintResponse> getComplaintsByOfficer(String username);

    // Officer updates status (simple)
    ComplaintResponse updateStatus(Long complaintId, String status);

    // Admin assigns complaint to officer
    ComplaintResponse assignComplaint(Long complaintId, Long officerId);

    // Officer updates status with validation
    ComplaintResponse updateStatus(Long complaintId, String status, String officerUsername);

    // Officer gets assigned complaints
    List<ComplaintResponse> getAssignedComplaints(String officerUsername);

    // Get single complaint
    ComplaintResponse getComplaintById(Long complaintId);

    //citizen gives feedback
    ComplaintResponse submitFeedback(Long id, Integer rating, String feedback, String username);
}