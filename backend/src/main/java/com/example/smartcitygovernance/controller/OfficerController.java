package com.example.smartcitygovernance.controller;

import com.example.smartcitygovernance.dto.ComplaintResponse;
import com.example.smartcitygovernance.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@CrossOrigin(origins = "http://localhost:3000")
public class OfficerController {

    private final ComplaintService complaintService;

    public OfficerController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // OFFICER - Get assigned complaints
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(
            Authentication authentication) {
        return ResponseEntity.ok(
                complaintService.getComplaintsByOfficer(authentication.getName())
        );
    }

    // OFFICER - Update complaint status
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        return ResponseEntity.ok(
                complaintService.updateStatus(id, status)
        );
    }
}