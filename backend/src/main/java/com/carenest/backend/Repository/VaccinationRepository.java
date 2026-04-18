package com.carenest.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.carenest.backend.model.Vaccination;
import com.carenest.backend.model.enums.VaccinationStatus;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Integer> {

    List<Vaccination> findByPlannedDateBetweenAndStatus(
            LocalDate start,
            LocalDate end,
            VaccinationStatus status
    );
}
