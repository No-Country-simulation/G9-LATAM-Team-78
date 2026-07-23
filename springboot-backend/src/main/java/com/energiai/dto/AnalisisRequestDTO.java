package com.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Datos de entrada para solicitar un análisis energético")
public class AnalisisRequestDTO {

    @NotBlank(message = "El nombre del consumidor es obligatorio")
    @Schema(description = "Nombre del usuario", example = "María García")
    private String consumidor;

    @NotNull(message = "El consumo en kWh es obligatorio")
    @Min(value = 0, message = "El consumo no puede ser negativo")
    @Schema(description = "Consumo mensual en kWh", example = "350.5")
    private Double consumo_kwh;

    @NotNull(message = "Debe indicar si el uso es en horario pico")
    @Schema(description = "Indica si el mayor consumo es en horario pico (18:00-22:00)", example = "true")
    private Boolean uso_horario_pico;

    @NotNull(message = "La cantidad de equipos es obligatoria")
    @Min(value = 1, message = "Debe tener al menos 1 equipo")
    @Max(value = 100, message = "La cantidad máxima permitida es 100")
    @Schema(description = "Cantidad de equipos eléctricos activos", example = "8")
    private Integer cantidad_equipos;

    @NotBlank(message = "El tipo de inmueble es obligatorio")
    @Pattern(regexp = "^(Casa|Apartamento|Oficina|Comercio)$", message = "El tipo de inmueble debe ser Casa, Apartamento, Oficina o Comercio")
    @Schema(description = "Tipo de inmueble", example = "Casa")
    private String tipo_inmueble;

    @NotNull(message = "Las horas de alto consumo son obligatorias")
    @Min(value = 1, message = "Debe indicar al menos 1 hora")
    @Max(value = 24, message = "No puede exceder las 24 horas")
    @Schema(description = "Horas de alto consumo por día", example = "5")
    private Integer horas_alto_consumo;
    
    @Schema(description = "Código de moneda/región", example = "USD", defaultValue = "USD")
    private String moneda_region;

    // Getters y Setters
    public String getConsumidor() { return consumidor; }
    public void setConsumidor(String consumidor) { this.consumidor = consumidor; }
    
    public Double getConsumo_kwh() { return consumo_kwh; }
    public void setConsumo_kwh(Double consumo_kwh) { this.consumo_kwh = consumo_kwh; }
    
    public Boolean getUso_horario_pico() { return uso_horario_pico; }
    public void setUso_horario_pico(Boolean uso_horario_pico) { this.uso_horario_pico = uso_horario_pico; }
    
    public Integer getCantidad_equipos() { return cantidad_equipos; }
    public void setCantidad_equipos(Integer cantidad_equipos) { this.cantidad_equipos = cantidad_equipos; }
    
    public String getTipo_inmueble() { return tipo_inmueble; }
    public void setTipo_inmueble(String tipo_inmueble) { this.tipo_inmueble = tipo_inmueble; }
    
    public Integer getHoras_alto_consumo() { return horas_alto_consumo; }
    public void setHoras_alto_consumo(Integer horas_alto_consumo) { this.horas_alto_consumo = horas_alto_consumo; }

    public String getMoneda_region() { return moneda_region; }
    public void setMoneda_region(String moneda_region) { this.moneda_region = moneda_region; }
}
