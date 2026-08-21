#!/bin/bash
# ==============================================================================
# ⚡ EnergiAI - Script de Despliegue Automatizado en OCI Compute (Oracle Cloud)
# ==============================================================================
# Este script se ejecuta dentro de la Instancia VM de OCI para instalar Docker,
# clonar la rama BackendDesarrollo y levantar la arquitectura completa.

set -e

echo "=========================================================="
echo "⚡ Iniciando Despliegue de EnergiAI en OCI Compute"
echo "=========================================================="

# 1. Actualizar el sistema e instalar dependencias básicas
echo "[1/5] Actualizando paquetes e instalando Git, Curl y Docker..."
sudo apt-get update -y
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git

# 2. Instalar Docker y Docker Compose si no están presentes
if ! command -v docker &> /dev/null; then
    echo "[2/5] Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "[2/5] Instalando Docker Compose..."
    sudo apt-get install -y docker-compose-plugin docker-compose
fi

# 3. Abrir puertos de red en el Firewall del sistema de la VM (iptables/ufw)
echo "[3/5] Configurando reglas de Firewall para puertos 80, 443, 8080, 8000..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT || true
sudo netfilter-persistent save || true

# 4. Clonar o actualizar el repositorio
REPO_DIR="/home/ubuntu/EnergiAI"
if [ ! -d "$REPO_DIR" ]; then
    echo "[4/5] Clonando repositorio desde GitHub..."
    git clone -b BackendDesarrollo https://github.com/No-Country-simulation/G9-LATAM-Team-78.git "$REPO_DIR"
else
    echo "[4/5] Actualizando código del repositorio..."
    cd "$REPO_DIR"
    git fetch origin
    git checkout BackendDesarrollo
    git pull origin BackendDesarrollo
fi

cd "$REPO_DIR"

# 5. Construir y levantar contenedores con Docker Compose
echo "[5/5] Construyendo y ejecutando contenedores Docker..."
docker-compose down || true
docker-compose up --build -d

echo "=========================================================="
echo "🎉 ¡Despliegue Exitoso en OCI Compute!"
echo "=========================================================="
echo "Acceso a los servicios:"
echo " - Frontend Web:      http://<IP-PUBLICA-OCI>:3000 (o puerto 80)"
echo " - Spring Boot API:   http://<IP-PUBLICA-OCI>:8080/swagger-ui.html"
echo " - FastAPI Engine:    http://<IP-PUBLICA-OCI>:8000/docs"
echo "=========================================================="
