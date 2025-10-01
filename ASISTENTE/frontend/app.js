

class ChatbotApp {
    constructor() {
        // Configuración de la aplicación
        this.config = {
            backendUrl: 'http://localhost:8080',
            maxMessageLength: 4000,
            maxHistorySize: 50,
            toastDuration: 5000,
            debugMode: this.isLocalhost()
        };

        // Referencias a elementos del DOM
        this.elements = {
            // Elementos del login
            loginSection: document.getElementById('loginSection'),
            loginForm: document.getElementById('form-login'),
            nombreInput: document.getElementById('nombre'),
            correoInput: document.getElementById('correo'),
            contraseñaInput: document.getElementById('contraseña'),
            mensajeExito: document.getElementById('mensaje-exito'),
            btnRegistrarse: document.getElementById('btn-registrarse'),
            
            // Elementos del modal de registro
            registerModal: document.getElementById('registerModal'),
            registerForm: document.getElementById('form-register'),
            closeRegisterModal: document.getElementById('closeRegisterModal'),
            cancelRegister: document.getElementById('cancelRegister'),
            registerNombreInput: document.getElementById('register-nombre'),
            registerCorreoInput: document.getElementById('register-correo'),
            registerCargoInput: document.getElementById('register-cargo'),
            registerContraseñaInput: document.getElementById('register-contraseña'),
            registerConfirmarContraseñaInput: document.getElementById('register-confirmar-contraseña'),
            registerTerminosInput: document.getElementById('register-terminos'),
            registerMensajeExito: document.getElementById('register-mensaje-exito'),
            registerMensajeError: document.getElementById('register-mensaje-error'),
            
            // Elementos del popup de usuario no registrado
            popupNoRegistrado: document.getElementById('popup-no-registrado'),
            btnCerrarPopup: document.getElementById('btn-cerrar-popup'),
            btnRegistrarsePopup: document.getElementById('btn-registrarse-popup'),
            btnCancelarPopup: document.getElementById('btn-cancelar-popup'),
            
            // Elementos del chatbot
            chatbotSection: document.getElementById('chatbotSection'),
            chatbot: document.getElementById('chatbot'),
            chatMessages: document.getElementById('chatMessages'),
            chatForm: document.getElementById('chatForm'),
            chatInput: document.getElementById('chatInput'),
            sendBtn: document.getElementById('sendBtn'),
            changeUserBtn: document.getElementById('changeUserBtn'),
            minimizeBtn: document.getElementById('minimizeBtn'),
            chatStatus: document.getElementById('chatStatus'),
            statusIndicator: document.getElementById('statusIndicator'),
            toast: document.getElementById('toast')
        };

        // Estado de la aplicación
        this.state = {
            // Estado del login
            isLoggedIn: false,
            loginData: {
                nombre: '',
                correo: '',
                contraseña: ''
            },
            
        // Estado del chatbot
        userName: '',
        userId: this.generateUserId(),
        isChatMinimized: false,
        isConnected: false,
        conversationHistory: [],
        // Estados de flujo de menú
        menuSessionId: null,
        menuSessionActive: true,
        waitingForProjectIdea: false,
        waitingForNewTask: false,
        waitingForTaskNumber: false
        };

        // Inicialización
        this.init();
        
        // Debug: verificar elementos
        console.log('🔍 Elementos encontrados:', {
            loginForm: this.elements.loginForm,
            nombreInput: this.elements.nombreInput,
            correoInput: this.elements.correoInput,
            contraseñaInput: this.elements.contraseñaInput
        });
    }

    init() {
        console.log('🚀 Iniciando aplicación integrada de login + chatbot...');
        
        this.setupEventListeners();
        this.checkLoginStatus();
        
        if (this.config.debugMode) {
            this.setupDebugMode();
        }
    }

    /**
     * Genera un ID único para el usuario
     */
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Verifica si está ejecutándose en localhost
     */
    isLocalhost() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Eventos del login
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
            console.log('✅ Event listener del login configurado');
        } else {
            console.error('❌ No se encontró el formulario de login');
        }
        
        // Validación de contraseña en tiempo real
        if (this.elements.contraseñaInput) {
            this.elements.contraseñaInput.addEventListener('input', this.validatePassword.bind(this));
            console.log('✅ Event listener de contraseña configurado');
        }
        
        // Event listeners del modal de registro
        if (this.elements.btnRegistrarse) {
            this.elements.btnRegistrarse.addEventListener('click', this.openRegisterModal.bind(this));
            console.log('✅ Event listener del botón registrarse configurado');
        }
        
        if (this.elements.closeRegisterModal) {
            this.elements.closeRegisterModal.addEventListener('click', this.closeRegisterModal.bind(this));
        }
        
        if (this.elements.cancelRegister) {
            this.elements.cancelRegister.addEventListener('click', this.closeRegisterModal.bind(this));
        }
        
        if (this.elements.registerForm) {
            console.log('✅ Formulario de registro encontrado, agregando event listener');
            this.elements.registerForm.addEventListener('submit', this.handleRegisterSubmit.bind(this));
        } else {
            console.error('❌ Formulario de registro NO encontrado');
        }
        
        if (this.elements.registerContraseñaInput) {
            this.elements.registerContraseñaInput.addEventListener('input', this.validateRegisterPassword.bind(this));
        }
        
        if (this.elements.registerConfirmarContraseñaInput) {
            this.elements.registerConfirmarContraseñaInput.addEventListener('input', this.validatePasswordMatch.bind(this));
        }
        
        // Cerrar modal al hacer clic en el overlay
        if (this.elements.registerModal) {
            this.elements.registerModal.addEventListener('click', (e) => {
                if (e.target === this.elements.registerModal) {
                    this.closeRegisterModal();
                }
            });
        }

        // Event listeners del popup de usuario no registrado
        if (this.elements.btnCerrarPopup) {
            this.elements.btnCerrarPopup.addEventListener('click', this.closeNoRegistradoPopup.bind(this));
        }
        
        if (this.elements.btnCancelarPopup) {
            this.elements.btnCancelarPopup.addEventListener('click', this.closeNoRegistradoPopup.bind(this));
        }
        
        if (this.elements.btnRegistrarsePopup) {
            this.elements.btnRegistrarsePopup.addEventListener('click', this.openRegisterFromPopup.bind(this));
        }
        
        // Cerrar popup al hacer clic en el overlay
        if (this.elements.popupNoRegistrado) {
            this.elements.popupNoRegistrado.addEventListener('click', (e) => {
                if (e.target === this.elements.popupNoRegistrado) {
                    this.closeNoRegistradoPopup();
                }
            });
        }

        // Eventos del chatbot
        if (this.elements.chatForm) {
            this.elements.chatForm.addEventListener('submit', this.handleChatSubmit.bind(this));
        }
        if (this.elements.changeUserBtn) {
            this.elements.changeUserBtn.addEventListener('click', this.changeUser.bind(this));
        }
        if (this.elements.minimizeBtn) {
            this.elements.minimizeBtn.addEventListener('click', this.toggleMinimize.bind(this));
        }

        // Delegación de eventos en el área de mensajes (para tarjetas del menú)
        if (this.elements.chatMessages) {
            this.elements.chatMessages.addEventListener('click', this.handleMenuCardClick.bind(this));
        }
    }

    /**
     * Valida la contraseña en tiempo real
     */
    validatePassword() {
        const barra = document.getElementById('fuerza-contraseña');
        const mensaje = document.getElementById('mensaje-contraseña');
        
        // Verificar que los elementos existan
        if (!barra || !mensaje || !this.elements.contraseñaInput) {
            console.warn('⚠️ Elementos de validación de contraseña no encontrados');
            return;
        }
        
        const valor = this.elements.contraseñaInput.value;
        let fuerza = 0;

        if (valor.length >= 8) fuerza++;
        if (/[A-Z]/.test(valor)) fuerza++;
        if (/[0-9]/.test(valor)) fuerza++;
        if (/[^A-Za-z0-9]/.test(valor)) fuerza++;

        if (valor.length === 0) {
            barra.style.background = '';
            mensaje.textContent = '';
        } else if (fuerza <= 1) {
            barra.style.background = 'red';
            mensaje.textContent = 'Contraseña no segura';
            mensaje.style.color = 'red';
        } else if (fuerza === 2) {
            barra.style.background = 'orange';
            mensaje.textContent = 'La contraseña puede mejorar';
            mensaje.style.color = 'orange';
        } else if (fuerza >= 3) {
            barra.style.background = 'green';
            mensaje.textContent = 'Contraseña segura';
            mensaje.style.color = 'green';
        }
    }

    /**
     * Verifica el estado del login
     */
    checkLoginStatus() {
        const savedLogin = localStorage.getItem('user_login');
        if (savedLogin) {
            try {
                this.state.loginData = JSON.parse(savedLogin);
                this.state.isLoggedIn = true;
                console.log('👤 Usuario ya logueado:', this.state.loginData.nombre);
                this.showChatbotSection();
            } catch (error) {
                console.error('❌ Error parseando datos de login:', error);
                this.showLoginSection();
            }
        } else {
            console.log('🔐 No hay sesión activa, mostrando login');
            this.showLoginSection();
        }
    }

    /**
     * Maneja el envío del formulario de login
     */
    handleLoginSubmit(event) {
        event.preventDefault();
        
        console.log('🔐 Procesando login...');
        console.log('Evento recibido:', event);
        
        // Verificar que los elementos existan
        if (!this.elements.nombreInput || !this.elements.correoInput || !this.elements.contraseñaInput || !this.elements.mensajeExito) {
            console.error('❌ Elementos del formulario de login no encontrados');
            return;
        }
        
        // Obtener datos del formulario
        const nombre = this.elements.nombreInput.value.trim();
        const correo = this.elements.correoInput.value.trim();
        const contraseña = this.elements.contraseñaInput.value.trim();
        
        // Validaciones básicas
        if (!nombre || !correo || !contraseña) {
            this.elements.mensajeExito.textContent = 'Por favor completa todos los campos';
            this.elements.mensajeExito.style.color = 'red';
            return;
        }
        
        if (contraseña.length < 8) {
            this.elements.mensajeExito.textContent = 'La contraseña debe tener al menos 8 caracteres';
            this.elements.mensajeExito.style.color = 'red';
            return;
        }
        
        // Enviar datos al backend para login
        this.loginUser({ correo, contraseña });
    }

    /**
     * Envía los datos de login al backend
     */
    async loginUser(loginData) {
        try {
            console.log('🔐 Enviando datos de login al backend...');
            
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            const result = await response.json();
            console.log('📡 Respuesta del backend:', result);
            
            if (result.success) {
                // Guardar datos de login
                this.state.loginData = { 
                    nombre: result.nombre, 
                    correo: result.correo, 
                    contraseña: loginData.contraseña 
                };
                this.state.isLoggedIn = true;
                this.state.userName = result.nombre;
                
                // Guardar en localStorage
                localStorage.setItem('user_login', JSON.stringify(this.state.loginData));
                
                // Mostrar mensaje de éxito
                this.elements.mensajeExito.textContent = '¡Login exitoso! Redirigiendo al chatbot...';
                this.elements.mensajeExito.style.color = 'green';
                
                console.log('✅ Login exitoso para:', result.nombre);
                
                // Transición al chatbot después de un breve delay
                setTimeout(() => {
                    console.log('🚀 Ejecutando transición al chatbot...');
                    this.showChatbotSection();
                }, 1500);
                
            } else {
                // Verificar si el error es porque el usuario no está registrado
                if (result.message && result.message.includes('no está registrado')) {
                    console.log('⚠️ Usuario no registrado, mostrando popup');
                    this.showNoRegistradoPopup();
                } else {
                    this.elements.mensajeExito.textContent = result.message || 'Credenciales incorrectas';
                    this.elements.mensajeExito.style.color = 'red';
                    console.error('❌ Error en login:', result.message);
                }
            }
            
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            this.elements.mensajeExito.textContent = 'Error de conexión. Verifica que el backend esté ejecutándose.';
            this.elements.mensajeExito.style.color = 'red';
        }
    }

    /**
     * Muestra la sección de login
     */
    showLoginSection() {
        if (!this.elements.loginSection || !this.elements.chatbotSection) {
            console.error('❌ Elementos de sección no encontrados');
            return;
        }
        
        this.elements.loginSection.style.display = 'block';
        this.elements.chatbotSection.style.display = 'none';
        this.state.isLoggedIn = false;
        
        // Limpiar formulario
        this.elements.nombreInput.value = '';
        this.elements.correoInput.value = '';
        this.elements.contraseñaInput.value = '';
        this.elements.mensajeExito.textContent = '';
        
        console.log('🔐 Mostrando sección de login');
    }

    /**
     * Muestra la sección del chatbot
     */
    showChatbotSection() {
        console.log('💬 Iniciando transición al chatbot...');
        
        // Verificar que los elementos existan
        if (!this.elements.loginSection || !this.elements.chatbotSection || !this.elements.chatbot) {
            console.error('❌ Elementos del chatbot no encontrados');
            return;
        }
        
        // Ocultar login
        this.elements.loginSection.style.display = 'none';
        
        // Mostrar sección del chatbot
        this.elements.chatbotSection.style.display = 'block';
        
        // Mostrar el chatbot
        this.elements.chatbot.style.display = 'flex';
        
        console.log('✅ Sección del chatbot mostrada');
        
        // Inicializar el chatbot
        this.showChatbot();
        
        // Verificar conexión en segundo plano (no bloquea)
        this.checkBackendConnection();
    }

    /**
     * Maneja el logout
     */
    handleLogout() {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar datos de login
        localStorage.removeItem('user_login');
        localStorage.removeItem('chatbot_user');
        localStorage.removeItem('chatbot_date');
        
        // Resetear estado
        this.state.isLoggedIn = false;
        this.state.loginData = { nombre: '', correo: '', contraseña: '' };
        this.state.userName = '';
        this.state.selectedDate = '';
        this.state.conversationHistory = [];
        
        // Restaurar color de fondo
        document.body.style.backgroundColor = '';
        
        // Mostrar login
        this.showLoginSection();
        
        console.log('✅ Sesión cerrada correctamente');
    }

    /**
     * Verifica la conexión con el backend
     */
    async checkBackendConnection() {
        try {
            this.showStatus('Verificando conexión con backend...', 'connecting');
            
            const response = await fetch(`${this.config.backendUrl}/webhook/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const healthInfo = await response.text();
                this.state.isConnected = true;
                this.showStatus('En línea', 'online');
                
                if (this.config.debugMode) {
                    this.debugLog('Backend conectado', { health: healthInfo });
                }
                
                this.showToast('Conectado al backend correctamente', 'success');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            this.state.isConnected = false;
            this.showStatus('Sin conexión', 'error');
            
            console.error('❌ Error conectando al backend:', error);
            this.showToast(
                'No se pudo conectar al backend. Verifica que esté ejecutándose en http://localhost:8080', 
                'error'
            );
            
            if (this.config.debugMode) {
                this.debugLog('Error de conexión', { error: error.message });
            }
        }
    }

    /**
     * Consulta las opciones del menú desde el backend usando do-while con sesiones
     */
    async loadMenuOptions() {
        try {
            console.log('📋 Cargando opciones del menú con do-while...');
            
            // Generar ID de sesión si no existe
            if (!this.state.menuSessionId) {
                this.state.menuSessionId = 'session_' + this.state.userId + '_' + Date.now();
                console.log('🆔 Nueva sesión de menú creada:', this.state.menuSessionId);
            }
            
            // Construir URL con sessionId para el bucle do-while
            const url = `${this.config.backendUrl}/api/menu/opciones?sessionId=${this.state.menuSessionId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const menuData = await response.json();
                
                // Actualizar estado de la sesión
                this.state.menuSessionActive = menuData.estado === 'activo';
                
                if (this.config.debugMode) {
                    this.debugLog('Menú cargado con do-while', {
                        sessionId: this.state.menuSessionId,
                        estado: menuData.estado,
                        sesionActiva: this.state.menuSessionActive,
                        menuData
                    });
                }
                
                console.log(`📊 Sesión ${this.state.menuSessionId}: ${menuData.estado}`);
                
                return menuData;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando menú:', error);
            this.showToast('Error al cargar el menú', 'error');
            
            if (this.config.debugMode) {
                this.debugLog('Error cargando menú', { error: error.message });
            }
            
            return null;
        }
    }

    /**
     * Verifica la configuración del sistema
     */
    async checkConfiguration() {
        try {
            console.log('🔍 Verificando configuración del sistema...');
            
            const response = await fetch(`${this.config.backendUrl}/api/config/status`);
            const configStatus = await response.json();
            
            this.state.isConfigured = configStatus.configured;
            
            console.log('✅ Sistema configurado correctamente');
            this.checkSavedUser();
            
        } catch (error) {
            console.error('❌ Error verificando configuración:', error);
            // Si no podemos verificar la configuración, intentamos con usuario
            this.checkSavedUser();
        }
    }

    /**
     * Verifica si hay un usuario guardado en localStorage
     */
    checkSavedUser() {
        const savedUser = localStorage.getItem('chatbot_user');
        const savedDate = localStorage.getItem('chatbot_date');

        if (savedUser && savedDate) {
            console.log(`👤 Usuario guardado encontrado: ${savedUser}`);
            this.state.userName = savedUser;
            this.state.selectedDate = savedDate;
            this.showChatbot();
        } else {
            // Si hay datos de login, usar el nombre del login como usuario del chatbot
            if (this.state.isLoggedIn && this.state.loginData.nombre) {
                console.log(`👤 Usando nombre del login: ${this.state.loginData.nombre}`);
                this.state.userName = this.state.loginData.nombre;
                this.state.selectedDate = new Date().toISOString().split('T')[0];
                this.showChatbot();
            } else {
                // Si no hay datos de login, mostrar login
                this.showLoginSection();
            }
        }
    }






    /**
     * Muestra el chatbot con saludo personalizado
     */
    showChatbot() {
        console.log('💬 Mostrando chatbot...');
        console.log('Estado del chatbot:', {
            userName: this.state.userName,
            chatMessages: this.elements.chatMessages,
            chatbot: this.elements.chatbot
        });
        
        // Limpiar mensajes anteriores
        if (this.elements.chatMessages) {
            this.elements.chatMessages.innerHTML = '';
            this.state.conversationHistory = [];
            
            // Mostrar saludo personalizado
            setTimeout(() => {
                this.addBotMessage(`¡Hola, ${this.state.userName}! Soy tu asistente de proyectos. ¿En qué puedo ayudarte hoy?\n\nMOSTRAR_MENU_PRINCIPAL`);
                // Mostrar menú después del saludo
                if (this.elements.chatInput) {
                    this.elements.chatInput.focus();
                }
            }, 500);
        } else {
            console.error('❌ No se encontró el elemento chatMessages');
        }
    }

    /**
     * Crea el mensaje de saludo personalizado
     */
    createGreetingMessage() {
        const date = new Date(this.state.selectedDate);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `¡Hola, ${this.state.userName}! Hoy es ${formattedDate}. Soy tu asistente para la gestión de proyectos. Por favor, selecciona una de las siguientes opciones:`;
    }

    /**
     * Carga las opciones del menú desde el backend
     */
    async loadMenuOptions() {
        try {
            if (!this.state.menuSessionId) {
                this.state.menuSessionId = 'session_' + this.state.userId + '_' + Date.now();
            }
            const url = `${this.config.backendUrl}/api/menu/opciones?sessionId=${this.state.menuSessionId}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.state.menuSessionActive = data.estado === 'activo';
            return data;
        } catch (err) {
            console.error('❌ Error cargando menú:', err);
            this.showToast('Error al cargar el menú', 'error');
            return null;
        }
    }

    /**
     * Muestra las opciones del menú como botones interactivos
     */
    async showMenuOptions() {
        const menuData = await this.loadMenuOptions();
        
        if (!menuData || !menuData.opciones) {
            this.addBotMessage('Lo siento, no pude cargar las opciones del menú. Por favor, intenta nuevamente.');
            return;
        }

        // Crear el mensaje con botones
        const menuMessage = this.createMenuMessage(menuData);
        this.addBotMessage(menuMessage, true); // true indica que es HTML
    }

    /**
     * Crea el mensaje del menú con botones interactivos y diseño moderno
     */
    createMenuMessage(menuData) {
        // Iconos modernos para cada opción (tamaño compacto)
        const iconos = {
            1: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
            2: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            3: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            4: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };

        let messageHTML = `<div class="menu-container">`;
        messageHTML += `<div class="menu-header">`;
        messageHTML += `<h4>${menuData.titulo}</h4>`;
        messageHTML += `<p class="menu-subtitle">¿Qué te gustaría hacer?</p>`;
        messageHTML += `</div>`;
        messageHTML += `<div class="menu-options">`;
        
        menuData.opciones.forEach(opcion => {
            const icono = iconos[opcion.id] || iconos[1]; // Usar icono por defecto si no existe
            messageHTML += `
                <div class="menu-option-card" 
                     data-option-id="${opcion.id}" 
                     data-option-action="${opcion.accion}">
                    <div class="menu-option-icon">
                        ${icono}
                    </div>
                    <div class="menu-option-content">
                        <h5 class="menu-option-title">${opcion.descripcion}</h5>
                        <p class="menu-option-description">${this.getMenuOptionDescription(opcion.id)}</p>
                    </div>
                    <div class="menu-option-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            `;
        });
        
        messageHTML += `</div></div>`;
        
        return messageHTML;
    }

    /**
     * Obtiene la descripción detallada de cada opción del menú
     */
    getMenuOptionDescription(optionId) {
        const descriptions = {
            1: "Inicia un nuevo proyecto con ayuda de IA",
            2: "Genera tareas automáticamente para tu proyecto",
            3: "Revisa el estado de tus proyectos existentes",
            4: "Finalizar sesión y salir del sistema"
        };
        return descriptions[optionId] || "Acción del menú";
    }

    /**
     * Maneja el clic en las tarjetas del menú
     */
    handleMenuCardClick(event) {
        const card = event.target.closest('.menu-option-card');
        if (!card) return;
        
        const optionId = parseInt(card.dataset.optionId, 10);
        const action = card.dataset.optionAction;
        const desc = card.querySelector('.menu-option-title')?.textContent || '';

        this.handleMenuOptionClick(optionId, action, desc);
    }

    /**
     * Maneja la selección de una opción del menú
     */
    handleMenuOptionClick(optionId, action, description) {
        this.addUserMessage(`${optionId}. ${description}`);

        if (optionId === 4) {
            // Reiniciar sesión / limpiar chat
            this.addBotMessage('👋 ¡Sesión reiniciada!');
            setTimeout(() => this.reiniciarSesionMenu(), 700);
            return;
        }

        if (optionId === 1) this.state.waitingForProjectIdea = true;
        if (optionId === 2) this.state.waitingForNewTask = true;

        this.processMenuAction(action, description, optionId);
    }

    /**
     * Procesa la acción del menú
     */
    async processMenuAction(action, description, optionId) {
        try {
            const url = `${this.config.backendUrl}/api/menu/procesar/${optionId}?sessionId=${this.state.menuSessionId}`;
            const res = await fetch(url, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' } 
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const resultado = await res.text();
            this.addBotMessage(resultado);

            // Heurísticas para estados de espera
            if (optionId === 2 && this.esRespuestaSolicitandoNuevaTarea(resultado)) {
                this.state.waitingForNewTask = true;
            }
            if (optionId === 3 && this.esRespuestaSolicitandoNumeroTarea(resultado)) {
                this.state.waitingForTaskNumber = true;
            }

            if (action === 'salir') {
                this.state.menuSessionActive = false;
                setTimeout(() => this.reiniciarSesionMenu(), 1500);
            }
        } catch (err) {
            console.error('❌ Error procesando opción:', err);
            this.addBotMessage('Ocurrió un error al procesar tu selección. Intenta de nuevo.');
            setTimeout(() => this.showMenuOptions(), 900);
        }
    }

    /**
     * Reinicia la sesión del menú
     */
    async reiniciarSesionMenu() {
        this.state.menuSessionId = 'session_' + this.state.userId + '_' + Date.now();
        this.state.menuSessionActive = true;
        this.state.waitingForProjectIdea = false;
        this.state.waitingForNewTask = false;
        this.state.waitingForTaskNumber = false;
        
        if (this.elements.chatMessages) {
            this.elements.chatMessages.innerHTML = '';
        }
        
        this.addBotMessage('🔄 Nueva sesión iniciada.');
        setTimeout(() => this.showMenuOptions(), 600);
    }

    /**
     * Maneja el clic en las cards del menú usando delegación de eventos
     */
    handleMenuCardClick(event) {
        // Buscar la card más cercana al elemento clickeado
        const menuCard = event.target.closest('.menu-option-card');
        
        if (menuCard) {
            const optionId = parseInt(menuCard.dataset.optionId);
            const action = menuCard.dataset.optionAction;
            const description = menuCard.querySelector('.menu-option-title').textContent;
            
            console.log(`🎯 Card del menú clickeada: ${optionId} - ${description}`);
            
            // Llamar a la función original de manejo de menú
            this.handleMenuOptionClick(optionId, action, description);
        }
    }

    /**
     * Maneja el clic en una opción del menú
     */
    handleMenuOptionClick(optionId, action, description) {
        console.log(`🎯 Opción seleccionada: ${optionId} - ${description}`);
        
        // Agregar mensaje del usuario mostrando su selección
        this.addUserMessage(`${optionId}. ${description}`);
        
        // Si es la opción 4 (Salir), cambiar usuario en lugar de procesar con backend
        if (optionId === 4) {
            console.log('🚪 Ejecutando cambio de usuario...');
            this.addBotMessage('👋 ¡Hasta luego! Te redirigiremos para cambiar de usuario.');
            
            // Agregar un pequeño delay para que el usuario vea el mensaje
            setTimeout(() => {
                this.changeUser();
            }, 2500);
        } else if (optionId === 1) {
            // Opción 1: Crear proyecto - establecer estado de espera de idea
            console.log('💡 Estableciendo estado de espera de idea de proyecto...');
            this.state.waitingForProjectIdea = true;
            
            // Procesar la acción seleccionada usando el backend (que pedirá la idea)
            this.processMenuAction(action, description, optionId);
        } else if (optionId === 2) {
            // Opción 2: Gestionar tareas - mostrar tareas existentes y permitir agregar nuevas
            console.log('📋 Procesando gestión de tareas...');
            this.processMenuAction(action, description, optionId);
        } else {
            // Procesar la acción seleccionada usando el backend para opción 3
            this.processMenuAction(action, description, optionId);
        }
    }

    /**
     * Procesa la acción seleccionada del menú usando el backend con control de sesión do-while
     */
    async processMenuAction(action, description, optionId) {
        try {
            console.log(`🔄 Procesando opción ${optionId} en el backend con sesión ${this.state.menuSessionId}...`);
            
            // Construir URL con sessionId para el control del bucle do-while
            const url = `${this.config.backendUrl}/api/menu/procesar/${optionId}?sessionId=${this.state.menuSessionId}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const resultado = await response.text();
                this.addBotMessage(resultado);
                
                if (this.config.debugMode) {
                    this.debugLog('Opción procesada exitosamente con sesión', { 
                        optionId, 
                        action, 
                        sessionId: this.state.menuSessionId, 
                        resultado 
                    });
                }
                
                // Si es salir, la sesión se ha finalizado en el backend
                if (action === 'salir') {
                    this.state.menuSessionActive = false;
                    console.log(`🔚 Sesión ${this.state.menuSessionId} finalizada - bucle do-while terminado`);
                    
                    // Verificar estado de la sesión
                    this.verificarEstadoSesion();
                    
                    // Crear nueva sesión y mostrar menú nuevamente después de un tiempo
                    setTimeout(() => {
                        this.reiniciarSesionMenu();
                    }, 3000);
                } else {
                    // Para otras opciones, continuar con la misma sesión
                    console.log(`🔄 Sesión ${this.state.menuSessionId} continúa - bucle do-while activo`);
                    
                    // Si es la opción 2 (gestionar tareas) y la respuesta contiene solicitud de nueva tarea
                    if (optionId === 2 && this.esRespuestaSolicitandoNuevaTarea(resultado)) {
                        console.log('📝 Estableciendo estado de espera de nueva tarea...');
                        this.state.waitingForNewTask = true;
                    }
                    
                    // Si es la opción 3 (consultar tareas) y la respuesta contiene solicitud de número de tarea
                    if (optionId === 3 && this.esRespuestaSolicitandoNumeroTarea(resultado)) {
                        console.log('🎯 Estableciendo estado de espera de número de tarea...');
                        this.state.waitingForTaskNumber = true;
                    }
                }
                
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error procesando opción del menú:', error);
            this.addBotMessage('Lo siento, ha ocurrido un error al procesar tu selección. Por favor, intenta nuevamente.');
            
            if (this.config.debugMode) {
                this.debugLog('Error procesando opción', { error: error.message, optionId, action });
            }
            
            // Volver a mostrar el menú en caso de error
            setTimeout(() => {
                this.showMenuOptions();
            }, 1000);
        }
    }

    /**
     * Maneja el envío del chat
     */
    async handleChatSubmit(event) {
        event.preventDefault();
        await this.sendMessage();
    }

    /**
     * Envía un mensaje al webhook
     */
    async sendMessage() {
        const message = this.elements.chatInput.value.trim();
        
        if (message === '') {
            this.showToast('Por favor escribe un mensaje', 'warning');
            return;
        }

        console.log(`💬 Enviando mensaje: "${message}"`);

        // Añadir mensaje del usuario
        this.addUserMessage(message);
        
        // Limpiar input
        this.elements.chatInput.value = '';
        
        // Mostrar indicador de estado
        this.showStatusIndicator('Procesando mensaje...');

        try {
            // Manejar diferentes estados del menú
            if (this.state.waitingForProjectIdea) {
                await this.sendProjectIdea(message);
                this.state.waitingForProjectIdea = false;
            } else if (this.state.waitingForNewTask) {
                await this.sendNewTask(message);
                this.state.waitingForNewTask = false;
            } else if (this.state.waitingForTaskNumber) {
                await this.sendTaskNumber(message);
                this.state.waitingForTaskNumber = false;
            } else {
                // Envío simple al webhook de chat
                await this.sendWebhookMessage(message);
            }
        } catch (error) {
            console.error(`❌ Error enviando mensaje:`, error);
            this.showToast(`Error al enviar mensaje: ${error.message}`, 'error');
            this.addBotMessage('Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor inténtalo de nuevo.');
        } finally {
            this.hideStatusIndicator();
            this.elements.chatInput.focus();
        }
    }

    /**
     * Verifica si la respuesta del backend está solicitando una nueva tarea
     */
    esRespuestaSolicitandoNuevaTarea(respuesta) {
        if (!respuesta) return false;
        
        // Buscar indicadores de que se está solicitando una nueva tarea
        const indicadores = [
            'AGREGAR NUEVA TAREA',
            'Escribe la descripción de la nueva tarea',
            'Para agregar una nueva tarea',
            'agrega la primera tarea',
            'CREAR PRIMERA TAREA'
        ];
        
        return indicadores.some(indicador => respuesta.includes(indicador));
    }

    /**
     * Verifica si la respuesta del backend está solicitando un número de tarea
     */
    esRespuestaSolicitandoNumeroTarea(respuesta) {
        if (!respuesta) return false;
        
        // Buscar indicadores de que se está solicitando el número de una tarea
        const indicadores = [
            'MARCAR TAREA COMO COMPLETADA',
            'Escribe el número de la tarea',
            'Para completar una tarea',
            'número de la tarea que has completado',
            'Escribe "3" para marcar'
        ];
        
        return indicadores.some(indicador => respuesta.includes(indicador));
    }

    /**
     * Envía la idea del proyecto al endpoint del menú
     */
    async sendProjectIdea(ideaProyecto) {
        console.log('💡 Enviando idea del proyecto al backend:', ideaProyecto);
        
        // Incluir sessionId en la URL para mantener la sesión
        const url = `${this.config.backendUrl}/api/menu/procesar/1/datos?sessionId=${this.state.menuSessionId}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: ideaProyecto
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const respuesta = await response.text();
        console.log('✅ Respuesta del menú recibida:', respuesta);

        // Mostrar la respuesta del bot
        this.addBotMessage(respuesta);
        
        // Agregar al historial
        this.state.conversationHistory.push(
            { role: 'user', content: ideaProyecto },
            { role: 'assistant', content: respuesta }
        );
    }

    /**
     * Envía la nueva tarea al endpoint del menú
     */
    async sendNewTask(nuevaTarea) {
        console.log('📝 Enviando nueva tarea al backend:', nuevaTarea);
        
        // Incluir sessionId en la URL para mantener la sesión
        const url = `${this.config.backendUrl}/api/menu/procesar/2/datos?sessionId=${this.state.menuSessionId}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: nuevaTarea
        });

        if (response.ok) {
            const resultado = await response.text();
            this.addBotMessage(resultado);
            
            // Agregar al historial
            this.state.conversationHistory.push(
                { role: 'user', content: nuevaTarea },
                { role: 'assistant', content: resultado }
            );
            
            console.log('✅ Nueva tarea enviada exitosamente');
            return resultado;
        } else {
            throw new Error(`Error al enviar nueva tarea: ${response.status}`);
        }
    }

    /**
     * Envía el número de tarea al endpoint del menú para marcarla como completada
     */
    async sendTaskNumber(numeroTarea) {
        console.log('🎯 Enviando número de tarea al backend:', numeroTarea);
        
        // Incluir sessionId en la URL para mantener la sesión
        const url = `${this.config.backendUrl}/api/menu/procesar/3/datos?sessionId=${this.state.menuSessionId}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: numeroTarea
        });

        if (response.ok) {
            const resultado = await response.text();
            this.addBotMessage(resultado);
            
            // Agregar al historial
            this.state.conversationHistory.push(
                { role: 'user', content: numeroTarea },
                { role: 'assistant', content: resultado }
            );
            
            console.log('✅ Número de tarea enviado exitosamente');
            return resultado;
        } else {
            throw new Error(`Error al enviar número de tarea: ${response.status}`);
        }
    }

    /**
     * Envía un mensaje usando el webhook
     */
    async sendWebhookMessage(message) {
        const requestBody = {
            mensaje: message,
            usuario: this.state.userId
        };

        const response = await fetch(`${this.config.backendUrl}/webhook/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 400) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Datos de entrada inválidos');
            } else if (response.status === 503) {
                throw new Error('Servicio no disponible temporalmente');
            } else {
                throw new Error(`Error del servidor (${response.status})`);
            }
        }

        const responseData = await response.json();
        
        if (this.config.debugMode) {
            this.debugLog('Respuesta webhook recibida', responseData);
        }

        // Verificar estado de la respuesta
        if (responseData.estado === 'error') {
            throw new Error(responseData.respuesta || 'Error procesando el mensaje');
        }

        // Añadir a historial
        this.state.conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: responseData.respuesta }
        );

        // Mostrar respuesta del webhook
        this.addBotMessage(responseData.respuesta, false, {
            usuario: responseData.usuario,
            estado: responseData.estado
        });
    }

    /**
     * Envía una idea de proyecto
     */
    async sendProjectIdea(idea) {
        const url = `${this.config.backendUrl}/api/menu/procesar/1/datos?sessionId=${this.state.menuSessionId}`;
        const res = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' }, 
            body: idea 
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const text = await res.text();
        this.addBotMessage(text);
        this.state.conversationHistory.push(
            { role: 'user', content: idea }, 
            { role: 'assistant', content: text }
        );
    }

    /**
     * Envía una nueva tarea
     */
    async sendNewTask(tarea) {
        const url = `${this.config.backendUrl}/api/menu/procesar/2/datos?sessionId=${this.state.menuSessionId}`;
        const res = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' }, 
            body: tarea 
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const text = await res.text();
        this.addBotMessage(text);
        this.state.conversationHistory.push(
            { role: 'user', content: tarea }, 
            { role: 'assistant', content: text }
        );
    }

    /**
     * Envía un número de tarea
     */
    async sendTaskNumber(num) {
        const url = `${this.config.backendUrl}/api/menu/procesar/3/datos?sessionId=${this.state.menuSessionId}`;
        const res = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain' }, 
            body: num 
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const text = await res.text();
        this.addBotMessage(text);
        this.state.conversationHistory.push(
            { role: 'user', content: num }, 
            { role: 'assistant', content: text }
        );
    }

    /**
     * Envía un mensaje streaming al backend
     */
    async sendStreamMessage(message) {
        const requestBody = {
            userId: this.state.userId,
            message: message,
            history: this.state.conversationHistory.slice(-this.config.maxHistorySize)
        };

        const response = await fetch(`${this.config.backendUrl}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Datos de entrada inválidos');
            } else if (response.status === 503) {
                throw new Error('Servicio no disponible temporalmente');
            } else {
                throw new Error(`Error del servidor (${response.status})`);
            }
        }

        // Preparar mensaje de streaming
        const botMessageElement = this.addBotMessage('', false, { streaming: true });
        this.state.currentStreamingMessage = {
            element: botMessageElement,
            content: ''
        };

        // Leer stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { value, done } = await reader.read();
                
                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                
                // Procesar eventos SSE
                const events = buffer.split('\n\n');
                buffer = events.pop() || ''; // Mantener evento incompleto

                for (const event of events) {
                    if (event.trim() === '') continue;
                    
                    const lines = event.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            
                            if (data === '[DONE]') {
                                this.finishStreamingMessage();
                                return;
                            } else if (data === '[ERROR]') {
                                throw new Error('Error en el streaming del servidor');
                            } else {
                                this.appendToStreamingMessage(data);
                            }
                        }
                    }
                }
            }
        } finally {
            if (this.state.currentStreamingMessage) {
                this.finishStreamingMessage();
            }
        }
    }

    /**
     * Añade contenido al mensaje en streaming
     */
    appendToStreamingMessage(content) {
        if (!this.state.currentStreamingMessage) return;

        this.state.currentStreamingMessage.content += content;
        
        const textElement = this.state.currentStreamingMessage.element
            .querySelector('.message-text');
        
        if (textElement) {
            textElement.textContent = this.state.currentStreamingMessage.content;
            this.scrollToBottom();
        }
    }

    /**
     * Finaliza el mensaje en streaming
     */
    finishStreamingMessage() {
        if (!this.state.currentStreamingMessage) return;

        const messageElement = this.state.currentStreamingMessage.element;
        const content = this.state.currentStreamingMessage.content;

        // Remover clase de streaming
        messageElement.classList.remove('streaming');

        // Añadir al historial
        this.state.conversationHistory.push(
            { role: 'user', content: this.getLastUserMessage() },
            { role: 'assistant', content: content }
        );

        if (this.config.debugMode) {
            this.debugLog('Streaming completado', { content, tokens: content.length });
        }

        this.state.currentStreamingMessage = null;
    }

    /**
     * Obtiene el último mensaje del usuario
     */
    getLastUserMessage() {
        const userMessages = this.elements.chatMessages.querySelectorAll('.message.user');
        if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            return lastUserMessage.querySelector('.message-text').textContent;
        }
        return '';
    }

    /**
     * Agrega un mensaje del bot al chat
     */
    addBotMessage(text, isHTML = false, metadata = {}) {
        // Detectar si el mensaje contiene la instrucción para mostrar el menú principal
        let displayText = text;
        let shouldShowMenu = false;
        
        if (text && text.includes('MOSTRAR_MENU_PRINCIPAL')) {
            // Remover la instrucción del texto que se muestra al usuario
            displayText = text.replace(/\n\nMOSTRAR_MENU_PRINCIPAL\s*$/gi, '').trim();
            shouldShowMenu = true;
            
            if (this.config.debugMode) {
                console.log('🎯 Detectado MOSTRAR_MENU_PRINCIPAL - Se mostrará el menú automáticamente');
            }
        }
        
        const messageElement = this.createMessageElement('bot', displayText, isHTML, metadata);
        this.elements.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Si se detectó la instrucción, mostrar el menú después de un breve delay
        if (shouldShowMenu) {
            setTimeout(() => {
                this.showMenuOptions();
            }, 1500); // Delay de 1.5 segundos para que el usuario pueda leer la respuesta
        }
        
        return messageElement;
    }

    /**
     * Agrega un mensaje del usuario al chat
     */
    addUserMessage(text) {
        const messageElement = this.createMessageElement('user', text);
        this.elements.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        return messageElement;
    }

    /**
     * Crea un elemento de mensaje
     */
    createMessageElement(type, text, isHTML = false, metadata = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        if (metadata.streaming) {
            messageDiv.classList.add('streaming');
        }
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = type === 'bot' ? '🤖' : '👤';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        // Usar innerHTML si es HTML, textContent si es texto plano
        if (isHTML) {
            textDiv.innerHTML = text;
        } else {
            // Para respuestas de ChatGPT, preservar saltos de línea y formato
            textDiv.textContent = text;
            // Asegurar que se muestren los saltos de línea correctamente
            textDiv.style.whiteSpace = 'pre-wrap';
            textDiv.style.wordWrap = 'break-word';
            textDiv.style.overflowWrap = 'anywhere';
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        bubbleDiv.appendChild(textDiv);
        bubbleDiv.appendChild(timeDiv);
        
        // Añadir metadatos si están disponibles
        if (metadata.model || metadata.tokens || metadata.requestId) {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'message-meta';
            
            const metaParts = [];
            if (metadata.model) metaParts.push(`Modelo: ${metadata.model}`);
            if (metadata.tokens) metaParts.push(`Tokens: ${metadata.tokens}`);
            if (metadata.requestId) metaParts.push(`ID: ${metadata.requestId.substring(0, 8)}...`);
            
            metaDiv.textContent = metaParts.join(' • ');
            bubbleDiv.appendChild(metaDiv);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        
        return messageDiv;
    }

    /**
     * Hace scroll al final del chat
     */
    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }, 100);
    }

    /**
     * Habilita o deshabilita los botones de envío
     */
    setButtonsEnabled(enabled) {
        this.elements.sendBtn.disabled = !enabled;
        this.elements.chatInput.disabled = !enabled;
    }

    /**
     * Muestra el indicador de estado
     */
    showStatusIndicator(text) {
        this.elements.statusIndicator.querySelector('.status-text').textContent = text;
        this.elements.statusIndicator.style.display = 'flex';
    }

    /**
     * Oculta el indicador de estado
     */
    hideStatusIndicator() {
        this.elements.statusIndicator.style.display = 'none';
    }

    /**
     * Muestra el estado en el header del chat
     */
    showStatus(text, type = 'online') {
        this.elements.chatStatus.textContent = text;
        this.elements.chatStatus.className = `chat-status ${type}`;
    }

    /**
     * Muestra un toast de notificación
     */
    showToast(message, type = 'info') {
        this.elements.toast.textContent = message;
        this.elements.toast.className = `toast ${type}`;
        this.elements.toast.classList.add('show');

        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, this.config.toastDuration);
    }

    /**
     * Cambia de usuario
     */
    changeUser() {
        console.log('🔄 Cambiando usuario...');
        
        // Limpiar datos de login
        localStorage.removeItem('user_login');
        
        // Resetear estado
        this.state.isLoggedIn = false;
        this.state.loginData = { nombre: '', correo: '', contraseña: '' };
        this.state.userName = '';
        this.state.conversationHistory = [];
        
        // Mostrar login
        this.showLoginSection();
    }

    /**
     * Alterna el estado minimizado del chatbot
     */
    toggleMinimize() {
        this.state.isChatMinimized = !this.state.isChatMinimized;
        
        if (this.state.isChatMinimized) {
            this.elements.chatbot.classList.add('minimized');
            this.elements.minimizeBtn.textContent = '➕';
            this.elements.minimizeBtn.title = 'Maximizar chat';
            console.log('📉 Chatbot minimizado');
        } else {
            this.elements.chatbot.classList.remove('minimized');
            this.elements.minimizeBtn.textContent = '➖';
            this.elements.minimizeBtn.title = 'Minimizar chat';
            this.elements.chatInput.focus();
            console.log('📈 Chatbot maximizado');
        }
    }


    

    /**
     * Registra información de debug
     */
    debugLog(message, data = {}) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        
        console.log('🐛 ' + logEntry, data);
        
        if (this.elements.debugContent) {
            const debugLine = document.createElement('div');
            debugLine.textContent = `${logEntry} ${JSON.stringify(data)}`;
            debugLine.style.marginBottom = '4px';
            debugLine.style.fontSize = '10px';
            this.elements.debugContent.appendChild(debugLine);
            
            // Mantener solo las últimas 10 líneas
            while (this.elements.debugContent.children.length > 10) {
                this.elements.debugContent.removeChild(this.elements.debugContent.firstChild);
            }
        }
    }

    /**
     * Verifica el estado de la sesión actual del menú
     */
    async verificarEstadoSesion() {
        if (!this.state.menuSessionId) return;
        
        try {
            console.log(`🔍 Verificando estado de sesión: ${this.state.menuSessionId}`);
            
            const response = await fetch(`${this.config.backendUrl}/api/menu/sesion/${this.state.menuSessionId}/estado`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const estado = await response.text();
                console.log(`📊 Estado de sesión: ${estado}`);
                
                if (this.config.debugMode) {
                    this.debugLog('Estado de sesión verificado', { sessionId: this.state.menuSessionId, estado });
                }
                
                return estado;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error verificando estado de sesión:', error);
            
            if (this.config.debugMode) {
                this.debugLog('Error verificando sesión', { error: error.message });
            }
        }
    }

    /**
     * Reinicia la sesión del menú (crea nueva sesión y muestra el menú)
     */
    async reiniciarSesionMenu() {
        try {
            console.log('🔄 Reiniciando sesión del menú...');
            
            // Crear nueva sesión
            this.state.menuSessionId = 'session_' + this.state.userId + '_' + Date.now();
            this.state.menuSessionActive = true;
            
            console.log(`🆔 Nueva sesión creada: ${this.state.menuSessionId}`);
            
            if (this.config.debugMode) {
                this.debugLog('Sesión del menú reiniciada', { 
                    nuevaSessionId: this.state.menuSessionId,
                    estado: 'activo'
                });
            }
            
            // Mostrar mensaje de nueva sesión
            this.addBotMessage('🔄 Iniciando nueva sesión del menú...');
            
            // Mostrar el menú con la nueva sesión
            setTimeout(() => {
                this.showMenuOptions();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error reiniciando sesión del menú:', error);
            
            if (this.config.debugMode) {
                this.debugLog('Error reiniciando sesión', { error: error.message });
            }
        }
    }

    // ============================================
    // MÉTODOS DE VALIDACIÓN Y ACCESIBILIDAD
    // (Reutilizados del código anterior)
    // ===========================================
    
    /**
     * Abre el modal de registro
     */
    openRegisterModal() {
        console.log('📝 Abriendo modal de registro...');
        if (this.elements.registerModal) {
            this.elements.registerModal.classList.add('active');
            // Limpiar mensajes anteriores
            this.clearRegisterMessages();
            // Enfocar el primer campo
            if (this.elements.registerNombreInput) {
                this.elements.registerNombreInput.focus();
            }
        }
    }

    /**
     * Cierra el modal de registro
     */
    closeRegisterModal() {
        console.log('❌ Cerrando modal de registro...');
        if (this.elements.registerModal) {
            this.elements.registerModal.classList.remove('active');
            // Limpiar el formulario
            this.clearRegisterForm();
        }
    }

    /**
     * Limpia el formulario de registro
     */
    clearRegisterForm() {
        if (this.elements.registerForm) {
            this.elements.registerForm.reset();
        }
        this.clearRegisterMessages();
    }

    /**
     * Limpia los mensajes del modal de registro
     */
    clearRegisterMessages() {
        if (this.elements.registerMensajeExito) {
            this.elements.registerMensajeExito.textContent = '';
        }
        if (this.elements.registerMensajeError) {
            this.elements.registerMensajeError.textContent = '';
        }
    }

    /**
     * Valida la contraseña del registro en tiempo real
     */
    validateRegisterPassword() {
        const contraseña = this.elements.registerContraseñaInput.value;
        const fuerzaDiv = document.getElementById('register-fuerza-contraseña');
        const mensajeSpan = document.getElementById('register-mensaje-contraseña');
        
        if (!contraseña) {
            fuerzaDiv.style.width = '0%';
            fuerzaDiv.style.backgroundColor = 'transparent';
            mensajeSpan.textContent = '';
            return;
        }
        
        let fuerza = 0;
        let mensaje = '';
        
        // Longitud mínima
        if (contraseña.length >= 8) fuerza += 20;
        else mensaje = 'Mínimo 8 caracteres';
        
        // Contiene mayúsculas
        if (/[A-Z]/.test(contraseña)) fuerza += 20;
        
        // Contiene minúsculas
        if (/[a-z]/.test(contraseña)) fuerza += 20;
        
        // Contiene números
        if (/[0-9]/.test(contraseña)) fuerza += 20;
        
        // Contiene caracteres especiales
        if (/[^A-Za-z0-9]/.test(contraseña)) fuerza += 20;
        
        // Aplicar colores según la fuerza
        if (fuerza < 40) {
            fuerzaDiv.style.backgroundColor = '#ff4444';
            mensaje = mensaje || 'Contraseña débil';
        } else if (fuerza < 80) {
            fuerzaDiv.style.backgroundColor = '#ffaa00';
            mensaje = mensaje || 'Contraseña media';
        } else {
            fuerzaDiv.style.backgroundColor = '#44ff44';
            mensaje = mensaje || 'Contraseña fuerte';
        }
        
        fuerzaDiv.style.width = fuerza + '%';
        mensajeSpan.textContent = mensaje;
    }

    /**
     * Valida que las contraseñas coincidan
     */
    validatePasswordMatch() {
        const contraseña = this.elements.registerContraseñaInput.value;
        const confirmarContraseña = this.elements.registerConfirmarContraseñaInput.value;
        
        if (confirmarContraseña && contraseña !== confirmarContraseña) {
            this.elements.registerConfirmarContraseñaInput.style.borderColor = '#ff4444';
            return false;
        } else {
            this.elements.registerConfirmarContraseñaInput.style.borderColor = '#e2e8f0';
            return true;
        }
    }

    /**
     * Maneja el envío del formulario de registro
     */
    handleRegisterSubmit(event) {
        event.preventDefault();
        console.log('📝 Procesando registro...');
        console.log('📝 Evento recibido:', event);
        
        // Limpiar mensajes anteriores
        this.clearRegisterMessages();
        
        // Validar formulario
        if (!this.validateRegisterForm()) {
            return;
        }
        
        // Obtener datos del formulario
        const formData = new FormData(this.elements.registerForm);
        const userData = {
            nombre: formData.get('nombre'),
            correo: formData.get('correo'),
            cargo: formData.get('cargo'),
            contraseña: formData.get('contraseña')
        };
        
        console.log('📝 Datos de registro:', userData);
        
        // Enviar datos al backend
        this.registerUser(userData);
    }

    /**
     * Envía los datos de registro al backend
     */
    async registerUser(userData) {
        try {
            console.log('🚀 Enviando datos al backend...');
            
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            console.log('📡 Respuesta del backend:', result);
            
            if (result.success) {
                this.showRegisterSuccess();
                console.log('✅ Usuario registrado exitosamente');
            } else {
                this.showRegisterError(result.message || 'Error al registrar usuario');
                console.error('❌ Error en registro:', result.message);
            }
            
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            this.showRegisterError('Error de conexión. Verifica que el backend esté ejecutándose.');
        }
    }

    /**
     * Valida el formulario de registro
     */
    validateRegisterForm() {
        let isValid = true;
        
        // Validar campos requeridos
        const requiredFields = [
            { input: this.elements.registerNombreInput, name: 'Nombre' },
            { input: this.elements.registerCorreoInput, name: 'Correo' },
            { input: this.elements.registerCargoInput, name: 'Cargo' },
            { input: this.elements.registerContraseñaInput, name: 'Contraseña' },
            { input: this.elements.registerConfirmarContraseñaInput, name: 'Confirmar Contraseña' }
        ];
        
        requiredFields.forEach(field => {
            if (!field.input.value.trim()) {
                this.showRegisterError(`El campo ${field.name} es requerido`);
                field.input.style.borderColor = '#ff4444';
                isValid = false;
            } else {
                field.input.style.borderColor = '#e2e8f0';
            }
        });
        
        // Validar contraseñas
        if (isValid && !this.validatePasswordMatch()) {
            this.showRegisterError('Las contraseñas no coinciden');
            isValid = false;
        }
        
        // Validar términos y condiciones
        if (isValid && !this.elements.registerTerminosInput.checked) {
            this.showRegisterError('Debe aceptar los términos y condiciones');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Muestra mensaje de éxito en el registro
     */
    showRegisterSuccess() {
        if (this.elements.registerMensajeExito) {
            this.elements.registerMensajeExito.textContent = '✅ ¡Registro exitoso! Su cuenta ha sido creada correctamente.';
            this.elements.registerMensajeExito.style.color = 'green';
            this.elements.registerMensajeExito.style.fontWeight = 'bold';
        }
        
        // Limpiar el formulario
        this.clearRegisterForm();
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
            this.closeRegisterModal();
            // Mostrar mensaje en el login
            if (this.elements.mensajeExito) {
                this.elements.mensajeExito.textContent = '✅ ¡Registro completado! Ahora puede iniciar sesión con sus credenciales.';
                setTimeout(() => {
                    this.elements.mensajeExito.textContent = '';
                }, 5000);
            }
        }, 2000);
    }

    /**
     * Muestra mensaje de error en el registro
     */
    showRegisterError(message) {
        if (this.elements.registerMensajeError) {
            this.elements.registerMensajeError.textContent = message;
        }
    }

    /**
     * Muestra el popup de usuario no registrado
     */
    showNoRegistradoPopup() {
        console.log('🔔 Mostrando popup de usuario no registrado');
        if (this.elements.popupNoRegistrado) {
            this.elements.popupNoRegistrado.style.display = 'flex';
            // Agregar animación de entrada
            setTimeout(() => {
                this.elements.popupNoRegistrado.style.opacity = '1';
            }, 10);
        }
    }

    /**
     * Cierra el popup de usuario no registrado
     */
    closeNoRegistradoPopup() {
        console.log('❌ Cerrando popup de usuario no registrado');
        if (this.elements.popupNoRegistrado) {
            this.elements.popupNoRegistrado.style.opacity = '0';
            setTimeout(() => {
                this.elements.popupNoRegistrado.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Abre el modal de registro desde el popup
     */
    openRegisterFromPopup() {
        console.log('📝 Abriendo modal de registro desde popup');
        this.closeNoRegistradoPopup();
        setTimeout(() => {
            this.openRegisterModal();
        }, 300);
    }
}

// Esta inicialización se movió al final del archivo para usar la variable global

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Error en la aplicación:', event.error);
});

// Información de debug en modo desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`
🔧 MODO DEBUG ACTIVADO
====================
Backend URL: http://localhost:8080
Endpoints disponibles:
- POST /api/chat (normal)
- POST /api/chat/stream (streaming)
- GET /api/chat/health (health check)

Para probar:
1. Asegúrate de que el backend esté ejecutándose
2. Configura OPENAI_API_KEY en el backend
3. Abre las DevTools para ver logs detallados

Comandos útiles:
- localStorage.clear() // Limpia datos guardados
- location.reload() // Recarga la página
    `);
    }

let chatbotApp;

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM cargado - Inicializando aplicación con backend...');
    chatbotApp = new ChatbotApp();
});
