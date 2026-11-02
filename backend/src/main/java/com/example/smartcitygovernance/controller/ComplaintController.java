package com.example.smartcitygovernance.controller;

import com.example.smartcitygovernance.dto.ComplaintRequest;
import com.example.smartcitygovernance.dto.ComplaintResponse;
import com.example.smartcitygovernance.service.ComplaintService;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // CITIZEN - Submit complaint with optional image
    @PostMapping(value = "/citizen/complaints",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> raiseComplaint(

            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "image", required = false) MultipartFile image,

            Authentication authentication
    ) {

        System.out.println("🔥 CONTROLLER HIT");

        if (authentication == null) {
            throw new RuntimeException("User not authenticated");
        }

        String username = authentication.getName();
        System.out.println("USER FROM TOKEN: " + username);

        ComplaintRequest request = new ComplaintRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setLatitude(latitude);
        request.setLongitude(longitude);

        return ResponseEntity.ok(
                complaintService.raiseComplaint(
                        request,
                        username,
                        image
                )
        );
    }

    // CITIZEN - Get own complaints
    @GetMapping("/citizen/my-complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                complaintService.getComplaintsByCitizen(authentication.getName())
        );
    }

    // Get single complaint by ID
    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
    }

    //feedback
    @PutMapping("/citizen/complaints/{id}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @RequestParam String feedback,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                complaintService.submitFeedback(id, rating, feedback, authentication.getName())
        );
    }
}