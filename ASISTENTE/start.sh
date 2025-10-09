#!/bin/bash

# Script de inicio súper simple para el proyecto Asistente
# Solo ejecuta: ./start.sh

echo "🚀 Iniciando Proyecto Asistente..."

# Ir al directorio del backend
cd ASISTENTE/backend

# Detectar configuración automáticamente
echo "🔍 Detectando configuración de base de datos..."
if ./auto-setup.sh; then
    echo "✅ Configuración detectada automáticamente"
    # Usar la configuración detectada
    cp application-auto-detected.properties application.properties
else
    echo "⚠️  Usando configuración por defecto"
fi

# Iniciar el backend
echo "🚀 Iniciando backend..."
mvn spring-boot:run
