package com.example.smartcitygovernance.controller;

import com.example.smartcitygovernance.dto.ComplaintResponse;
import com.example.smartcitygovernance.model.Role;
import com.example.smartcitygovernance.model.User;
import com.example.smartcitygovernance.repository.UserRepository;
import com.example.smartcitygovernance.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    // ← BOTH injected here
    public AdminController(AdminService adminService,
                           UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    // View all complaints
    @GetMapping("/complaints")
    public List<ComplaintResponse> getAllComplaints() {
        return adminService.getAllComplaints();
    }

    // Get all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get only officers
    @GetMapping("/officers")
    public List<User> getAllOfficers() {
        return userRepository.findByRole(Role.OFFICER);
    }

    // Assign officer to complaint
    @PutMapping("/assign-officer/{complaintId}")
    public ComplaintResponse assignOfficer(
            @PathVariable Long complaintId,
            @RequestParam String officerUsername) {
        return adminService.assignOfficer(complaintId, officerUsername);
    }
}