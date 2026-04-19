package com.carenest.backend.service;

import com.carenest.backend.dto.vaccination.CreateVaccinationRequest;
import com.carenest.backend.dto.vaccination.VaccinationResponse;
import com.carenest.backend.dto.vaccination.VaccinationTrackerResponse;
import com.carenest.backend.model.HealthProfile;
import com.carenest.backend.model.Vaccination;
import com.carenest.backend.model.enums.VaccinationStatus;
import com.carenest.backend.repository.HealthProfileRepository;
import com.carenest.backend.repository.VaccinationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class VaccinationService {

    private final VaccinationRepository vaccinationRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final ProfileAccessService profileAccessService;

    public VaccinationService(VaccinationRepository vaccinationRepository,
                              HealthProfileRepository healthProfileRepository,
                              ProfileAccessService profileAccessService) {
        this.vaccinationRepository = vaccinationRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.profileAccessService = profileAccessService;
    }

    public List<VaccinationTrackerResponse> getTrackerData(Integer currentUserId, Integer profileId) {
        HealthProfile profile = profileAccessService.requireAccessibleProfile(currentUserId, profileId);
        List<Vaccination> vaccinations = vaccinationRepository.findByProfileOrderByDateGivenAscPlannedDateAsc(profile);

        Map<String, List<VaccinationResponse>> groupedData = new LinkedHashMap<>();
        for (Vaccination vaccination : vaccinations) {
            LocalDate targetDate = vaccination.getDateGiven() != null ? vaccination.getDateGiven() : vaccination.getPlannedDate();
            String stage = calculateAgeStage(profile.getBirthday(), targetDate);

            VaccinationResponse response = VaccinationResponse.builder()
                    .vaccineLogId(vaccination.getVaccineLogId())
                    .profileId(profile.getProfile())
                    .fullName(profile.getFullName())
                    .vaccineName(vaccination.getVaccineName())
                    .doseNumber(vaccination.getDoseNumber())
                    .dateGiven(vaccination.getDateGiven())
                    .plannedDate(vaccination.getPlannedDate())
                    .clinicName(vaccination.getClinicName())
                    .status(vaccination.getStatus())
                    .build();

            groupedData.computeIfAbsent(stage, key -> new ArrayList<>()).add(response);
        }

        return groupedData.entrySet().stream()
                .map(entry -> new VaccinationTrackerResponse(
                        entry.getKey(),
                        getStageDescription(entry.getKey()),
                        entry.getValue()))
                .toList();
    }

    @Transactional
    public void addVaccination(Integer currentUserId, Integer profileId, CreateVaccinationRequest request) {
        HealthProfile profile = profileAccessService.requireAccessibleProfile(currentUserId, profileId);

        Vaccination vaccination = new Vaccination();
        vaccination.setProfile(profile);
        vaccination.setVaccineName(request.getVaccineName());
        vaccination.setDoseNumber(request.getDoseNumber());
        vaccination.setDateGiven(request.getDateGiven());
        vaccination.setPlannedDate(request.getPlannedDate());
        vaccination.setClinicName(request.getClinicName());
        vaccination.setStatus(request.getDateGiven() != null ? VaccinationStatus.DONE : VaccinationStatus.PLANNED);

        vaccinationRepository.save(vaccination);
    }

    private String calculateAgeStage(LocalDate birthday, LocalDate targetDate) {
        if (birthday == null || targetDate == null) {
            return "Khac";
        }
        Period period = Period.between(birthday, targetDate);
        int totalMonths = period.getYears() * 12 + period.getMonths();
        if (totalMonths == 0) {
            return "So sinh";
        }
        return totalMonths + " thang tuoi";
    }

    private String getStageDescription(String stage) {
        if ("So sinh".equals(stage)) {
            return "Giai doan dau tien sau khi chao doi";
        }
        if (stage.contains("2 thang")) {
            return "Sap toi 3 mui quan trong";
        }
        if (stage.contains("6 thang")) {
            return "Ke hoach tuong lai";
        }
        return "Lich trinh tiem chung dinh ky";
    }
}
