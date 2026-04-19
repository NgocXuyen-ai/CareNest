package com.carenest.backend.service;

import com.carenest.backend.dto.notification.NotificationResponse;
import com.carenest.backend.model.Notification;
import com.carenest.backend.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ProfileAccessService profileAccessService;

    public NotificationService(NotificationRepository notificationRepository,
                               ProfileAccessService profileAccessService) {
        this.notificationRepository = notificationRepository;
        this.profileAccessService = profileAccessService;
    }

    public List<NotificationResponse> getNotifications(Integer currentUserId, Integer profileId, Boolean isRead) {
        profileAccessService.requireAccessibleProfile(currentUserId, profileId);
        Sort sort = Sort.by(Sort.Direction.DESC, "scheduledTime");

        List<Notification> notifications = isRead == null
                ? notificationRepository.findByProfile_Profile(profileId, sort)
                : notificationRepository.findByProfile_ProfileAndIsRead(profileId, isRead, sort);

        return notifications.stream().map(this::mapToResponse).toList();
    }

    public void markAsRead(Integer currentUserId, Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay notification voi id = " + notificationId));

        profileAccessService.requireAccessibleProfile(currentUserId, notification.getProfile().getProfile());
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .type(notification.getType())
                .title(notification.getTitle())
                .content(notification.getContent())
                .scheduledTime(notification.getScheduledTime())
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .build();
    }
}
