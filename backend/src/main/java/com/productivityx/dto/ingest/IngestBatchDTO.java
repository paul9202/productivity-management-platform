package com.productivityx.dto.ingest;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class IngestBatchDTO {
    private String schemaVersion;
    private HeartbeatPayload heartbeat;
    private List<BucketPayload> activity_buckets;
    private List<AppPayload> app_events;
    private List<WebPayload> web_events;

    @Data
    public static class HeartbeatPayload {
        private String status;
        private String agentVersion;
        private Integer queueDepth;
        private Integer uploadErrorCount;
    }

    @Data
    public static class BucketPayload {
        private String bucket_start; // ISO
        private Integer bucket_minutes;
        private Integer active_seconds;
        private Integer idle_seconds;
        private Integer avg_focus_score;
    }

    @Data
    public static class AppPayload {
        private UUID id; // Client UUID for idempotency
        private String ts_start;
        private String ts_end;
        private String app_name;
        private String process_name;
    }

    @Data
    public static class WebPayload {
        private UUID id;
        private String ts_start;
        private String ts_end;
        private String domain;
    }
}
