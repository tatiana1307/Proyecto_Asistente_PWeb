/**
 * FRONTEND PARA CHATBOT CON BACKEND SPRING BOOT
 * =============================================
 * 
 * Funcionalidades implementadas:
 * - Modal inicial con validaciones en tiempo real
 * - Integración con backend Spring Boot
 * - Chat normal (POST /api/chat)
 * - Chat streaming (POST /api/chat/stream) con SSE
 * - Manejo de errores con toasts
 * - Historial de conversación
 * - Accesibilidad completa
 * - Indicadores de estado
 * - Modo debug configurable
 */

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
            overlay: document.getElementById('overlay'),
            modal: document.getElementById('modal'),
            modalForm: document.getElementById('modalForm'),
            nameInput: document.getElementById('nameInput'),
            dateInput: document.getElementById('dateInput'),
            nameError: document.getElementById('nameError'),
            dateError: document.getElementById('dateError'),
            acceptBtn: document.getElementById('acceptBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            configModal: document.getElementById('configModal'),
            configForm: document.getElementById('configForm'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            apiKeyError: document.getElementById('apiKeyError'),
            configStatus: document.getElementById('configStatus'),
            configSaveBtn: document.getElementById('configSaveBtn'),
            configSkipBtn: document.getElementById('configSkipBtn'),
            cancelMessage: document.getElementById('cancelMessage'),
            reopenModalBtn: document.getElementById('reopenModalBtn'),
            chatbot: document.getElementById('chatbot'),
            chatMessages: document.getElementById('chatMessages'),
            chatForm: document.getElementById('chatForm'),
            chatInput: document.getElementById('chatInput'),
            sendBtn: document.getElementById('sendBtn'),
            configBtn: document.getElementById('configBtn'),
            changeUserBtn: document.getElementById('changeUserBtn'),
            minimizeBtn: document.getElementById('minimizeBtn'),
            chatStatus: document.getElementById('chatStatus'),
            statusIndicator: document.getElementById('statusIndicator'),
            toast: document.getElementById('toast'),
            debugInfo: document.getElementById('debugInfo'),
            debugContent: document.getElementById('debugContent')
        };

        // Estado de la aplicación
        this.state = {
            userName: '',
            selectedDate: '',
            userId: this.generateUserId(),
            isModalOpen: false,
            isConfigModalOpen: false,
            isChatMinimized: false,
            isConnected: false,
            isConfigured: false,
            currentStreamingMessage: null,
            conversationHistory: [],
            focusableElements: [],
            currentFocusIndex: 0,
            menuSessionId: null,
            menuSessionActive: true,
            waitingForProjectIdea: false, 
            waitingForNewTask: false, 
            waitingForTaskNumber: false 
        };

        // Inicialización
        this.init();
    }

    init() {
        console.log('🚀 Iniciando aplicación de chatbot con backend...');
        
        this.setCurrentDate();
        this.setupEventListeners();
        this.checkBackendConnection();
        this.checkConfiguration();
        
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
     * Establece la fecha actual en el input de fecha
     */
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateInput.value = today;
        this.state.selectedDate = today;
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Eventos del modal
        this.elements.modalForm.addEventListener('submit', this.handleModalSubmit.bind(this));
        this.elements.cancelBtn.addEventListener('click', this.handleModalCancel.bind(this));
        this.elements.reopenModalBtn.addEventListener('click', this.openModal.bind(this));
        
        // Eventos del modal de configuración
        this.elements.configForm.addEventListener('submit', this.handleConfigSubmit.bind(this));
        this.elements.configSkipBtn.addEventListener('click', this.handleConfigSkip.bind(this));
        this.elements.apiKeyInput.addEventListener('input', this.validateApiKeyInput.bind(this));
        
        // Validaciones en tiempo real
        this.elements.nameInput.addEventListener('input', this.validateForm.bind(this));
        this.elements.nameInput.addEventListener('blur', this.validateName.bind(this));
        this.elements.dateInput.addEventListener('input', this.validateForm.bind(this));
        this.elements.dateInput.addEventListener('blur', this.validateDate.bind(this));

        // Eventos del chatbot
        this.elements.chatForm.addEventListener('submit', this.handleChatSubmit.bind(this));
        this.elements.configBtn.addEventListener('click', this.openConfigModal.bind(this));
        this.elements.changeUserBtn.addEventListener('click', this.changeUser.bind(this));
        this.elements.minimizeBtn.addEventListener('click', this.toggleMinimize.bind(this));
        
        // Event listener para las opciones del menú (delegación de eventos)
        this.elements.chatMessages.addEventListener('click', this.handleMenuCardClick.bind(this));

        // Eventos de teclado globales
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Eventos de clic en overlay
        this.elements.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
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
            
            if (!this.state.isConfigured) {
                console.log('⚠️ Sistema no configurado - API Key necesaria');
                this.openConfigModal();
            } else {
                console.log('✅ Sistema configurado correctamente');
                this.checkSavedUser();
            }
            
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
            this.openModal();
        }
    }

    /**
     * Abre el modal inicial
     */
    openModal() {
        console.log('📝 Abriendo modal inicial...');
        
        this.state.isModalOpen = true;
        this.elements.overlay.classList.add('active');
        this.elements.modal.classList.add('active');
        this.elements.modal.setAttribute('aria-hidden', 'false');
        this.elements.overlay.setAttribute('aria-hidden', 'false');
        
        // Ocultar otros elementos
        this.elements.cancelMessage.style.display = 'none';
        this.elements.chatbot.style.display = 'none';
        
        // Configurar focus trap y enfocar el nombre
        setTimeout(() => {
            this.setupFocusTrap();
            this.elements.nameInput.focus();
        }, 100);
        
        // Validar formulario inicial
        this.validateForm();
    }

    /**
     * Cierra el modal
     */
    closeModal() {
        console.log('❌ Cerrando modal...');
        
        this.state.isModalOpen = false;
        this.elements.overlay.classList.remove('active');
        this.elements.modal.classList.remove('active');
        this.elements.modal.setAttribute('aria-hidden', 'true');
        this.elements.overlay.setAttribute('aria-hidden', 'true');
    }

    /**
     * Maneja el envío del formulario del modal
     */
    handleModalSubmit(event) {
        event.preventDefault();
        
        console.log('✅ Enviando formulario del modal...');
        
        if (!this.validateForm()) {
            console.log('❌ Formulario inválido');
            return;
        }

        // Obtener y limpiar datos
        this.state.userName = this.elements.nameInput.value.trim();
        this.state.selectedDate = this.elements.dateInput.value;

        // Guardar en localStorage
        localStorage.setItem('chatbot_user', this.state.userName);
        localStorage.setItem('chatbot_date', this.state.selectedDate);

        console.log(`✅ Datos guardados - Usuario: ${this.state.userName}, Fecha: ${this.state.selectedDate}`);

        // Cerrar modal y mostrar chatbot
        this.closeModal();
        this.showChatbot();
    }

    /**
     * Maneja la cancelación del modal
     */
    handleModalCancel() {
        console.log('❌ Modal cancelado por el usuario');
        
        this.closeModal();
        this.showCancelMessage();
    }

    /**
     * Muestra el mensaje de cancelación
     */
    showCancelMessage() {
        this.elements.cancelMessage.style.display = 'block';
        this.elements.cancelMessage.classList.add('fade-in');
        this.elements.reopenModalBtn.focus();
    }

    /**
     * Muestra el chatbot con saludo personalizado
     */
    showChatbot() {
        console.log('💬 Mostrando chatbot...');
        
        // Cambiar el color de fondo de toda la pantalla después del login
        document.body.style.backgroundColor = '#54555c';
        
        this.elements.chatbot.style.display = 'flex';
        this.elements.chatbot.classList.add('fade-in');
        
        // Limpiar mensajes anteriores
        this.elements.chatMessages.innerHTML = '';
        this.state.conversationHistory = [];
        
        // Mostrar saludo personalizado y luego el menú
        setTimeout(() => {
            this.addBotMessage(this.createGreetingMessage());
            
            // Mostrar el menú después del saludo
            setTimeout(() => {
                this.showMenuOptions();
            }, 1000);
            
            this.elements.chatInput.focus();
        }, 500);
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

        if (message.length > this.config.maxMessageLength) {
            this.showToast(`El mensaje es demasiado largo (máximo ${this.config.maxMessageLength} caracteres)`, 'error');
            return;
        }

        if (!this.state.isConnected) {
            this.showToast('No hay conexión con el backend', 'error');
            return;
        }

        console.log(`💬 Enviando mensaje: "${message}"`);

        // Añadir mensaje del usuario
        this.addUserMessage(message);
        
        // Limpiar input y deshabilitar botones
        this.elements.chatInput.value = '';
        this.setButtonsEnabled(false);
        
        // Mostrar indicador de estado
        this.showStatusIndicator('Procesando mensaje...');

        try {
            // Verificar si estamos esperando una idea de proyecto
            if (this.state.waitingForProjectIdea) {
                console.log('💡 Enviando idea de proyecto al endpoint del menú...');
                await this.sendProjectIdea(message);
                // Resetear el estado
                this.state.waitingForProjectIdea = false;
            } else if (this.state.waitingForNewTask) {
                console.log('📝 Enviando nueva tarea al endpoint del menú...');
                await this.sendNewTask(message);
                // Resetear el estado
                this.state.waitingForNewTask = false;
            } else if (this.state.waitingForTaskNumber) {
                console.log('🎯 Enviando número de tarea al endpoint del menú...');
                await this.sendTaskNumber(message);
                // Resetear el estado
                this.state.waitingForTaskNumber = false;
            } else {
                // Envío normal al webhook de chat
                await this.sendWebhookMessage(message);
            }
        } catch (error) {
            console.error(`❌ Error enviando mensaje:`, error);
            
            // Verificar si es un error de configuración
            if (error.message && error.message.includes('API Key')) {
                this.showToast('API Key no configurada. Configúrala desde el botón ⚙️', 'warning');
                this.addBotMessage('⚠️ Para usar el chatbot necesitas configurar una API Key de OpenAI. Haz clic en el botón ⚙️ en la parte superior.');
            } else {
                this.showToast(`Error al enviar mensaje: ${error.message}`, 'error');
                this.addBotMessage('Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor inténtalo de nuevo.');
            }
        } finally {
            this.setButtonsEnabled(true);
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
        
        localStorage.removeItem('chatbot_user');
        localStorage.removeItem('chatbot_date');
        
        // Restaurar el color de fondo original
        document.body.style.backgroundColor = '';
        
        this.elements.chatbot.style.display = 'none';
        this.elements.nameInput.value = '';
        this.elements.dateInput.value = '';
        this.setCurrentDate();
        
        this.state.conversationHistory = [];
        
        this.openModal();
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

    // ============================================
    // MÉTODOS DE CONFIGURACIÓN DE API KEY
    // ============================================

    /**
     * Abre el modal de configuración
     */
    openConfigModal() {
        console.log('🔑 Abriendo modal de configuración');
        
        this.state.isConfigModalOpen = true;
        this.elements.overlay.classList.add('active');
        this.elements.configModal.classList.add('active');
        this.elements.configModal.setAttribute('aria-hidden', 'false');
        this.elements.overlay.setAttribute('aria-hidden', 'false');
        
        // Ocultar otros elementos
        this.elements.modal.style.display = 'none';
        this.elements.cancelMessage.style.display = 'none';
        this.elements.chatbot.style.display = 'none';
        
        // Limpiar formulario
        this.elements.apiKeyInput.value = '';
        this.elements.apiKeyError.textContent = '';
        this.elements.configStatus.style.display = 'none';
        this.elements.configSaveBtn.disabled = true;
        
        // Configurar focus
        setTimeout(() => {
            this.elements.apiKeyInput.focus();
        }, 100);
    }

    /**
     * Cierra el modal de configuración
     */
    closeConfigModal() {
        console.log('❌ Cerrando modal de configuración');
        
        this.state.isConfigModalOpen = false;
        this.elements.overlay.classList.remove('active');
        this.elements.configModal.classList.remove('active');
        this.elements.configModal.setAttribute('aria-hidden', 'true');
        this.elements.overlay.setAttribute('aria-hidden', 'true');
    }

    /**
     * Valida el input de API Key en tiempo real
     */
    validateApiKeyInput() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        
        if (apiKey.length === 0) {
            this.setFieldError(this.elements.apiKeyInput, this.elements.apiKeyError, '');
            this.elements.configSaveBtn.disabled = true;
            return false;
        }
        
        if (!apiKey.startsWith('sk-')) {
            this.setFieldError(this.elements.apiKeyInput, this.elements.apiKeyError, 
                              'La API Key debe comenzar con "sk-"');
            this.elements.configSaveBtn.disabled = true;
            return false;
        }
        
        if (apiKey.length < 20) {
            this.setFieldError(this.elements.apiKeyInput, this.elements.apiKeyError, 
                              'La API Key parece ser muy corta');
            this.elements.configSaveBtn.disabled = true;
            return false;
        }
        
        this.clearFieldError(this.elements.apiKeyInput, this.elements.apiKeyError);
        this.elements.configSaveBtn.disabled = false;
        return true;
    }

    /**
     * Maneja el envío del formulario de configuración
     */
    async handleConfigSubmit(event) {
        event.preventDefault();
        
        const apiKey = this.elements.apiKeyInput.value.trim();
        
        if (!this.validateApiKeyInput()) {
            return;
        }

        console.log('🔑 Guardando API Key...');
        
        // Mostrar estado de validación
        this.showConfigStatus('⏳', 'Validando API Key con OpenAI...', 'validating');
        this.elements.configSaveBtn.disabled = true;
        
        try {
            // Validar API Key
            const validateResponse = await fetch(`${this.config.backendUrl}/api/config/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });
            
            const validateResult = await validateResponse.json();
            
            if (!validateResult.valid) {
                this.showConfigStatus('❌', validateResult.message || 'API Key inválida', 'error');
                this.elements.configSaveBtn.disabled = false;
                return;
            }
            
            // Guardar API Key
            const saveResponse = await fetch(`${this.config.backendUrl}/api/config/api-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });
            
            const saveResult = await saveResponse.json();
            
            if (saveResult.success) {
                this.showConfigStatus('✅', 'API Key configurada correctamente', 'success');
                this.state.isConfigured = true;
                
                setTimeout(() => {
                    this.closeConfigModal();
                    this.checkSavedUser();
                    this.showToast('API Key configurada correctamente', 'success');
                }, 1500);
                
            } else {
                this.showConfigStatus('❌', saveResult.message || 'Error guardando API Key', 'error');
                this.elements.configSaveBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('❌ Error configurando API Key:', error);
            this.showConfigStatus('❌', 'Error de conexión con el servidor', 'error');
            this.elements.configSaveBtn.disabled = false;
        }
    }

    /**
     * Maneja el botón "Saltar por ahora"
     */
    handleConfigSkip() {
        console.log('⏭️ Saltando configuración de API Key');
        
        this.closeConfigModal();
        this.state.isConfigured = false;
        this.checkSavedUser();
        
        this.showToast('Puedes configurar la API Key más tarde desde el botón ⚙️', 'warning');
    }

    /**
     * Muestra el estado de la configuración
     */
    showConfigStatus(icon, text, type = '') {
        this.elements.configStatus.style.display = 'block';
        this.elements.configStatus.className = `config-status ${type}`;
        
        const iconElement = this.elements.configStatus.querySelector('.status-icon');
        const textElement = this.elements.configStatus.querySelector('.status-text');
        
        iconElement.textContent = icon;
        textElement.textContent = text;
    }

    /**
     * Configura el modo debug
     */
    setupDebugMode() {
        this.elements.debugInfo.style.display = 'block';
        this.debugLog('Modo debug activado', {
            backendUrl: this.config.backendUrl,
            userId: this.state.userId
        });
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
    // ============================================

    setupFocusTrap() {
        this.state.focusableElements = this.elements.modal.querySelectorAll(
            'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        this.state.currentFocusIndex = 0;
    }

    handleTabNavigation(event) {
        if (!this.state.isModalOpen || this.state.focusableElements.length === 0) return;

        const firstElement = this.state.focusableElements[0];
        const lastElement = this.state.focusableElements[this.state.focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                if (this.state.isModalOpen) {
                    event.preventDefault();
                    this.handleModalCancel();
                }
                break;
            case 'Enter':
                if (this.state.isModalOpen && event.target === this.elements.nameInput) {
                    event.preventDefault();
                    this.elements.dateInput.focus();
                } else if (this.state.isModalOpen && event.target === this.elements.dateInput) {
                    event.preventDefault();
                    if (!this.elements.acceptBtn.disabled) {
                        this.handleModalSubmit(event);
                    }
                }
                break;
            case 'Tab':
                if (this.state.isModalOpen) {
                    this.handleTabNavigation(event);
                }
                break;
        }
    }

    handleOverlayClick(event) {
        if (event.target === this.elements.overlay && this.state.isModalOpen) {
            this.handleModalCancel();
        }
    }

    validateName() {
        const name = this.elements.nameInput.value.trim();
        const nameError = this.elements.nameError;
        
        if (name.length === 0) {
            this.setFieldError(this.elements.nameInput, nameError, 'El nombre es obligatorio');
            return false;
        } else if (name.length < 2) {
            this.setFieldError(this.elements.nameInput, nameError, 'El nombre debe tener al menos 2 caracteres');
            return false;
        } else {
            this.clearFieldError(this.elements.nameInput, nameError);
            return true;
        }
    }

    validateDate() {
        const dateValue = this.elements.dateInput.value;
        const dateError = this.elements.dateError;
        const selectedDate = new Date(dateValue);
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (!dateValue) {
            this.setFieldError(this.elements.dateInput, dateError, 'La fecha es obligatoria');
            return false;
        } else if (isNaN(selectedDate.getTime())) {
            this.setFieldError(this.elements.dateInput, dateError, 'La fecha no es válida');
            return false;
        } else if (selectedDate > today) {
            this.setFieldError(this.elements.dateInput, dateError, 'La fecha no puede ser futura');
            return false;
        } else {
            this.clearFieldError(this.elements.dateInput, dateError);
            return true;
        }
    }

    validateForm() {
        const isNameValid = this.validateName();
        const isDateValid = this.validateDate();
        const isFormValid = isNameValid && isDateValid;
        
        this.elements.acceptBtn.disabled = !isFormValid;
        
        return isFormValid;
    }

    setFieldError(inputElement, errorElement, message) {
        inputElement.classList.add('invalid');
        inputElement.setAttribute('aria-invalid', 'true');
        errorElement.textContent = message;
        errorElement.setAttribute('aria-live', 'polite');
    }

    clearFieldError(inputElement, errorElement) {
        inputElement.classList.remove('invalid');
        inputElement.setAttribute('aria-invalid', 'false');
        errorElement.textContent = '';
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

// Variable global para acceder a la instancia desde los botones HTML
let chatbotApp;

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM cargado - Inicializando aplicación con backend...');
    chatbotApp = new ChatbotApp();
});
