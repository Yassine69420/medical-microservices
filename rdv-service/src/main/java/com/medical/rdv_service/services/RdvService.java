package com.medical.rdv_service.services;

import com.medical.rdv_service.entities.RendezVous;
import com.medical.rdv_service.repositories.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RdvService {
    private final RendezVousRepository rdvRepo;

    public RendezVous getRdv(UUID id) {
        return rdvRepo.findById(id).orElse(null);
    }

    public List<RendezVous> getAllRdvs() {
        return rdvRepo.findAll();
    }

    public RendezVous save(RendezVous rdv) {
        return rdvRepo.save(rdv);
    }

    public RendezVous update(UUID id, RendezVous rdv) {
        rdv.setId(id);
        return rdvRepo.save(rdv);
    }

    public void delete(UUID id) {
        rdvRepo.deleteById(id);
    }
}
