#!/bin/bash

# Script de inicio inteligente para el proyecto Asistente
# Detecta automáticamente la configuración y inicia el backend

echo "🚀 Iniciando proyecto Asistente con detección automática..."

# Función para verificar si PostgreSQL está corriendo
check_postgres_running() {
    if pg_isready -h localhost -p 5432 &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Función para iniciar PostgreSQL
start_postgres() {
    echo "🔄 Iniciando PostgreSQL..."
    
    # Detectar sistema operativo y iniciar PostgreSQL
    if command -v brew &> /dev/null; then
        # macOS con Homebrew
        brew services start postgresql@14 2>/dev/null || brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        # Linux con systemd
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        # Linux con service
        sudo service postgresql start
    else
        echo "⚠️  No se pudo detectar cómo iniciar PostgreSQL automáticamente"
        echo "   Por favor inicia PostgreSQL manualmente y vuelve a ejecutar este script"
        exit 1
    fi
    
    # Esperar a que PostgreSQL esté listo
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    for i in {1..30}; do
        if check_postgres_running; then
            echo "✅ PostgreSQL está corriendo"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ PostgreSQL no se inició correctamente"
    exit 1
}

# Función para detectar configuración automáticamente
detect_database_config() {
    echo "🔍 Detectando configuración de base de datos..."
    
    # Ejecutar script de detección automática
    if ./auto-setup.sh; then
        echo "✅ Configuración detectada automáticamente"
        return 0
    else
        echo "⚠️  No se pudo detectar configuración automáticamente"
        return 1
    fi
}

# Función para iniciar el backend
start_backend() {
    echo "🚀 Iniciando backend Spring Boot..."
    
    # Verificar si Maven está disponible
    if ! command -v mvn &> /dev/null; then
        echo "❌ Maven no está instalado. Por favor instálalo primero:"
        echo "   macOS: brew install maven"
        echo "   Ubuntu: sudo apt install maven"
        exit 1
    fi
    
    # Iniciar el backend
    echo "🔧 Ejecutando: mvn spring-boot:run"
    mvn spring-boot:run
}

# Función principal
main() {
    echo "🎯 Proyecto Asistente - Inicio Inteligente"
    echo "=========================================="
    
    # Verificar si PostgreSQL está corriendo
    if ! check_postgres_running; then
        echo "⚠️  PostgreSQL no está corriendo"
        start_postgres
    else
        echo "✅ PostgreSQL está corriendo"
    fi
    
    # Detectar configuración de base de datos
    if detect_database_config; then
        echo "✅ Configuración de base de datos detectada"
    else
        echo "⚠️  Usando configuración por defecto"
    fi
    
    # Iniciar el backend
    start_backend
}

# Ejecutar función principal
main
