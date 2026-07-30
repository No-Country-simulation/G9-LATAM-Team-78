package com.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Datos de entrada para evaluar perfil energético (SAPI)")
public class EvaluacionPerfilRequestDTO {

    @NotBlank
    private String nombre_consumidor;

    @NotBlank
    private String tipo_inmueble;

    @NotBlank
    private String moneda_region;

    @NotNull
    private Integer cantidad_equipos;

    @NotBlank
    private String uso_horario_pico;

    @NotBlank
    private String horas_alto_consumo;

    @NotNull
    private Double consumo_kwh;

    // Getters y Setters
    public String getNombre_consumidor() { return nombre_consumidor; }
    public void setNombre_consumidor(String nombre_consumidor) { this.nombre_consumidor = nombre_consumidor; }

    public String getTipo_inmueble() { return tipo_inmueble; }
    public void setTipo_inmueble(String tipo_inmueble) { this.tipo_inmueble = tipo_inmueble; }

    public String getMoneda_region() { return moneda_region; }
    public void setMoneda_region(String moneda_region) { this.moneda_region = moneda_region; }

    public Integer getCantidad_equipos() { return cantidad_equipos; }
    public void setCantidad_equipos(Integer cantidad_equipos) { this.cantidad_equipos = cantidad_equipos; }

    public String getUso_horario_pico() { return uso_horario_pico; }
    public void setUso_horario_pico(String uso_horario_pico) { this.uso_horario_pico = uso_horario_pico; }

    public String getHoras_alto_consumo() { return horas_alto_consumo; }
    public void setHoras_alto_consumo(String horas_alto_consumo) { this.horas_alto_consumo = horas_alto_consumo; }

    public Double getConsumo_kwh() { return consumo_kwh; }
    public void setConsumo_kwh(Double consumo_kwh) { this.consumo_kwh = consumo_kwh; }
}
