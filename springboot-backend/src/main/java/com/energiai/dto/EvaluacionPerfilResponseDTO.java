package com.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Schema(description = "Respuesta de evaluación de perfil energético")
public class EvaluacionPerfilResponseDTO {

    private String estado;
    private Integer codigo_http;
    private Data data;

    public EvaluacionPerfilResponseDTO(String estado, Integer codigo_http, Data data) {
        this.estado = estado;
        this.codigo_http = codigo_http;
        this.data = data;
    }

    public static class Data {
        private String perfil_energetico;
        private DetallesEvaluacion detalles_evaluacion;

        public Data(String perfil_energetico, DetallesEvaluacion detalles_evaluacion) {
            this.perfil_energetico = perfil_energetico;
            this.detalles_evaluacion = detalles_evaluacion;
        }

        public String getPerfil_energetico() { return perfil_energetico; }
        public DetallesEvaluacion getDetalles_evaluacion() { return detalles_evaluacion; }
    }

    public static class DetallesEvaluacion {
        private Double consumo_diario_estimado;
        private Double proyeccion_mensual_kwh;
        private Double costo_estimado_mensual;
        private Double porcentaje_ahorro;
        private String alerta_habitos;

        public DetallesEvaluacion(Double consumo_diario_estimado, Double proyeccion_mensual_kwh, 
                                  Double costo_estimado_mensual, Double porcentaje_ahorro, String alerta_habitos) {
            this.consumo_diario_estimado = consumo_diario_estimado;
            this.proyeccion_mensual_kwh = proyeccion_mensual_kwh;
            this.costo_estimado_mensual = costo_estimado_mensual;
            this.porcentaje_ahorro = porcentaje_ahorro;
            this.alerta_habitos = alerta_habitos;
        }

        public Double getConsumo_diario_estimado() { return consumo_diario_estimado; }
        public Double getProyeccion_mensual_kwh() { return proyeccion_mensual_kwh; }
        public Double getCosto_estimado_mensual() { return costo_estimado_mensual; }
        public Double getPorcentaje_ahorro() { return porcentaje_ahorro; }
        public String getAlerta_habitos() { return alerta_habitos; }
    }

    public String getEstado() { return estado; }
    public Integer getCodigo_http() { return codigo_http; }
    public Data getData() { return data; }
}
