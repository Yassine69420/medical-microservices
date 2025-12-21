package com.medical.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import com.medical.auth_service.entities.User;
import com.medical.auth_service.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@medical.com").isEmpty()) {
				User admin = User.builder()
						.email("admin@medical.com")
						.passwordHash(passwordEncoder.encode("admin"))
						.role("DOCTOR")
						.enabled(true)
						.build();
				userRepository.save(admin);
				System.out.println("Default admin created: email=admin@medical.com, password=admin");
			}
		};
	}
}
