package com.example.smartcitygovernance.service;

public interface EmailService {
    void sendAssignmentEmail(String toEmail, String officerName,
                             String complaintTitle, Long complaintId);
}
