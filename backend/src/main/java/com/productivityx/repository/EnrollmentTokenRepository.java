package com.productivityx.repository;

import com.productivityx.model.EnrollmentToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentTokenRepository extends JpaRepository<EnrollmentToken, UUID> {
    Optional<EnrollmentToken> findByTokenHash(String tokenHash);
}
