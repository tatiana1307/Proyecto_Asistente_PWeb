#!/bin/bash

# Script de configuración automática para el proyecto Asistente
# Detecta automáticamente la configuración de PostgreSQL disponible

echo "🔍 Detectando configuración automática de PostgreSQL..."

# Función para verificar conexión a PostgreSQL
check_postgres_connection() {
    local username=$1
    local password=$2
    local database=$3
    
    echo "🔗 Probando conexión con usuario: $username"
    
    if [ -n "$password" ]; then
        PGPASSWORD="$password" psql -h localhost -p 5432 -U "$username" -d "$database" -c "SELECT 1;" &>/dev/null
    else
        psql -h localhost -p 5432 -U "$username" -d "$database" -c "SELECT 1;" &>/dev/null
    fi
}

# Función para crear base de datos si no existe
create_database_if_not_exists() {
    local username=$1
    local password=$2
    local database=$3
    
    echo "📊 Verificando base de datos '$database'..."
    
    if [ -n "$password" ]; then
        PGPASSWORD="$password" psql -h localhost -p 5432 -U "$username" -d postgres -c "CREATE DATABASE $database;" 2>/dev/null || echo "✅ Base de datos '$database' ya existe"
    else
        psql -h localhost -p 5432 -U "$username" -d postgres -c "CREATE DATABASE $database;" 2>/dev/null || echo "✅ Base de datos '$database' ya existe"
    fi
}

# Detectar usuario del sistema
SYSTEM_USER=$(whoami)
echo "👤 Usuario del sistema detectado: $SYSTEM_USER"

# Lista de usuarios a probar (en orden de prioridad)
USERS_TO_TRY=("$SYSTEM_USER" "postgres" "asistente_user")

# Lista de bases de datos a probar
DATABASES_TO_TRY=("asistente_db" "postgres")

# Lista de contraseñas a probar
PASSWORDS_TO_TRY=("" "postgres" "asistente123" "password")

echo "🔍 Probando configuraciones automáticamente..."

# Intentar diferentes combinaciones
for user in "${USERS_TO_TRY[@]}"; do
    for db in "${DATABASES_TO_TRY[@]}"; do
        for pass in "${PASSWORDS_TO_TRY[@]}"; do
            if check_postgres_connection "$user" "$pass" "$db"; then
                echo "✅ ¡Conexión exitosa encontrada!"
                echo "   Usuario: $user"
                echo "   Base de datos: $db"
                echo "   Contraseña: ${pass:-'(sin contraseña)'}"
                
                # Crear la base de datos asistente_db si no existe
                if [ "$db" != "asistente_db" ]; then
                    create_database_if_not_exists "$user" "$pass" "asistente_db"
                fi
                
                # Crear archivo de configuración automática
                cat > application-auto-detected.properties << EOF
# Configuración automáticamente detectada
# Generado el: $(date)

# Configuración del servidor
server.port=8080

# Configuración de base de datos detectada
spring.datasource.url=jdbc:postgresql://localhost:5432/asistente_db
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=$user
spring.datasource.password=$pass

# Configuración de JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Configuración de logging
logging.level.com.ejemplo.chatgptwebhook=INFO
logging.level.org.springframework.web=INFO
EOF
                
                echo ""
                echo "📝 Archivo de configuración creado: application-auto-detected.properties"
                echo "🚀 Para usar esta configuración, ejecuta:"
                echo "   mvn spring-boot:run -Dspring-boot.run.profiles=auto-detected"
                echo ""
                echo "💡 O copia el contenido a application.properties:"
                echo "   cp application-auto-detected.properties application.properties"
                
                exit 0
            fi
        done
    done
done

echo "❌ No se pudo conectar automáticamente a PostgreSQL"
echo ""
echo "🔧 Soluciones posibles:"
echo "1. Instalar PostgreSQL:"
echo "   macOS: brew install postgresql@14"
echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
echo ""
echo "2. Iniciar PostgreSQL:"
echo "   macOS: brew services start postgresql@14"
echo "   Ubuntu: sudo systemctl start postgresql"
echo ""
echo "3. Crear base de datos manualmente:"
echo "   createdb asistente_db"
echo ""
echo "4. Configurar usuario y contraseña en application.properties"

exit 1
