# 🚀 Guía de Configuración - Proyecto Asistente

## 📋 Requisitos Previos

### Software necesario:
- **Java 17+** (JDK)
- **Maven 3.6+**
- **PostgreSQL 14+**
- **Git** (para clonar el repositorio)

### Instalación por sistema operativo:

#### 🍎 macOS:
```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependencias
brew install openjdk@17 maven postgresql@14
brew services start postgresql@14
```

#### 🐧 Ubuntu/Debian:
```bash
# Actualizar sistema
sudo apt update

# Instalar dependencias
sudo apt install openjdk-17-jdk maven postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 🪟 Windows:
1. **Java 17**: Descargar desde [Oracle](https://www.oracle.com/java/technologies/downloads/) o [OpenJDK](https://adoptium.net/)
2. **Maven**: Descargar desde [Apache Maven](https://maven.apache.org/download.cgi)
3. **PostgreSQL**: Descargar desde [PostgreSQL.org](https://www.postgresql.org/download/windows/)

## 🗄️ Configuración de Base de Datos

### 🎯 Configuración Automática (Recomendado)
El proyecto ahora detecta automáticamente la configuración de PostgreSQL disponible:

```bash
cd ASISTENTE/backend
./auto-setup.sh
```

Este script:
- ✅ Detecta automáticamente usuarios de PostgreSQL disponibles
- ✅ Prueba diferentes combinaciones de usuario/contraseña
- ✅ Crea la base de datos `asistente_db` si no existe
- ✅ Genera un archivo de configuración automáticamente

### Opción 2: Script de configuración básica
```bash
cd ASISTENTE/backend
chmod +x setup-database.sh
./setup-database.sh
```

### Opción 3: Configuración manual
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE asistente_db;

# Crear usuario
CREATE USER asistente_user WITH PASSWORD 'asistente123';
GRANT ALL PRIVILEGES ON DATABASE asistente_db TO asistente_user;

# Salir
\q
```

## ⚙️ Configuración del Proyecto

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd Proyecto_Asistente_PWeb-main
```

### 2. Configurar variables de entorno
Editar `ASISTENTE/backend/src/main/resources/application.properties`:

```properties
# Configuración de base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/asistente_db
spring.datasource.username=asistente_user
spring.datasource.password=asistente123

# IMPORTANTE: Configurar tu API key de OpenAI
openai.api.key=tu-api-key-de-openai-aqui
```

### 3. Obtener API Key de OpenAI
1. Ve a [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Crea una nueva API key
3. Copia la key y reemplaza `tu-api-key-de-openai-aqui` en `application.properties`

## 🚀 Ejecutar el Proyecto

### Opción 1: Inicio Automático (Recomendado)
```bash
cd ASISTENTE/backend
./start-intelligent.sh
```

Este script:
- ✅ Detecta automáticamente si PostgreSQL está corriendo
- ✅ Inicia PostgreSQL si es necesario
- ✅ Detecta la configuración de base de datos automáticamente
- ✅ Inicia el backend con la configuración correcta

### Opción 2: Inicio Manual
```bash
cd ASISTENTE/backend
mvn spring-boot:run
```

### Verificar que funciona
- Backend: http://localhost:8080
- API de salud: http://localhost:8080/api/health

### Acceder a la aplicación
Abrir en el navegador: http://localhost:8080

## 🔧 Perfiles de Configuración

### Desarrollo (dev):
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Producción (prod):
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## 🐛 Solución de Problemas

### Error: "PostgreSQL no está corriendo"
```bash
# macOS
brew services start postgresql@14

# Ubuntu
sudo systemctl start postgresql

# Verificar
pg_isready -h localhost -p 5432
```

### Error: "Base de datos no existe"
```bash
createdb asistente_db
```

### Error: "Puerto 8080 en uso"
```bash
# Encontrar proceso
lsof -i :8080

# Matar proceso
kill -9 <PID>
```

### Error: "API Key de OpenAI inválida"
- Verificar que la API key esté correcta en `application.properties`
- Verificar que tengas créditos en tu cuenta de OpenAI

## 📁 Estructura del Proyecto

```
ASISTENTE/
├── backend/                 # Backend Spring Boot
│   ├── src/main/java/      # Código Java
│   ├── src/main/resources/ # Configuración
│   └── setup-database.sh   # Script de configuración
├── frontend/               # Frontend (HTML/CSS/JS)
└── README-SETUP.md        # Esta guía
```

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todos los servicios estén corriendo
2. Revisa los logs del backend
3. Verifica la configuración de la base de datos
4. Asegúrate de que la API key de OpenAI sea válida

## 📝 Notas Importantes

- **Nunca subas API keys al repositorio** - usa variables de entorno en producción
- **La base de datos se crea automáticamente** con las tablas necesarias
- **El frontend se sirve desde el backend** - no necesitas servidor web separado
- **Los datos se persisten** en PostgreSQL entre reinicios
