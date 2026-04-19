package com.carenest.backend.service;

import com.carenest.backend.dto.growth.ChartDataPoint;
import com.carenest.backend.dto.growth.CreateGrowthLogRequest;
import com.carenest.backend.dto.growth.GrowthHistoryItem;
import com.carenest.backend.dto.growth.GrowthSummaryResponse;
import com.carenest.backend.model.GrowthLog;
import com.carenest.backend.model.HealthProfile;
import com.carenest.backend.repository.GrowthLogRepository;
import com.carenest.backend.repository.HealthProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Service
public class GrowthService {

    private final GrowthLogRepository growthLogRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final ProfileAccessService profileAccessService;

    public GrowthService(GrowthLogRepository growthLogRepository,
                         HealthProfileRepository healthProfileRepository,
                         ProfileAccessService profileAccessService) {
        this.growthLogRepository = growthLogRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.profileAccessService = profileAccessService;
    }

    public GrowthSummaryResponse getGrowthSummary(Integer currentUserId, Integer profileId) {
        HealthProfile profile = profileAccessService.requireAccessibleProfile(currentUserId, profileId);

        if (profile.getBirthday() == null) {
            throw new RuntimeException("Vui long cap nhat ngay sinh de su dung tinh nang nay");
        }

        Period agePeriod = Period.between(profile.getBirthday(), LocalDate.now());
        if (agePeriod.getYears() >= 20) {
            throw new RuntimeException("Tinh nang theo doi tang truong chi danh cho nguoi duoi 20 tuoi");
        }

        List<GrowthLog> logsAsc = growthLogRepository.findByProfileOrderByRecordDateAsc(profile);
        List<GrowthLog> logsDesc = growthLogRepository.findByProfileOrderByRecordDateDesc(profile);

        GrowthSummaryResponse response = new GrowthSummaryResponse();
        response.setChildName(profile.getFullName());

        int totalMonths = agePeriod.getYears() * 12 + agePeriod.getMonths();
        response.setAgeString(totalMonths + " thang tuoi");
        response.setStatusLabel("Binh thuong");

        if (logsAsc.size() >= 5) {
            response.setCanDrawChart(true);
            response.setWeightChart(logsAsc.stream()
                    .map(log -> new ChartDataPoint(formatLabel(profile.getBirthday(), log.getRecordDate()), log.getWeight()))
                    .toList());
            response.setHeightChart(logsAsc.stream()
                    .map(log -> new ChartDataPoint(formatLabel(profile.getBirthday(), log.getRecordDate()), log.getHeight()))
                    .toList());
        } else {
            response.setCanDrawChart(false);
            response.setChartMessage("Ban can nhap it nhat 5 chi so do (hien co " + logsAsc.size() + ") de he thong ve bieu do tang truong.");
            response.setWeightChart(new ArrayList<>());
            response.setHeightChart(new ArrayList<>());
        }

        response.setHistory(logsDesc.stream()
                .map(log -> GrowthHistoryItem.builder()
                        .date(log.getRecordDate())
                        .weight(log.getWeight())
                        .height(log.getHeight())
                        .note(log.getNote())
                        .build())
                .toList());

        return response;
    }

    @Transactional
    public void addGrowthLog(Integer currentUserId, CreateGrowthLogRequest request) {
        HealthProfile profile = profileAccessService.requireAccessibleProfile(currentUserId, request.getProfileId());

        if (profile.getBirthday() == null) {
            throw new RuntimeException("Vui long cap nhat ngay sinh truoc khi ghi nhan tang truong");
        }

        Period agePeriod = Period.between(profile.getBirthday(), LocalDate.now());
        if (agePeriod.getYears() >= 20) {
            throw new RuntimeException("Khong the them du lieu tang truong cho nguoi tu 20 tuoi tro len");
        }

        if (growthLogRepository.existsByProfileAndRecordDate(profile, request.getRecordDate())) {
            throw new RuntimeException("Ngay nay da co du lieu roi");
        }

        GrowthLog log = new GrowthLog();
        log.setProfile(profile);
        log.setWeight(request.getWeight());
        log.setHeight(request.getHeight());
        log.setRecordDate(request.getRecordDate());
        log.setNote(request.getNote());
        growthLogRepository.save(log);

        profile.setWeight(request.getWeight());
        profile.setHeight(request.getHeight());
        healthProfileRepository.save(profile);
    }

    private String formatLabel(LocalDate birthday, LocalDate recordDate) {
        Period period = Period.between(birthday, recordDate);
        int months = period.getYears() * 12 + period.getMonths();
        return "Thang " + months;
    }
}
