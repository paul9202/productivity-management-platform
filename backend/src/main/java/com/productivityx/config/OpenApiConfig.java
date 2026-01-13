package com.productivityx.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI productivityXOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Productivity-X API")
                        .description("API Documentation for Productivity-X Admin Portal & Agent")
                        .version("v0.0.1"));
    }
}
