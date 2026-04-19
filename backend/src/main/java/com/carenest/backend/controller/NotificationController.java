package com.carenest.backend.controller;

import com.carenest.backend.dto.notification.NotificationResponse;
import com.carenest.backend.helper.ApiResponse;
import com.carenest.backend.security.CustomUserDetails;
import com.carenest.backend.service.NotificationGenerationService;
import com.carenest.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationGenerationService notificationGenerationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Integer profileId,
            @RequestParam(required = false) Boolean isRead
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        List<NotificationResponse> notifications = notificationService.getNotifications(userDetails.getId(), profileId, isRead);
        return ApiResponse.success(notifications, "Lay danh sach notification thanh cong");
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer notificationId
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        notificationService.markAsRead(userDetails.getId(), notificationId);
        return ApiResponse.success("OK", "Danh dau da doc thanh cong");
    }

    @PostMapping("/generate/medicine")
    public ResponseEntity<ApiResponse<String>> generateMedicineNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        notificationGenerationService.generateMedicineNotifications();
        return ApiResponse.success("OK", "Tao notification thuoc thanh cong");
    }

    @PostMapping("/generate/appointment")
    public ResponseEntity<ApiResponse<String>> generateAppointmentNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        notificationGenerationService.generateAppointmentNotifications();
        return ApiResponse.success("OK", "Tao notification lich hen thanh cong");
    }

    @PostMapping("/generate/vaccination")
    public ResponseEntity<ApiResponse<String>> generateVaccinationNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        notificationGenerationService.generateVaccinationNotifications();
        return ApiResponse.success("OK", "Tao notification tiem chung thanh cong");
    }
}
