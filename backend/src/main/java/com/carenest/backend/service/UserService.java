package com.carenest.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.carenest.backend.dto.auth.ChangePasswordRequest;
import com.carenest.backend.model.User;
import com.carenest.backend.repository.UserRepository;
import com.carenest.backend.security.jwt.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void changePassword(HttpServletRequest request, ChangePasswordRequest req) {
        User currentUser = getCurrentUser(request);

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        if (!passwordEncoder.matches(req.getOldPassword(), currentUser.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        if (passwordEncoder.matches(req.getNewPassword(), currentUser.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng mật khẩu cũ");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(currentUser);
    }

    private User getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Thiếu token đăng nhập");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }
}
