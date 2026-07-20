package com.energiai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalisisController {

    private final RestTemplate restTemplate;
    
    // URL del microservicio FastAPI (inyectada por entorno en Docker, con fallback a localhost)
    @org.springframework.beans.factory.annotation.Value("${FASTAPI_URL:http://localhost:8000}")
    private String FASTAPI_BASE_URL;

    @Autowired
    public AnalisisController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/analisis-energetico")
    public ResponseEntity<Map> procesarAnalisis(@RequestBody Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        String url = FASTAPI_BASE_URL + "/analisis-energetico";
        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/resultados")
    public ResponseEntity<Map> listarResultados() {
        String url = FASTAPI_BASE_URL + "/resultados";
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/resultados/{id}")
    public ResponseEntity<Map> consultarResultado(@PathVariable String id) {
        String url = FASTAPI_BASE_URL + "/resultados/" + id;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @PutMapping("/resultados/{id}")
    public ResponseEntity<Map> actualizarResultado(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        String url = FASTAPI_BASE_URL + "/resultados/" + id;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.PUT, requestEntity, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @DeleteMapping("/resultados/{id}")
    public ResponseEntity<Map> eliminarResultado(@PathVariable String id) {
        String url = FASTAPI_BASE_URL + "/resultados/" + id;
        ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.DELETE, null, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/convertir-moneda")
    public ResponseEntity<Map> convertirMoneda() {
        String url = FASTAPI_BASE_URL + "/convertir-moneda";
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}
