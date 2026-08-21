"""
Notebook / Script de Data Science - EnergiAI (Semana 1 y 2)
Generación Sintética de Datos (1,000 registros), EDA y Entrenamiento del Modelo ML (Random Forest)
"""

import os
import json
import random
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

# 1. Entorno y Reproducibilidad
SEED = 42
NUM_REGISTROS = 1000

random.seed(SEED)
np.random.seed(SEED)

# 2. Definición de Parámetros de Negocio y Regiones LATAM
TARIFA_KWH = 0.75
TIPOS_INMUEBLE = ["Casa", "Apartamento", "Oficina", "Comercio"]
REGIONES = ["USD", "MXN", "COP", "ARS", "CLP", "PEN", "BRL"]

# 3. Diccionarios de Lógica compartida con el Back-End
baseline_por_tipo = {
    "Apartamento": 220,
    "Casa": 350,
    "Oficina": 500,
    "Comercio": 700
}

factor_clima = {
    "USD": 1.00,
    "MXN": 1.15,
    "COP": 1.05,
    "ARS": 1.10,
    "CLP": 0.90,
    "PEN": 0.95,
    "BRL": 1.20
}

# 4. Funciones de Generación Sintética de Datos
def generar_consumo(row):
    tipo = row["tipo_inmueble"]
    region = row["moneda_region"]
    mes = row["mes"]
    equipos = row["cantidad_equipos"]
    
    # Consumo Base
    base = baseline_por_tipo[tipo] + (equipos * 8)
    
    # Factor de Clima / Región
    clima = factor_clima[region]
    
    # Factor Estacionalidad (picos en enero/febrero y julio/diciembre)
    factor_estacional = 1.15 if mes in [1, 2, 7, 12] else 1.00
    
    # Variabilidad Aleatoria Realista (+- 40%)
    variacion = np.random.uniform(0.60, 1.60)
    
    consumo_kwh = base * clima * factor_estacional * variacion
    return round(float(consumo_kwh), 2)

def clasificar_perfil(row):
    tipo = row["tipo_inmueble"]
    region = row["moneda_region"]
    equipos = row["cantidad_equipos"]
    consumo_real = row["consumo_kwh"]
    pico = row["uso_horario_pico"]
    horas = row["horas_alto_consumo"]
    dia = row["dia_semana"]
    
    # Baseline ajustado
    baseline_ajustado = (baseline_por_tipo[tipo] + (equipos * 8)) * factor_clima[region]
    ratio = consumo_real / max(baseline_ajustado, 1)
    
    # Penalizaciones operativas
    if pico == 1:
        ratio *= 1.15
    if horas > 8:
        ratio *= 1.10
    if dia >= 5 and horas > 6:
        ratio *= 1.05
        
    # Umbrales
    if ratio > 1.35:
        return "Ineficiente"
    elif ratio > 1.05:
        return "Moderado"
    else:
        return "Eficiente"

def generar_dataset():
    data = []
    for i in range(1, NUM_REGISTROS + 1):
        consumidor = f"Usuario_{i}"
        tipo = random.choice(TIPOS_INMUEBLE)
        region = random.choice(REGIONES)
        mes = random.randint(1, 12)
        dia = random.randint(0, 6)
        pico = 1 if random.random() < 0.60 else 0
        equipos = random.randint(1, 39)
        horas = random.randint(1, 13)
        
        row = {
            "consumidor": consumidor,
            "tipo_inmueble": tipo,
            "moneda_region": region,
            "mes": mes,
            "dia_semana": dia,
            "uso_horario_pico": pico,
            "cantidad_equipos": equipos,
            "horas_alto_consumo": horas
        }
        
        row["consumo_kwh"] = generar_consumo(row)
        row["perfil_energetico"] = clasificar_perfil(row)
        data.append(row)
        
    df = pd.DataFrame(data)
    return df

def main():
    print("==========================================================")
    print("  EnergiAI - Script de Data Science & Machine Learning")
    print("==========================================================")

    # Generación y exportación de Dataset Sintético
    df = generar_dataset()
    os.makedirs("data", exist_ok=True)
    csv_path = os.path.join("data", "dataset_inmuebles.csv")
    df.to_csv(csv_path, index=False)
    print(f"[OK] Dataset sintético generado (1,000 registros): {csv_path}")
    print(df["perfil_energetico"].value_counts())

    # Preprocesamiento y Entrenamiento del Modelo
    tipo_map = {"Casa": 0, "Apartamento": 1, "Oficina": 2, "Comercio": 3}
    X = pd.DataFrame({
        "consumo_kwh": df["consumo_kwh"],
        "uso_horario_pico": df["uso_horario_pico"],
        "cantidad_equipos": df["cantidad_equipos"],
        "tipo_inmueble": df["tipo_inmueble"].map(tipo_map),
        "horas_alto_consumo": df["horas_alto_consumo"]
    })
    
    le_target = LabelEncoder()
    y = le_target.fit_transform(df["perfil_energetico"])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED, stratify=y)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=SEED)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[EVALUACIÓN MODELO] Accuracy en test: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))

    # Serialización de Modelo y Encoders en dirs de backend y raíz
    for dir_path in ["modelo", os.path.join("backend", "modelo")]:
        os.makedirs(dir_path, exist_ok=True)
        joblib.dump(clf, os.path.join(dir_path, "energiai_model.joblib"))
        joblib.dump(le_target, os.path.join(dir_path, "label_encoder.joblib"))
        joblib.dump(tipo_map, os.path.join(dir_path, "tipo_encoder.joblib"))
        with open(os.path.join(dir_path, "metadata.json"), "w") as f:
            json.dump({
                "modelo": "RandomForestClassifier",
                "accuracy": float(acc),
                "registros_entrenamiento": len(X_train),
                "tarifa_referencia": TARIFA_KWH,
                "seed": SEED
            }, f, indent=2)

    print("[EXITO] Modelo entrenado y serializado (.joblib) guardado exitosamente.")

if __name__ == "__main__":
    main()
