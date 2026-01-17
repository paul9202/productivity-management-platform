package com.productivityx.test;

import com.productivityx.model.telemetry.DailyDeviceSummary;
import com.productivityx.repository.telemetry.DailyDeviceSummaryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class DailySummaryRepoIT {

    @Container
    public static PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("productivityx")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgreSQLContainer::getJdbcUrl);
        registry.add("spring.datasource.password", postgreSQLContainer::getPassword);
        registry.add("spring.datasource.username", postgreSQLContainer::getUsername);
    }

    @Autowired
    private DailyDeviceSummaryRepository repo;

    @Test
    void testUpsertStats() {
        String deviceId = "dev-summary-test";
        UUID tenantId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        LocalDate date = LocalDate.now();

        // 1. Initial Insert
        repo.upsertStats(tenantId, orgId, deviceId, date, 100, 50, "[]", "[]", "{}");

        DailyDeviceSummary summary = repo.findByDeviceIdAndDate(deviceId, date).orElseThrow();
        assertEquals(100, summary.getActiveSeconds());
        assertEquals(50, summary.getIdleSeconds());

        // 2. Update (Upsert)
        repo.upsertStats(tenantId, orgId, deviceId, date, 200, 10, null, null, null); // Test null handling too if simple binding

        // COALESCE logic in query handles empty strings, but for null passed from java? 
        // If java passes null to parameter, Postgres receives NULL. COALESCE(NULL, '[]') works.
        // Let's verify.
        
        DailyDeviceSummary updated = repo.findByDeviceIdAndDate(deviceId, date).orElseThrow();
        assertEquals(300, updated.getActiveSeconds()); // 100 + 200
        assertEquals(60, updated.getIdleSeconds());   // 50 + 10
        
        // Assert count remains 1
        assertEquals(1, repo.count()); // assuming clean DB or careful assertions
    }
}
