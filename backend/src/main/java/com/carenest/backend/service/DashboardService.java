package com.carenest.backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final AiContextService aiContextService;

    public DashboardService(AiContextService aiContextService) {
        this.aiContextService = aiContextService;
    }

    public Map<String, Object> getDashboard(Integer userId, Integer profileId) {
        Map<String, Object> context = aiContextService.buildContext(userId, profileId);
        String scopeType = (String) context.getOrDefault("scopeType", "PROFILE");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> profileContexts = (List<Map<String, Object>>) context.getOrDefault("profiles", new ArrayList<>());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("generatedAt", LocalDate.now().toString());
        response.put("scopeType", scopeType);
        response.put("family", context.get("family"));
        response.put("selectedProfileId", context.get("selectedProfileId"));
        response.put("selectedProfile", context.get("selectedProfile"));
        response.put("profiles", profileContexts);
        response.put("medicineCabinet", context.get("medicineCabinet"));
        response.put("profileContexts", profileContexts);
        response.put("notifications", context.get("unreadNotifications"));
        response.put("unreadNotificationCount", context.get("unreadNotificationCount"));
        response.put("aiSummary", buildAiSummary(scopeType, profileContexts, ((Number) context.getOrDefault("unreadNotificationCount", 0)).intValue()));
        return response;
    }

    private String buildAiSummary(String scopeType, List<Map<String, Object>> profiles, int unreadNotificationCount) {
        int trackedProfiles = profiles.size();
        if (trackedProfiles == 0) {
            return "Hom nay chua co du du lieu de tao tom tat suc khoe.";
        }

        if (unreadNotificationCount > 0) {
            return "Hom nay co " + unreadNotificationCount + " nhac nho can kiem tra. Uu tien xem thuoc trong ngay va lich hen sap toi.";
        }

        if ("FAMILY".equals(scopeType)) {
            return "Che do Ca nha dang tong hop suc khoe cua toan bo thanh vien. Ban co the xem nhac nho, lich kham va hoi CareNest AI de tra cuu nhanh.";
        }

        return "Hom nay chua co canh bao lon. Ban co the kiem tra lich thuoc, lich kham va hoi CareNest AI neu can tra cuu nhanh.";
    }
}
