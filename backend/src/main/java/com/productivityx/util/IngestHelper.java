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
        if (iso == null) return LocalDateTime.now();
        try {
            // Flexible parsing could go here, for now assume ISO-8601
            // If it contains 'Z' or offset, default parser handles it usually
            return LocalDateTime.parse(iso, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            // Fallback or rethrow
            return LocalDateTime.now();
        }
    }
}
