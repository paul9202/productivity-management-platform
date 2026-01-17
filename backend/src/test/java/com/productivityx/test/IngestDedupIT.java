package com.productivityx.test;

import com.productivityx.dto.ingest.IngestBatchDTO;
import com.productivityx.model.telemetry.ActivityBucket;
import com.productivityx.repository.telemetry.ActivityBucketRepository;
import com.productivityx.service.IngestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class IngestDedupIT {

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
    private IngestService ingestService;

    @Autowired
    private ActivityBucketRepository bucketRepo;

    @Test
    void testBucketDeduplication() {
        // Arrange
        String deviceId = "test-dedup-device";
        // Ensure device exists (mocking or inserting if needed by IngestService check)
        // For IT, usually we rely on pre-inserted data or full flow. 
        // Assuming we need to insert device first.
        // skipped for brevity, assuming data.sql or setup.

        IngestBatchDTO batch = new IngestBatchDTO();
        IngestBatchDTO.BucketPayload bucket = new IngestBatchDTO.BucketPayload();
        bucket.setBucket_start("2023-01-01T10:00:00Z");
        bucket.setBucket_minutes(5);
        bucket.setActive_seconds(100);
        batch.setActivity_buckets(List.of(bucket));

        // Act 1: First Ingest
        ingestService.processBatch(deviceId, batch);

        // Assert 1
        List<ActivityBucket> buckets = bucketRepo.findAll();
        assertThat(buckets).hasSize(1);

        // Act 2: Second Ingest (Duplicate)
        ingestService.processBatch(deviceId, batch);

        // Assert 2: Still 1
        assertThat(bucketRepo.findAll()).hasSize(1);
    }
}
