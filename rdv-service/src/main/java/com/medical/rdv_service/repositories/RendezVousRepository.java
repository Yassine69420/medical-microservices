package com.medical.rdv_service.repositories;

import com.medical.rdv_service.entities.RendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> {
    List<RendezVous> findTop3ByDoctorIdAndDateTimeAfterOrderByDateTimeAsc(UUID doctorId,
            java.time.LocalDateTime dateTime);

    boolean existsByDoctorIdAndDateTimeBetween(UUID doctorId, java.time.LocalDateTime start,
            java.time.LocalDateTime end);

    // Check if there is any appointment that starts within the conflict range
    // effectively checks: existing.start < new.end && existing.end > new.start
    // Since we only store start time, we assume 30 min duration.
    // So we check if existing.start is in (newStart - 30m, newStart + 30m)
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) > 0 FROM RendezVous r WHERE r.doctorId = :doctorId AND r.dateTime > :start AND r.dateTime < :end")
    boolean hasOverlappingAppointments(@org.springframework.data.repository.query.Param("doctorId") UUID doctorId,
            @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
            @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
