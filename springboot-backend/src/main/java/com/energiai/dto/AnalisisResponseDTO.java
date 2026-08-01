package com.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

@Schema(description = "Datos de respuesta del análisis energético")
public class AnalisisResponseDTO {

    @Schema(description = "ID único del análisis", example = "uuid-1234")
    private String id_analisis;

    @Schema(description = "Fecha y hora del análisis", example = "2026-07-20T10:00:00Z")
    private String timestamp;

    @Schema(description = "Nombre del consumidor", example = "María García")
    private String consumidor;

    @Schema(description = "Categoría de eficiencia calculada por la IA", example = "Ineficiente")
    private String categoria;

    @Schema(description = "Probabilidad de la predicción (0.0 a 1.0)", example = "0.88")
    private Double probabilidad;

    @Schema(description = "Lista de recomendaciones generadas", example = "[\"Desconectar equipos sin uso\", \"Cambiar a iluminación LED\"]")
    private List<String> recomendaciones;

    @Schema(description = "Costo estimado mensual en la tarifa de referencia", example = "315.00")
    private Double costo_estimado_mensual;

    @Schema(description = "Estimación de costos y ahorro")
    private EstimacionFinancieraDTO estimacion_financiera;
    
    @Schema(description = "Detalle del perfil enviado")
    private Map<String, Object> perfil_detalle;

    // Getters y Setters
    public String getId_analisis() { return id_analisis; }
    public void setId_analisis(String id_analisis) { this.id_analisis = id_analisis; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getConsumidor() { return consumidor; }
    public void setConsumidor(String consumidor) { this.consumidor = consumidor; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Double getProbabilidad() { return probabilidad; }
    public void setProbabilidad(Double probabilidad) { this.probabilidad = probabilidad; }

    public List<String> getRecomendaciones() { return recomendaciones; }
    public void setRecomendaciones(List<String> recomendaciones) { this.recomendaciones = recomendaciones; }

    public Double getCosto_estimado_mensual() { return costo_estimado_mensual; }
    public void setCosto_estimado_mensual(Double costo_estimado_mensual) { this.costo_estimado_mensual = costo_estimado_mensual; }

    public EstimacionFinancieraDTO getEstimacion_financiera() { return estimacion_financiera; }
    public void setEstimacion_financiera(EstimacionFinancieraDTO estimacion_financiera) { this.estimacion_financiera = estimacion_financiera; }

    public Map<String, Object> getPerfil_detalle() { return perfil_detalle; }
    public void setPerfil_detalle(Map<String, Object> perfil_detalle) { this.perfil_detalle = perfil_detalle; }
    
    // Clase interna para la estimación financiera
    @Schema(description = "Detalles de estimación financiera")
    public static class EstimacionFinancieraDTO {
        @Schema(example = "350.5")
        private Double consumo_mensual_kwh;
        @Schema(example = "0.75")
        private Double tarifa_referencia_usd_kwh;
        @Schema(example = "262.87")
        private Double costo_estimado_mensual;
        @Schema(example = "45.50")
        private Double ahorro_potencial_mensual;

        // Getters y Setters
        public Double getConsumo_mensual_kwh() { return consumo_mensual_kwh; }
        public void setConsumo_mensual_kwh(Double consumo_mensual_kwh) { this.consumo_mensual_kwh = consumo_mensual_kwh; }

        public Double getTarifa_referencia_usd_kwh() { return tarifa_referencia_usd_kwh; }
        public void setTarifa_referencia_usd_kwh(Double tarifa_referencia_usd_kwh) { this.tarifa_referencia_usd_kwh = tarifa_referencia_usd_kwh; }

        public Double getCosto_estimado_mensual() { return costo_estimado_mensual; }
        public void setCosto_estimado_mensual(Double costo_estimado_mensual) { this.costo_estimado_mensual = costo_estimado_mensual; }

        public Double getAhorro_potencial_mensual() { return ahorro_potencial_mensual; }
        public void setAhorro_potencial_mensual(Double ahorro_potencial_mensual) { this.ahorro_potencial_mensual = ahorro_potencial_mensual; }
    }
}
