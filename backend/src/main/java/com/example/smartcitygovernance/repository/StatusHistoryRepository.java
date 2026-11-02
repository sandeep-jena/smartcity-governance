package com.example.smartcitygovernance.repository;

import com.example.smartcitygovernance.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
}
