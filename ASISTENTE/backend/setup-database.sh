#!/bin/bash

# Script para configurar la base de datos en un nuevo entorno
# Ejecutar: chmod +x setup-database.sh && ./setup-database.sh

echo "🗄️  Configurando base de datos para el proyecto Asistente..."

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado. Por favor instálalo primero:"
    echo "   macOS: brew install postgresql@14"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "   Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

# Verificar si PostgreSQL está corriendo
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "🔄 Iniciando PostgreSQL..."
    # Intentar iniciar PostgreSQL
    if command -v brew &> /dev/null; then
        brew services start postgresql@14
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    else
        echo "⚠️  Por favor inicia PostgreSQL manualmente"
    fi
    
    # Esperar a que esté listo
    sleep 3
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "❌ No se pudo conectar a PostgreSQL. Verifica que esté corriendo."
        exit 1
    fi
fi

echo "✅ PostgreSQL está corriendo"

# Crear base de datos
echo "📊 Creando base de datos 'asistente_db'..."
createdb asistente_db 2>/dev/null || echo "⚠️  La base de datos 'asistente_db' ya existe"

# Crear usuario (opcional)
echo "👤 Creando usuario 'asistente_user'..."
psql -d postgres -c "CREATE USER asistente_user WITH PASSWORD 'asistente123';" 2>/dev/null || echo "⚠️  El usuario 'asistente_user' ya existe"

# Dar permisos
echo "🔐 Otorgando permisos..."
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE asistente_db TO asistente_user;" 2>/dev/null || echo "⚠️  Error al otorgar permisos"

echo "✅ Base de datos configurada correctamente"
echo ""
echo "📝 Configuración recomendada para application.properties:"
echo "   spring.datasource.url=jdbc:postgresql://localhost:5432/asistente_db"
echo "   spring.datasource.username=asistente_user"
echo "   spring.datasource.password=asistente123"
echo ""
echo "🚀 Ahora puedes ejecutar: mvn spring-boot:run"
