# ☁️ Guía Completa de Despliegue de Infraestructura en Oracle Cloud Infrastructure (OCI)

> **Proyecto EnergiAI - Hackathon No Country**

Esta guía proporciona el procedimiento paso a paso para desplegar la arquitectura completa de **EnergiAI** (Frontend React, API Gateway Spring Boot, Motor FastAPI e Inferencia ML) en una instancia **OCI Compute VM (Always Free / Producción)** conectada a **OCI Object Storage**.

---

## 🏛️ Arquitectura de Infraestructura en OCI

```mermaid
flowchart TD
    subgraph Internet
        User[👤 Usuario / Navegador Web]
    end

    subgraph OCI Virtual Cloud Network (VCN)
        subgraph Ingress Firewall / Security List
            Port80[Port 80 / 3000: Frontend]
            Port8080[Port 8080: Spring Boot Gateway]
            Port8000[Port 8000: FastAPI Engine]
        end

        subgraph OCI Compute VM (Ubuntu 22.04 LTS)
            Frontend[💻 React Frontend Container]
            Gateway[☕ Spring Boot Gateway Container]
            FastAPI[🐍 FastAPI ML Engine Container]
        end
    end

    subgraph OCI Storage Tier
        Bucket[(☁️ OCI Object Storage\nBucket: bucket-energia-modelos\nPersistencia JSON & .joblib)]
    end

    User --> Port80 --> Frontend
    Frontend --> Port8080 --> Gateway
    Gateway --> Port8000 --> FastAPI
    FastAPI <-->|OCI Python SDK / API Key| Bucket
```

---

## 📋 Fase 1: Creación de la Instancia VM en OCI Console

### Step 1: Iniciar Sesión en Oracle Cloud
1. Entra a la consola de OCI: [https://cloud.oracle.com](https://cloud.oracle.com).
2. Selecciona tu región primaria (Ej: `sa-saopaulo-1` o `us-ashburn-1`).

### Step 2: Crear la Instancia Compute (Virtual Machine)
1. Navega a **Compute -> Instances** y haz clic en **Create Instance**.
2. **Name**: `energiai-production-vm`.
3. **Image and Shape**:
   - **Image**: `Ubuntu 22.04 LTS` (o `Oracle Linux 8`).
   - **Shape**: `VM.Standard.A1.Flex` (Ampere ARM, 4 OCPUs, 24 GB RAM - *Always Free*) o `VM.Standard.E2.1.Micro` (AMD).
4. **Networking**:
   - Selecciona o crea una **Virtual Cloud Network (VCN)**.
   - Subred: **Public Subnet**.
   - Asignar IP Pública: **Assign a public IPv4 address**.
5. **Add SSH Keys**:
   - Selecciona **Generate a key pair for me** y descarga la clave privada (`ssh-key.key`).
6. Haz clic en **Create**.

---

## 🛡️ Fase 2: Configuración de Reglas de Ingress (Firewall OCI)

Para permitir el tráfico HTTP externo hacia los microservicios, abre los puertos en la **Security List** de la VCN:

1. En la consola OCI, ve a **Networking -> Virtual Cloud Networks**.
2. Haz clic en tu VCN y luego en la **Public Subnet**.
3. Selecciona la **Default Security List**.
4. Haz clic en **Add Ingress Rules**:

| Source CIDR | IP Protocol | Destination Port Range | Descripción |
|-------------|-------------|------------------------|-------------|
| `0.0.0.0/0` | TCP | `80` | Tráfico Web HTTP |
| `0.0.0.0/0` | TCP | `443` | Tráfico Seguro HTTPS |
| `0.0.0.0/0` | TCP | `3000` | Frontend React Container |
| `0.0.0.0/0` | TCP | `8080` | Spring Boot Gateway |
| `0.0.0.0/0` | TCP | `8000` | FastAPI Engine & Swagger |

---

## ☁️ Fase 3: Configuración de OCI Object Storage

1. Ve a **Storage -> Object Storage & Archive Storage -> Buckets**.
2. Haz clic en **Create Bucket**:
   - **Bucket Name**: `bucket-energia-modelos`
   - **Default Storage Tier**: `Standard`
   - **Access Type**: `No Public Access` (Privado)
   - **Versioning**: `Enabled`
3. **Generar API Key para Backend**:
   - Ve a **Identity & Security -> Users -> User Details -> API Keys**.
   - Haz clic en **Add API Key** y descarga la clave privada `.pem`.
   - Copia el bloque de configuración generado (`user`, `fingerprint`, `tenancy`, `region`).

---

## 🚀 Fase 4: Despliegue Automatizado en la VM (SSH)

### Step 1: Conectarse a la Instancia por SSH
Abre tu consola local en la carpeta donde descargaste la clave privada SSH:

```bash
chmod 400 ssh-key.key
ssh -i ssh-key.key ubuntu@<TU_IP_PUBLICA_OCI>
```

### Step 2: Ejecutar el Script de Despliegue de EnergiAI
Dentro de la terminal SSH de la VM en OCI, ejecuta el siguiente comando:

```bash
curl -sSL https://raw.githubusercontent.com/No-Country-simulation/G9-LATAM-Team-78/BackendDesarrollo/scripts/deploy_oci_compute.sh | bash
```

*El script realizará automáticamente:*
- Instalación de Docker y Docker Compose.
- Apertura de puertos en el Firewall local de la VM (`iptables`).
- Clonación de la rama `BackendDesarrollo`.
- Construcción y ejecución de los 3 contenedores (`fastapi-ai`, `springboot-gateway`, `react-frontend`).

---

## ✅ Fase 5: Verificación del Despliegue en Producción

Una vez finalizado el script, accede desde cualquier navegador a la IP Pública asignada por Oracle Cloud:

- 💻 **Aplicación Web Frontend**: `http://<TU_IP_PUBLICA_OCI>:3000` *(o puerto 80)*
- ☕ **Spring Boot API Gateway**: `http://<TU_IP_PUBLICA_OCI>:8080/swagger-ui.html`
- 🐍 **FastAPI ML Engine Docs**: `http://<TU_IP_PUBLICA_OCI>:8000/docs`

---

## 🛠️ Comandos de Mantenimiento en OCI

```bash
# Ver estado de los contenedores en la VM
docker-compose ps

# Ver logs en tiempo real del Gateway Spring Boot
docker-compose logs -f springboot-gateway

# Ver logs en tiempo real del Motor FastAPI
docker-compose logs -f fastapi-ai

# Reiniciar todos los servicios
docker-compose restart
```
