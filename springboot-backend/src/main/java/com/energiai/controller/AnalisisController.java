package com.energiai.controller;

import com.energiai.dto.AnalisisRequestDTO;
import com.energiai.dto.AnalisisResponseDTO;
import com.energiai.service.AnalisisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Análisis Energético", description = "Endpoints para el análisis de consumo eléctrico y gestión de resultados")
public class AnalisisController {

    private final AnalisisService analisisService;

    @Autowired
    public AnalisisController(AnalisisService analisisService) {
        this.analisisService = analisisService;
    }

    @Operation(
        summary = "Crear nuevo análisis energético",
        description = "Recibe los datos del usuario, los valida y los procesa usando el motor de Inteligencia Artificial para predecir la eficiencia energética.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Análisis procesado exitosamente",
                content = @Content(schema = @Schema(implementation = AnalisisResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos (ej. consumo negativo o campos vacíos)")
        }
    )
    @PostMapping("/analisis-energetico")
    public ResponseEntity<AnalisisResponseDTO> procesarAnalisis(
            @Valid @RequestBody AnalisisRequestDTO peticionDTO) {
        
        AnalisisResponseDTO resultado = analisisService.procesarAnalisis(peticionDTO);
        return ResponseEntity.ok(resultado);
    }

    @Operation(
        summary = "Evaluación de Perfil Energético (SAPI)", 
        description = "Punto de integración principal para SAPI. Recibe datos de consumo simulado y retorna el perfil de eficiencia, métricas diarias, proyecciones mensuales y alertas personalizadas.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Evaluación generada exitosamente",
                content = @Content(schema = @Schema(implementation = com.energiai.dto.EvaluacionPerfilResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada incompletos o mal formateados")
        }
    )
    @PostMapping("/v1/evaluar-perfil")
    public ResponseEntity<com.energiai.dto.EvaluacionPerfilResponseDTO> evaluarPerfil(
            @Valid @RequestBody com.energiai.dto.EvaluacionPerfilRequestDTO peticionDTO) {
        
        com.energiai.dto.EvaluacionPerfilResponseDTO resultado = analisisService.evaluarPerfil(peticionDTO);
        return ResponseEntity.ok(resultado);
    }

    @Operation(summary = "Listar resultados de análisis", description = "Obtiene todo el historial de análisis realizados.")
    @GetMapping("/resultados")
    public ResponseEntity<Map> listarResultados() {
        return ResponseEntity.ok(analisisService.listarResultados());
    }

    @Operation(summary = "Consultar resultado específico", description = "Obtiene un resultado por su ID.")
    @GetMapping("/resultados/{id}")
    public ResponseEntity<Map> consultarResultado(@PathVariable String id) {
        return ResponseEntity.ok(analisisService.consultarResultado(id));
    }

    @Operation(summary = "Actualizar resultado", description = "Actualiza los datos de un análisis existente.")
    @PutMapping("/resultados/{id}")
    public ResponseEntity<Map> actualizarResultado(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(analisisService.actualizarResultado(id, payload));
    }

    @Operation(summary = "Eliminar resultado", description = "Borra un análisis del historial por su ID.")
    @DeleteMapping("/resultados/{id}")
    public ResponseEntity<Map> eliminarResultado(@PathVariable String id) {
        return ResponseEntity.ok(analisisService.eliminarResultado(id));
    }

    @Operation(summary = "Obtener tasas de conversión de moneda", description = "Se conecta al microservicio Python para traer las tasas actuales de LATAM.")
    @GetMapping("/convertir-moneda")
    public ResponseEntity<Map> convertirMoneda() {
        return ResponseEntity.ok(analisisService.convertirMoneda());
    }
}
