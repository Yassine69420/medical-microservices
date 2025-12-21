package com.medical.rdv_service.repositories;

import com.medical.rdv_service.entities.RendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> {
}
