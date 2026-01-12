package com.productivityx.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/telemetry/**").permitAll() // Authenticated via Custom Device Filter
                .requestMatchers("/api/policy/**").permitAll()    // Authenticated via Custom Device Filter
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")
                .anyRequest().authenticated()
            )
            .addFilterBefore(new DeviceAuthenticationFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Extracts Device Identity from X.509 certs or Headers (simulated mTLS).
     */
    public static class DeviceAuthenticationFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            
            String path = request.getRequestURI();
            if (path.startsWith("/api/telemetry") || path.startsWith("/api/policy")) {
                // In production, this would look at request.getAttribute("jakarta.servlet.request.X509Certificate")
                // Or a header forwarded by the Load Balancer.
                // For MVP/Dev: we check a header "X-Device-Id" or "X-Client-Cert-Hash"
                
                String deviceId = request.getHeader("X-Device-Id");
                
                // If using actual mTLS in Java, we'd extract SAN here.
                // For now, let's assume the LB verified it and passed the Device ID.
                
                if (deviceId != null && deviceId.startsWith("urn:focus:device:")) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            deviceId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_DEVICE")));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } else if (path.startsWith("/api/admin")) {
                // Mock Admin Auth for MVP
                // In prod: JWT validation
                String user = request.getHeader("X-User");
                if ("admin".equals(user)) {
                     UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
            
            filterChain.doFilter(request, response);
        }
    }
}
