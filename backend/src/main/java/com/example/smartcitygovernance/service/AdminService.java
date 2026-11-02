package com.example.smartcitygovernance.service;

import com.example.smartcitygovernance.dto.ComplaintResponse;

import java.util.List;

public interface AdminService {

    List<ComplaintResponse> getAllComplaints();

    ComplaintResponse assignOfficer(Long complaintId, String officerUsername);

}
