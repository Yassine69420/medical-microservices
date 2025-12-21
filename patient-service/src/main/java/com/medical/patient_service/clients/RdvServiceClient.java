package com.medical.patient_service.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "rdv-service")
public interface RdvServiceClient {
    @GetMapping("/rendezvous/{id}")
    Map<String, Object> getRdv(@PathVariable("id") UUID id);
}
