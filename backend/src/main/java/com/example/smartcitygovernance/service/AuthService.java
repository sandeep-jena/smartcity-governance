package com.example.smartcitygovernance.service;

import com.example.smartcitygovernance.dto.LoginRequest;
import com.example.smartcitygovernance.dto.RegisterRequest;

import java.util.Map;

public interface AuthService {

    String registerUser(RegisterRequest request);

    Map<String, String> loginUser(LoginRequest request);
}
