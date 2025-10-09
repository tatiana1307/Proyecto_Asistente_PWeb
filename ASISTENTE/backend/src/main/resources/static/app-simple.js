console.log('🔧 App simple cargada');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM cargado - Inicializando aplicación simple...');
    
    // Verificar si ya hay un usuario logueado
    const savedLogin = localStorage.getItem('user_login');
    if (savedLogin) {
        try {
            const loginData = JSON.parse(savedLogin);
            console.log('👤 Usuario ya logueado:', loginData.nombre);
            showChatbotSection();
            return;
        } catch (error) {
            console.error('❌ Error parseando datos de login:', error);
            localStorage.removeItem('user_login');
        }
    }
    
    // Elementos del login
    const loginForm = document.getElementById('form-login');
    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    const contraseñaInput = document.getElementById('contraseña');
    const mensajeExito = document.getElementById('mensaje-exito');
    
    console.log('🔍 Elementos encontrados:', {
        loginForm: loginForm,
        nombreInput: nombreInput,
        correoInput: correoInput,
        contraseñaInput: contraseñaInput,
        mensajeExito: mensajeExito
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('🔐 Formulario de login enviado');
            
            const nombre = nombreInput.value.trim();
            const correo = correoInput.value.trim();
            const contraseña = contraseñaInput.value.trim();
            
            console.log('📝 Datos del formulario:', { nombre, correo, contraseña });
            
            if (!nombre || !correo || !contraseña) {
                mensajeExito.textContent = 'Por favor completa todos los campos';
                mensajeExito.style.color = 'red';
                return;
            }
            
            // Enviar datos al backend
            mensajeExito.textContent = 'Enviando datos al backend...';
            mensajeExito.style.color = 'blue';
            
            fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contraseña })
            })
            .then(response => response.json())
            .then(result => {
                console.log('📡 Respuesta del backend:', result);
                
                if (result.success) {
                    mensajeExito.textContent = '¡Login exitoso! Redirigiendo al chatbot...';
                    mensajeExito.style.color = 'green';
                    
                    // Guardar datos de login
                    localStorage.setItem('user_login', JSON.stringify({
                        nombre: result.nombre,
                        correo: result.correo,
                        contraseña: contraseña
                    }));
                    
                    // Redirigir al chatbot después de un breve delay
                    setTimeout(() => {
                        console.log('🚀 Redirigiendo al chatbot...');
                        showChatbotSection();
                    }, 1500);
                } else {
                    if (result.message && result.message.includes('no está registrado')) {
                        mensajeExito.textContent = 'Usuario no registrado. Debes registrarte primero.';
                        mensajeExito.style.color = 'red';
                    } else {
                        mensajeExito.textContent = result.message || 'Credenciales incorrectas';
                        mensajeExito.style.color = 'red';
                    }
                }
            })
            .catch(error => {
                console.error('❌ Error:', error);
                mensajeExito.textContent = 'Error de conexión. Verifica que el backend esté ejecutándose.';
                mensajeExito.style.color = 'red';
            });
        });
        
        console.log('✅ Event listener del login configurado');
    } else {
        console.error('❌ Formulario de login no encontrado');
    }
});

// Función para mostrar la sección del chatbot
function showChatbotSection() {
    console.log('💬 Mostrando sección del chatbot...');
    
    // Ocultar sección de login
    const loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.style.display = 'none';
    }
    
    // Mostrar sección del chatbot
    const chatbotSection = document.getElementById('chatbotSection');
    if (chatbotSection) {
        chatbotSection.style.display = 'block';
    }
    
    // Mostrar el chatbot
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.style.display = 'flex';
    }
    
    console.log('✅ Sección del chatbot mostrada');
}
