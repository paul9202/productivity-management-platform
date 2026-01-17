package com.productivityx.util;

import com.google.common.hash.Hashing;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class IngestHelper {

    public static String hash(String input) {
        if (input == null) return null;
        return Hashing.sha256().hashString(input, StandardCharsets.UTF_8).toString();
    }

    public static LocalDateTime parseIso(String iso) {
        if (iso == null || iso.isBlank()) return LocalDateTime.now();
        try {
            // Try parsing as OffsetDateTime first (e.g. 2023-01-01T10:00:00Z)
            return java.time.OffsetDateTime.parse(iso).toLocalDateTime();
        } catch (Exception e1) {
            try {
                // Fallback to LocalDateTime (e.g. 2023-01-01T10:00:00)
                return LocalDateTime.parse(iso);
            } catch (Exception e2) {
                System.err.println("Failed to parse date: " + iso);
                return LocalDateTime.now();
            }
        }
    }
}
