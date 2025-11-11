"""
Script para ejecutar todas las pruebas de Selenium

"""
import sys
import os

# Importar el generador de reportes
from generar_reporte import ejecutar_pruebas_y_generar_reporte

if __name__ == "__main__":
    print("Iniciando ejecución de pruebas con reporte visual...")
    print("=" * 60)
    
    exit_code = ejecutar_pruebas_y_generar_reporte()
    
    sys.exit(exit_code)

