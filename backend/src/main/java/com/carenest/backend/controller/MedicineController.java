package com.carenest.backend.controller;

import com.carenest.backend.dto.medicine.CreateMedicineRequest;
import com.carenest.backend.dto.medicine.CreateMedicineScheduleRequest;
import com.carenest.backend.dto.medicine.DailyMedicineScheduleResponse;
import com.carenest.backend.dto.medicine.MedicineResponse;
import com.carenest.backend.dto.medicine.MedicineScheduleFormResponse;
import com.carenest.backend.dto.medicine.MedicineScheduleResponse;
import com.carenest.backend.dto.medicine.TakeMedicineDoseRequest;
import com.carenest.backend.helper.ApiResponse;
import com.carenest.backend.security.CustomUserDetails;
import com.carenest.backend.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/medicine")
public class MedicineController {
    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping("/schedules/form-data")
    public ResponseEntity<ApiResponse<MedicineScheduleFormResponse>> getFormData(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        MedicineScheduleFormResponse data = medicineService.getFormData(userDetails.getId());
        return ApiResponse.success(data, "Lay du lieu form thanh cong");
    }

    @PostMapping("/schedules")
    public ResponseEntity<ApiResponse<Void>> createMedicineSchedule(
            @Valid @RequestBody CreateMedicineScheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        medicineService.createMedicineSchedule(userDetails.getId(), request);
        return ApiResponse.success(null, "Tao lich uong thuoc thanh cong");
    }

    @GetMapping("/medicine-schedules/{profileId}")
    public ResponseEntity<ApiResponse<List<MedicineScheduleResponse>>> getMedicineSchedules(
            @PathVariable Integer profileId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        List<MedicineScheduleResponse> data = medicineService.getMedicineSchedules(profileId, userDetails.getId());
        return ApiResponse.success(data, "Lay danh sach lich uong thuoc thanh cong");
    }

    @PostMapping("/cabinet/create-medicine")
    public ResponseEntity<ApiResponse<Void>> createMedicine(
            @Valid @RequestBody CreateMedicineRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        medicineService.createMedicine(userDetails.getId(), request);
        return ApiResponse.success(null, "Them thuoc thanh cong");
    }

    @DeleteMapping("/{medicineId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(
            @PathVariable Integer medicineId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        medicineService.deleteMedicine(userDetails.getId(), medicineId);
        return ApiResponse.success(null, "Xoa thuoc thanh cong");
    }

    @GetMapping("/{medicineId}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineDetail(
            @PathVariable Integer medicineId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        MedicineResponse data = medicineService.getMedicineDetail(userDetails.getId(), medicineId);
        return ApiResponse.success(data, "Lay chi tiet thuoc thanh cong");
    }

    @GetMapping("/cabinet")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getMyMedicines(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        List<MedicineResponse> data = medicineService.getMyMedicines(userDetails.getId());
        return ApiResponse.success(data, "Lay danh sach thuoc thanh cong");
    }

    @GetMapping("/medicine-schedules/{profileId}/daily")
    public ResponseEntity<ApiResponse<DailyMedicineScheduleResponse>> getDailySchedule(
            @PathVariable Integer profileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        DailyMedicineScheduleResponse data = medicineService.getDailySchedule(profileId, date, userDetails.getId());
        return ApiResponse.success(data, "Lay lich theo ngay thanh cong");
    }

    @PostMapping("/medicine-schedules/take-dose")
    public ResponseEntity<ApiResponse<Void>> takeDose(
            @Valid @RequestBody TakeMedicineDoseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        medicineService.takeDose(request, userDetails.getId());
        return ApiResponse.success(null, "Da cap nhat trang thai uong thuoc");
    }

    @DeleteMapping("/medicine-schedules/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicineSchedule(
            @PathVariable Integer scheduleId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new RuntimeException("Ban chua dang nhap");
        }

        medicineService.deleteMedicineSchedule(scheduleId, userDetails.getId());
        return ApiResponse.success(null, "Xoa lich thuoc thanh cong");
    }
}
