package com.productivityx.service;

import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
public class IngestResponse {
    private Map<String, Integer> processed = new HashMap<>();
    private Map<String, Integer> rejected = new HashMap<>();

    public void incrementProcessed(String key) {
        processed.put(key, processed.getOrDefault(key, 0) + 1);
    }
    
    public void incrementProcessed(String key, int count) {
        processed.put(key, processed.getOrDefault(key, 0) + count);
    }

    public void incrementRejected(String key, int count) {
        rejected.put(key, rejected.getOrDefault(key, 0) + count);
    }

    public void incrementRejected(String key) {
        rejected.put(key, rejected.getOrDefault(key, 0) + 1);
    }
}
