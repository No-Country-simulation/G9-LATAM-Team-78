package com.energiai.service;

import com.energiai.dto.AnalisisRequestDTO;
import com.energiai.dto.AnalisisResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AnalisisService {

    private final RestTemplate restTemplate;

    @Value("${FASTAPI_URL:http://localhost:8000}")
    private String FASTAPI_BASE_URL;

    @Autowired
    public AnalisisService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AnalisisResponseDTO procesarAnalisis(AnalisisRequestDTO requestDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<AnalisisRequestDTO> requestEntity = new HttpEntity<>(requestDTO, headers);
        String url = FASTAPI_BASE_URL + "/analisis-energetico";
        
        // El Gateway reenvía el DTO al microservicio Python y mapea la respuesta al ResponseDTO
        ResponseEntity<AnalisisResponseDTO> response = restTemplate.postForEntity(url, requestEntity, AnalisisResponseDTO.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody();
        } else {
            throw new RuntimeException("Error al comunicarse con el motor de IA de FastAPI. Código: " + response.getStatusCode());
        }
    }
    
    // Métodos delegados para el resto de endpoints (usando Map genérico temporalmente para no frenar el MVP)
    public Map listarResultados() {
        return restTemplate.getForObject(FASTAPI_BASE_URL + "/resultados", Map.class);
    }
    
    public Map consultarResultado(String id) {
        return restTemplate.getForObject(FASTAPI_BASE_URL + "/resultados/" + id, Map.class);
    }
    
    public Map actualizarResultado(String id, Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> response = restTemplate.exchange(FASTAPI_BASE_URL + "/resultados/" + id, org.springframework.http.HttpMethod.PUT, requestEntity, Map.class);
        return response.getBody();
    }
    
    public Map eliminarResultado(String id) {
        ResponseEntity<Map> response = restTemplate.exchange(FASTAPI_BASE_URL + "/resultados/" + id, org.springframework.http.HttpMethod.DELETE, null, Map.class);
        return response.getBody();
    }
    
    public Map convertirMoneda() {
        return restTemplate.getForObject(FASTAPI_BASE_URL + "/convertir-moneda", Map.class);
    }
}
