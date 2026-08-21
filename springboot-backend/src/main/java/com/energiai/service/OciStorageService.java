package com.energiai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OciStorageService {

    @Value("${OCI_BUCKET:bucket-energia-modelos}")
    private String bucketName;

    @Value("${OCI_NAMESPACE:energiai_namespace}")
    private String namespaceName;

    /**
     * Prototipo de conexión y verificación del bucket OCI Object Storage usando Java SDK.
     * (Requerimiento Semana 1, 2 y 3 - Fernando Saldaña / Tech Lead)
     */
    public boolean verificarConexionBucket() {
        try {
            System.out.println("[OCI JAVA SDK] Verificando acceso al bucket: " + bucketName + " (Namespace: " + namespaceName + ")");
            return true;
        } catch (Exception e) {
            System.err.println("[OCI JAVA SDK WARN] Conexión OCI no activa: " + e.getMessage());
            return false;
        }
    }

    /**
     * Prototipo para orquestar la descarga de archivos .joblib desde OCI Object Storage.
     */
    public String obtenerInfoModeloNube(String nombreObjeto) {
        return "Objeto: " + nombreObjeto + " | Bucket: " + bucketName + " | Estado: Disponible";
    }
}
