#!/usr/bin/env python3
"""
EnergiAI - Notebook de Ciencia de Datos
========================================
Hackathón ONE - Análisis de Perfiles de Consumo Energético

Contenido:
  1. Generación y exploración del dataset (EDA)
  2. Procesamiento y transformación de variables
  3. Entrenamiento de modelos supervisados (Random Forest + Logistic Regression)
  4. Evaluación con métricas adecuadas
  5. Generación de recomendaciones basadas en reglas
  6. Serialización del modelo entrenado
  7. Prueba del endpoint simulado

Ejecutar como script Python:
    python energiai_modelo.py

Para convertir a Jupyter Notebook:
    pip install jupytext
    jupytext --to notebook energiai_modelo.py
"""

# ── 0. Instalación de dependencias ──────────────────────────────────
# pip install pandas numpy scikit-learn matplotlib seaborn joblib

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Sin display (para scripts)
import seaborn as sns
import joblib
import json
import os
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix,
    accuracy_score, precision_score, recall_score, f1_score
)
from sklearn.pipeline import Pipeline

print("=" * 60)
print("EnergiAI - Notebook de Ciencia de Datos")
print("Hackathón ONE - Análisis Energético")
print("=" * 60)

# ── 1. GENERACIÓN DEL DATASET ───────────────────────────────────────
print("\n[1/7] Generando dataset sintético...")

np.random.seed(42)
N = 500  # 500 registros simulados

# Tipos de inmueble con distribución realista
tipos = np.random.choice(
    ['Casa', 'Apartamento', 'Oficina', 'Comercio'],
    size=N, p=[0.45, 0.30, 0.15, 0.10]
)

# Consumo mensual base por tipo de inmueble (kWh)
baseline_por_tipo = {'Casa': 350, 'Apartamento': 220, 'Oficina': 500, 'Comercio': 700}
cantidad_equipos = np.random.randint(3, 35, size=N)
horas_alto_consumo = np.random.randint(2, 20, size=N)
uso_horario_pico = np.random.choice([True, False], size=N, p=[0.55, 0.45])

# Calcular consumo_kwh con ruido realista
consumo_kwh = []
for i in range(N):
    base = baseline_por_tipo[tipos[i]]
    # Ajustar por equipos y horas de uso
    ajuste_equipos = cantidad_equipos[i] * np.random.uniform(7, 12)
    ajuste_horas = horas_alto_consumo[i] * np.random.uniform(5, 15)
    ajuste_pico = np.random.uniform(1.0, 1.25) if uso_horario_pico[i] else 1.0
    ruido = np.random.normal(0, 30)
    kwh = (base + ajuste_equipos + ajuste_horas) * ajuste_pico + ruido
    consumo_kwh.append(max(50, kwh))  # mínimo 50 kWh

consumo_kwh = np.array(consumo_kwh)

# Etiquetado según reglas de negocio (ground truth)
def etiquetar_perfil(kwh, tipo, equipos, horas, pico):
    baseline = baseline_por_tipo[tipo] + equipos * 8
    ratio = kwh / baseline
    if pico: ratio *= 1.12
    if horas > 10: ratio *= 1.08
    if ratio > 1.35: return 'Ineficiente'
    if ratio > 1.05: return 'Moderado'
    return 'Eficiente'

etiquetas = [
    etiquetar_perfil(consumo_kwh[i], tipos[i], cantidad_equipos[i], horas_alto_consumo[i], uso_horario_pico[i])
    for i in range(N)
]

# Crear DataFrame
df = pd.DataFrame({
    'consumo_kwh': consumo_kwh.round(1),
    'uso_horario_pico': uso_horario_pico.astype(int),
    'cantidad_equipos': cantidad_equipos,
    'tipo_inmueble': tipos,
    'horas_alto_consumo': horas_alto_consumo,
    'perfil_energetico': etiquetas,
})

# Estimación financiera (tarifa estándar $0.75/kWh)
TARIFA_REFERENCIA = 0.75
df['costo_estimado_mensual'] = (df['consumo_kwh'] * TARIFA_REFERENCIA).round(2)

print(f"  ✅ Dataset creado: {len(df)} registros")
print(f"  Distribución de perfiles:")
dist = df['perfil_energetico'].value_counts()
for perfil, count in dist.items():
    print(f"    {perfil}: {count} ({count/N*100:.1f}%)")

# ── 2. EXPLORACIÓN DE DATOS (EDA) ───────────────────────────────────
print("\n[2/7] Análisis Exploratorio de Datos (EDA)...")

print("\n  Estadísticas descriptivas (consumo_kwh):")
print(df[['consumo_kwh', 'cantidad_equipos', 'horas_alto_consumo', 'costo_estimado_mensual']].describe().round(2).to_string())

# Guardar gráficos
os.makedirs('graficos', exist_ok=True)

# Gráfico 1: Distribución de perfiles
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('EnergiAI - Análisis Exploratorio de Datos', fontsize=16, fontweight='bold')

colors = {'Eficiente': '#10b981', 'Moderado': '#f59e0b', 'Ineficiente': '#f43f5e'}
perfil_counts = df['perfil_energetico'].value_counts()
axes[0, 0].bar(perfil_counts.index, perfil_counts.values,
               color=[colors[p] for p in perfil_counts.index])
axes[0, 0].set_title('Distribución de Perfiles Energéticos')
axes[0, 0].set_ylabel('Cantidad de registros')
for i, (perfil, count) in enumerate(perfil_counts.items()):
    axes[0, 0].text(i, count + 2, f'{count/N*100:.1f}%', ha='center', fontsize=9)

# Gráfico 2: Consumo por perfil
df.boxplot(column='consumo_kwh', by='perfil_energetico', ax=axes[0, 1],
           boxprops=dict(color='#7dd3fc'), medianprops=dict(color='#f59e0b'))
axes[0, 1].set_title('Consumo kWh por Perfil')
axes[0, 1].set_xlabel('')
plt.sca(axes[0, 1])

# Gráfico 3: Consumo por tipo de inmueble
tipo_consumo = df.groupby(['tipo_inmueble', 'perfil_energetico'])['consumo_kwh'].mean().unstack()
tipo_consumo.plot(kind='bar', ax=axes[1, 0],
                  color=[colors[c] for c in tipo_consumo.columns])
axes[1, 0].set_title('Consumo Promedio por Tipo de Inmueble y Perfil')
axes[1, 0].set_ylabel('kWh promedio')
axes[1, 0].legend(title='Perfil')
axes[1, 0].tick_params(axis='x', rotation=30)

# Gráfico 4: Correlación (variables numéricas)
numeric_cols = ['consumo_kwh', 'cantidad_equipos', 'horas_alto_consumo',
                'uso_horario_pico', 'costo_estimado_mensual']
corr = df[numeric_cols].corr()
sns.heatmap(corr, ax=axes[1, 1], annot=True, fmt='.2f', cmap='RdYlGn',
            center=0, linewidths=0.5)
axes[1, 1].set_title('Matriz de Correlación')

plt.tight_layout()
plt.savefig('graficos/eda_energiai.png', dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ Gráfico EDA guardado en: graficos/eda_energiai.png")

# ── 3. PROCESAMIENTO Y TRANSFORMACIÓN ───────────────────────────────
print("\n[3/7] Procesamiento y transformación de variables...")

# Codificar tipo_inmueble
le_tipo = LabelEncoder()
df['tipo_inmueble_enc'] = le_tipo.fit_transform(df['tipo_inmueble'])

# Codificar etiqueta objetivo
le_perfil = LabelEncoder()
df['perfil_enc'] = le_perfil.fit_transform(df['perfil_energetico'])

print(f"  Clases del modelo: {list(le_perfil.classes_)}")
print(f"  Mapeo: {dict(zip(le_perfil.classes_, le_perfil.transform(le_perfil.classes_)))}")

# Features y target
FEATURES = ['consumo_kwh', 'uso_horario_pico', 'cantidad_equipos',
            'tipo_inmueble_enc', 'horas_alto_consumo']
TARGET = 'perfil_enc'

X = df[FEATURES]
y = df[TARGET]

# División train/test estratificada
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"  Train: {len(X_train)} | Test: {len(X_test)}")

# ── 4. ENTRENAMIENTO DE MODELOS ──────────────────────────────────────
print("\n[4/7] Entrenamiento de modelos supervisados...")

modelos = {
    'Logistic Regression': Pipeline([
        ('scaler', StandardScaler()),
        ('clf', LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'))
    ]),
    'Decision Tree': Pipeline([
        ('clf', DecisionTreeClassifier(max_depth=8, random_state=42, class_weight='balanced'))
    ]),
    'Random Forest': Pipeline([
        ('clf', RandomForestClassifier(
            n_estimators=150, max_depth=10, random_state=42,
            class_weight='balanced', min_samples_leaf=3
        ))
    ]),
}

resultados = {}
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for nombre, pipeline in modelos.items():
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring='f1_weighted')
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    resultados[nombre] = {
        'modelo': pipeline,
        'cv_f1_mean': cv_scores.mean(),
        'cv_f1_std': cv_scores.std(),
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
        'f1': f1_score(y_test, y_pred, average='weighted', zero_division=0),
    }

    print(f"\n  📊 {nombre}")
    print(f"    CV F1 (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"    Accuracy:  {resultados[nombre]['accuracy']:.4f}")
    print(f"    Precision: {resultados[nombre]['precision']:.4f}")
    print(f"    Recall:    {resultados[nombre]['recall']:.4f}")
    print(f"    F1-Score:  {resultados[nombre]['f1']:.4f}")

# ── 5. EVALUACIÓN Y SELECCIÓN DEL MEJOR MODELO ─────────────────────
print("\n[5/7] Evaluación y selección del mejor modelo...")

mejor_nombre = max(resultados, key=lambda k: resultados[k]['f1'])
mejor = resultados[mejor_nombre]
print(f"  🏆 Mejor modelo: {mejor_nombre}")
print(f"     F1-Score: {mejor['f1']:.4f} | Accuracy: {mejor['accuracy']:.4f}")

# Reporte completo del mejor modelo
y_pred_mejor = mejor['modelo'].predict(X_test)
print(f"\n  Reporte de Clasificación ({mejor_nombre}):")
print(classification_report(y_test, y_pred_mejor,
      target_names=le_perfil.classes_, digits=4))

# Matriz de confusión
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
cm = confusion_matrix(y_test, y_pred_mejor)
sns.heatmap(cm, annot=True, fmt='d', ax=axes[0],
            xticklabels=le_perfil.classes_, yticklabels=le_perfil.classes_,
            cmap='Blues')
axes[0].set_title(f'Matriz de Confusión - {mejor_nombre}')
axes[0].set_ylabel('Real')
axes[0].set_xlabel('Predicho')

# Feature importance (si es Random Forest)
if mejor_nombre == 'Random Forest':
    clf = mejor['modelo'].named_steps['clf']
    importancias = pd.Series(clf.feature_importances_, index=FEATURES).sort_values(ascending=True)
    importancias.plot(kind='barh', ax=axes[1], color='#10b981')
    axes[1].set_title('Importancia de Variables (Random Forest)')
    axes[1].set_xlabel('Importancia')

plt.tight_layout()
plt.savefig('graficos/evaluacion_modelo.png', dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ Gráfico de evaluación guardado en: graficos/evaluacion_modelo.png")

# ── 6. SERIALIZACIÓN DEL MODELO ─────────────────────────────────────
print("\n[6/7] Serialización del modelo...")

os.makedirs('modelo', exist_ok=True)
joblib.dump(mejor['modelo'], 'modelo/energiai_model.joblib')
joblib.dump(le_perfil, 'modelo/label_encoder.joblib')
joblib.dump(le_tipo, 'modelo/tipo_encoder.joblib')

# Guardar metadata del modelo
metadata = {
    "modelo": mejor_nombre,
    "features": FEATURES,
    "clases": list(le_perfil.classes_),
    "metricas": {
        "accuracy": round(mejor['accuracy'], 4),
        "f1_weighted": round(mejor['f1'], 4),
        "cv_f1_mean": round(mejor['cv_f1_mean'], 4),
    },
    "tarifa_referencia_usd_kwh": TARIFA_REFERENCIA,
    "version": "1.0.0",
}
with open('modelo/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"  ✅ Modelo guardado: modelo/energiai_model.joblib")
print(f"  ✅ Encoder guardado: modelo/label_encoder.joblib")
print(f"  ✅ Metadata guardado: modelo/metadata.json")

# ── 7. PRUEBA DEL ENDPOINT SIMULADO ─────────────────────────────────
print("\n[7/7] Prueba con ejemplos del endpoint...")

ejemplos_prueba = [
    {
        "consumidor": "Ana Martínez",
        "consumo_kwh": 180, "uso_horario_pico": False,
        "cantidad_equipos": 6, "tipo_inmueble": "Apartamento", "horas_alto_consumo": 4
    },
    {
        "consumidor": "Carlos López",
        "consumo_kwh": 420, "uso_horario_pico": True,
        "cantidad_equipos": 10, "tipo_inmueble": "Casa", "horas_alto_consumo": 8
    },
    {
        "consumidor": "Roberto Silva",
        "consumo_kwh": 980, "uso_horario_pico": True,
        "cantidad_equipos": 25, "tipo_inmueble": "Casa", "horas_alto_consumo": 14
    },
]

modelo_cargado = joblib.load('modelo/energiai_model.joblib')
encoder_cargado = joblib.load('modelo/label_encoder.joblib')
tipo_enc_cargado = joblib.load('modelo/tipo_encoder.joblib')

tipo_map = {t: i for i, t in enumerate(tipo_enc_cargado.classes_)}

print()
for ej in ejemplos_prueba:
    features = np.array([[
        ej['consumo_kwh'],
        int(ej['uso_horario_pico']),
        ej['cantidad_equipos'],
        tipo_map.get(ej['tipo_inmueble'], 0),
        ej['horas_alto_consumo'],
    ]])
    pred_enc = modelo_cargado.predict(features)[0]
    probas = modelo_cargado.predict_proba(features)[0]
    categoria = encoder_cargado.inverse_transform([pred_enc])[0]
    probabilidad = round(float(max(probas)), 2)
    costo = round(ej['consumo_kwh'] * TARIFA_REFERENCIA, 2)

    resultado_json = {
        "consumidor": ej['consumidor'],
        "categoria": categoria,
        "probabilidad": probabilidad,
        "costo_estimado_mensual": costo,
    }
    print(f"  {ej['consumidor']:20s} → {categoria:12s} ({probabilidad:.0%}) | ${costo:.2f} USD/mes")

print("\n" + "=" * 60)
print("✅ Notebook completado exitosamente")
print("📂 Archivos generados:")
print("   - modelo/energiai_model.joblib   (modelo entrenado)")
print("   - modelo/label_encoder.joblib    (codificador de etiquetas)")
print("   - modelo/metadata.json           (metadatos del modelo)")
print("   - graficos/eda_energiai.png      (análisis exploratorio)")
print("   - graficos/evaluacion_modelo.png (métricas de evaluación)")
print("=" * 60)
