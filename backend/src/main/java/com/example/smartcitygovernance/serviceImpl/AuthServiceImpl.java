package com.example.smartcitygovernance.serviceImpl;

import com.example.smartcitygovernance.dto.LoginRequest;
import com.example.smartcitygovernance.dto.RegisterRequest;
import com.example.smartcitygovernance.model.Role;
import com.example.smartcitygovernance.model.User;
import com.example.smartcitygovernance.repository.UserRepository;
import com.example.smartcitygovernance.security.JwtUtil;
import com.example.smartcitygovernance.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
    }

    @Override
    public String registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Username already exists!";
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        userRepository.save(user);
        return "User registered successfully!";
    }

    @Override
    public Map<String,String> loginUser(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        Map<String, String> response = new HashMap<>();
        response.put("token",    token);
        response.put("role",     user.getRole().name());
        response.put("username", user.getUsername());

        return response;
    }
}