package com.carenest.backend.service;

import com.carenest.backend.model.FamilyRelationship;
import com.carenest.backend.model.HealthProfile;
import com.carenest.backend.repository.FamilyRelationshipRepository;
import com.carenest.backend.repository.HealthProfileRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProfileAccessService {

    private final HealthProfileRepository healthProfileRepository;
    private final FamilyRelationshipRepository familyRelationshipRepository;

    public ProfileAccessService(HealthProfileRepository healthProfileRepository,
                                FamilyRelationshipRepository familyRelationshipRepository) {
        this.healthProfileRepository = healthProfileRepository;
        this.familyRelationshipRepository = familyRelationshipRepository;
    }

    public HealthProfile getRequiredCurrentProfile(Integer currentUserId) {
        return healthProfileRepository.findFirstByUser_UserIdOrderByProfileAsc(currentUserId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay ho so suc khoe cua nguoi dung"));
    }

    public Optional<FamilyRelationship> getCurrentFamilyRelationship(Integer currentUserId) {
        HealthProfile currentProfile = getRequiredCurrentProfile(currentUserId);
        return familyRelationshipRepository.findByProfile_Profile(currentProfile.getProfile());
    }

    public Set<Integer> getAccessibleProfileIds(Integer currentUserId) {
        Set<Integer> accessibleProfileIds = new LinkedHashSet<>();
        healthProfileRepository.findByUserUserId(currentUserId)
                .forEach(profile -> accessibleProfileIds.add(profile.getProfile()));

        getCurrentFamilyRelationship(currentUserId)
                .ifPresent(relationship -> familyRelationshipRepository
                        .findAllByFamily_FamilyId(relationship.getFamily().getFamilyId())
                        .forEach(item -> accessibleProfileIds.add(item.getProfile().getProfile())));

        if (accessibleProfileIds.isEmpty()) {
            throw new RuntimeException("Khong tim thay ho so suc khoe cua nguoi dung");
        }

        return accessibleProfileIds;
    }

    public List<HealthProfile> getAccessibleProfiles(Integer currentUserId) {
        Set<Integer> accessibleProfileIds = getAccessibleProfileIds(currentUserId);
        return accessibleProfileIds.stream()
                .map(profileId -> healthProfileRepository.findById(profileId)
                        .orElseThrow(() -> new RuntimeException("Khong tim thay profile voi id = " + profileId)))
                .toList();
    }

    public HealthProfile requireAccessibleProfile(Integer currentUserId, Integer profileId) {
        HealthProfile profile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay profile"));

        if (!getAccessibleProfileIds(currentUserId).contains(profileId)) {
            throw new RuntimeException("Ban khong co quyen truy cap profile nay");
        }

        return profile;
    }
}
