# Frontend - Asistente Virtual

## Descripción

Código fuente del frontend de la aplicación Asistente Virtual de Proyectos.

## Archivos

- **`index.html`** - Página principal con formulario de login y chatbot
- **`app.js`** - Lógica de la aplicación (autenticación, chat, gestión de proyectos)
- **`styles.css`** - Estilos CSS de la aplicación
- **`*.jpg, *.png`** - Imágenes y recursos visuales

## Sincronización con Backend

Este es el código fuente. Para que los cambios se vean en la aplicación:

1. **Copia los archivos a `/backend/src/main/resources/static/`**
2. **Reinicia el backend Spring Boot**

### Script de Sincronización

```bash
# Desde la raíz del proyecto ASISTENTE/
./sync-frontend.sh
```

O manualmente:

```bash
cp frontend/*.html backend/src/main/resources/static/
cp frontend/*.js backend/src/main/resources/static/
cp frontend/*.css backend/src/main/resources/static/
cp frontend/*.jpg backend/src/main/resources/static/ 2>/dev/null || true
cp frontend/*.png backend/src/main/resources/static/ 2>/dev/null || true
```

## 🛠️ Tecnologías

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API para comunicación con backend

## Endpoints Utilizados

- `POST /api/auth/login` - Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /webhook/chat` - Envío de mensajes a ChatGPT
- `GET /api/menu/opciones` - Obtener opciones del menú
- `POST /api/menu/procesar` - Procesar opción del menú

## Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para autenticación:
- Token almacenado en `localStorage` como `jwt_token`
- Token incluido en headers de peticiones autenticadas
- Expiración: 24 horas
