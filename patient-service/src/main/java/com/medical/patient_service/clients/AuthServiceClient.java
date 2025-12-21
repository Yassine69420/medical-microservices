package com.medical.patient_service.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @PostMapping("/auth/validate")
    Map<String, Object> validate(@RequestParam("token") String token);

    @GetMapping("/auth/users/{id}")
    Map<String, Object> getUserById(@PathVariable("id") UUID id);
}
