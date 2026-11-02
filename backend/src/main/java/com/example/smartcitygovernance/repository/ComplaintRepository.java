package com.example.smartcitygovernance.repository;

import com.example.smartcitygovernance.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStatus(String status);

    List<Complaint> findByCitizenId(Long citizenId);

    List<Complaint> findByAssignedOfficerId(Long officerId);

    List<Complaint> findAllByOrderByIdDesc();
}
