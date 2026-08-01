"""
Script de Automatización OCI Object Storage - EnergiAI (Sprint 2)
Responsable: Tech Lead / Equipo Backend

Este script automatiza la creación y verificación del bucket 'energiai-bucket'
en Oracle Cloud Infrastructure (OCI) con las políticas y permisos correspondientes.
"""

import os
import sys

def main():
    print("==========================================================")
    print("⚡ EnergiAI - Configuración de OCI Object Storage (Sprint 2)")
    print("==========================================================")

    oci_config_path = os.getenv("OCI_CONFIG_PATH", os.path.expanduser("~/.oci/config"))
    oci_namespace = os.getenv("OCI_NAMESPACE", "energiai_namespace")
    oci_bucket = os.getenv("OCI_BUCKET", "energiai-bucket")

    try:
        import oci
    except ImportError:
        print("[ERROR] El SDK de OCI no está instalado. Ejecute: pip install oci")
        sys.exit(1)

    if not os.path.exists(oci_config_path):
        print(f"[INFO] Archivo de configuración OCI no encontrado en: {oci_config_path}")
        print("[GUÍA] Cree el archivo ~/.oci/config o declare las variables de entorno:")
        print("       - OCI_USER, OCI_FINGERPRINT, OCI_TENANCY, OCI_REGION, OCI_KEY_CONTENT")
        print("\n[MODO DEMO] El backend funcionará con persistencia local/fallback automáticamente.")
        return

    try:
        config = oci.config.from_file(oci_config_path)
        object_storage = oci.object_storage.ObjectStorageClient(config)
        
        # 1. Obtener Namespace
        namespace = object_storage.get_namespace().data
        print(f"[OK] Conectado a OCI Tenancy. Namespace: {namespace}")

        # 2. Verificar si el Bucket existe
        try:
            bucket_info = object_storage.get_bucket(namespace_name=namespace, bucket_name=oci_bucket)
            print(f"[OK] El bucket '{oci_bucket}' ya existe y está listo para recibir modelos y análisis JSON.")
        except oci.exceptions.ServiceError as e:
            if e.status == 404:
                print(f"[CREANDO] El bucket '{oci_bucket}' no existe. Creando nuevo bucket en OCI...")
                compartment_id = config["tenancy"]
                create_bucket_details = oci.object_storage.models.CreateBucketDetails(
                    name=oci_bucket,
                    compartment_id=compartment_id,
                    public_access_type="NoPublicAccess",
                    storage_tier="Standard"
                )
                object_storage.create_bucket(namespace_name=namespace, create_bucket_details=create_bucket_details)
                print(f"[EXITO] Bucket '{oci_bucket}' creado exitosamente en OCI Object Storage.")
            else:
                print(f"[ERROR OCI] {e.message}")

    except Exception as err:
        print(f"[ERROR CONFIGURACION OCI] {err}")

if __name__ == "__main__":
    main()
