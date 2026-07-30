package com.energiai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class EnergiaiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnergiaiApplication.class, args);
    }

    // Bean para hacer llamadas HTTP a FastAPI
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
