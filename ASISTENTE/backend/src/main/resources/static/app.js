

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
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Elementos para gestión de proyectos
            projectModal: document.getElementById('projectModal'),
            projectForm: document.getElementById('projectForm'),
            projectName: document.getElementById('projectName'),
            closeProjectModal: document.getElementById('closeProjectModal'),
            cancelProject: document.getElementById('cancelProject'),
            
            // Elementos para gestión de tareas
            taskModal: document.getElementById('taskModal'),
            taskForm: document.getElementById('taskForm'),
            taskName: document.getElementById('taskName'),
            taskDescription: document.getElementById('taskDescription'),
            closeTaskModal: document.getElementById('closeTaskModal'),
            cancelTask: document.getElementById('cancelTask'),
            
            // Elementos para consultar tareas
            tasksModal: document.getElementById('tasksModal'),
            currentProjectName: document.getElementById('currentProjectName'),
            statusFilter: document.getElementById('statusFilter'),
            tasksList: document.getElementById('tasksList'),
            closeTasksModal: document.getElementById('closeTasksModal'),
            
            // Elementos para botones fijos de tareas
            fixedTaskButtons: document.getElementById('fixedTaskButtons'),
            fixedCreateTaskBtn: document.getElementById('fixedCreateTaskBtn'),
            fixedViewTasksBtn: document.getElementById('fixedViewTasksBtn'),
            
            // Elementos para configuración de API
            configModal: document.getElementById('configModal'),
            configForm: document.getElementById('configForm'),
            apiKey: document.getElementById('apiKey'),
            closeConfigModal: document.getElementById('closeConfigModal'),
            cancelConfig: document.getElementById('cancelConfig'),
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
        
        // Estado de proyectos y tareas
        currentProject: null,
        tasks: [],
        projectCreated: false,
        
        // Estado de configuración
        isConfigured: false,
        waitingForProjectIdea: false,
        waitingForNewTask: false,
        waitingForTaskNumber: false,
        chatbotInitialized: false,
        menuShown: false
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
     * MÉTODOS PARA GESTIÓN DE PROYECTOS Y TAREAS
     */

    /**
     * Muestra el modal para crear proyecto
     */
    showProjectModal() {
        this.elements.projectModal.style.display = 'flex';
        this.elements.projectName.focus();
    }

    /**
     * Oculta el modal de proyecto
     */
    hideProjectModal() {
        this.elements.projectModal.style.display = 'none';
        this.elements.projectForm.reset();
    }

    /**
     * Crea un nuevo proyecto
     */
    createProject(projectName) {
        this.state.currentProject = {
            id: Date.now(),
            name: projectName,
            createdAt: new Date()
        };
        this.state.projectCreated = true;
        this.state.tasks = [];
        
        // Mostrar mensaje de confirmación
        this.addBotMessage(`✅ Proyecto "${projectName}" creado exitosamente.`);
        
        // Generar tareas para el proyecto y mostrar botones fijos
        this.generateTasksForProjectAndShowButtons(projectName);
        
        // Cambiar el menú para mostrar solo "Crear Tareas" y "Consultar"
        this.showProjectMenu();
    }

    /**
     * Genera tareas para el proyecto y muestra los botones fijos
     */
    generateTasksForProjectAndShowButtons(projectName) {
        console.log('📋 Generando tareas para el proyecto:', projectName);
        
        // Generar tareas específicas basadas en el nombre del proyecto
        const projectTasks = this.generateTasksForProject(projectName);
        this.state.tasks = projectTasks;
        
        console.log('📋 Tareas generadas:', this.state.tasks);
        
        // Mostrar mensaje informativo sobre las tareas generadas
        this.addBotMessage(`📋 Se han generado ${projectTasks.length} tareas para tu proyecto "${projectName}".`);
        this.addBotMessage('💡 Ahora puedes gestionar las tareas usando los botones fijos en la parte inferior.');
        
        // Mostrar los botones fijos
        console.log('🔧 Intentando mostrar botones fijos...');
        console.log('🔧 Elemento fixedTaskButtons:', this.elements.fixedTaskButtons);
        console.log('🔧 Estado del elemento:', this.elements.fixedTaskButtons ? 'ENCONTRADO' : 'NO ENCONTRADO');
        
        if (this.elements.fixedTaskButtons) {
            console.log('🔧 Elemento existe, llamando showFixedTaskButtons...');
            this.showFixedTaskButtons();
        } else {
            console.error('❌ Elemento fixedTaskButtons no encontrado en this.elements');
            
            // Intentar buscar el elemento directamente en el DOM
            const directElement = document.getElementById('fixedTaskButtons');
            console.log('🔧 Búsqueda directa en DOM:', directElement);
            
            if (directElement) {
                console.log('🔧 Elemento encontrado directamente, asignando...');
                this.elements.fixedTaskButtons = directElement;
                this.showFixedTaskButtons();
            } else {
                console.error('❌ Elemento no encontrado ni en this.elements ni en DOM');
                
                // Crear los botones dinámicamente como último recurso
                console.log('🔧 Creando botones dinámicamente...');
                this.createFixedButtonsDynamically();
            }
        }
        
        // Mostrar el menú principal filtrado (sin "Crear Proyecto")
        setTimeout(() => {
            this.showFilteredMainMenu();
        }, 1000);
    }

    /**
     * Muestra el menú principal filtrado (sin "Crear Proyecto")
     */
    showFilteredMainMenu() {
        console.log('📋 Mostrando menú principal filtrado...');
        
        // Crear el menú principal filtrado
        const menuHTML = `
            <div class="menu-container">
                <div class="menu-header">
                    <h4>🎯 Menú Principal - Proyecto Activo</h4>
                    <p class="menu-subtitle">¿Qué te gustaría hacer?</p>
                </div>
                <div class="menu-options">
                    <div class="menu-option-card" data-option-id="2" data-option-action="add-task">
                        <div class="menu-option-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="menu-option-content">
                            <h5 class="menu-option-title">Crear Tareas</h5>
                            <p class="menu-option-description">Genera tareas automáticamente para tu proyecto</p>
                        </div>
                    </div>
                    <div class="menu-option-card" data-option-id="3" data-option-action="view-tasks">
                        <div class="menu-option-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="menu-option-content">
                            <h5 class="menu-option-title">Consultar Tareas</h5>
                            <p class="menu-option-description">Revisa el estado de tus proyectos existentes</p>
                        </div>
                    </div>
                    <div class="menu-option-card" data-option-id="4" data-option-action="manage-tasks">
                        <div class="menu-option-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="menu-option-content">
                            <h5 class="menu-option-title">Gestionar Tareas</h5>
                            <p class="menu-option-description">Gestiona las tareas de tu proyecto</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir el menú al chat
        this.addBotMessage(menuHTML);
        
        // Configurar event listeners para las opciones del menú
        setTimeout(() => {
            this.setupMenuEventListeners();
        }, 100);
    }

    /**
     * Configura los event listeners para las opciones del menú
     */
    setupMenuEventListeners() {
        console.log('🔧 Configurando event listeners del menú...');
        
        // Buscar todas las opciones del menú
        const menuCards = document.querySelectorAll('.menu-option-card');
        console.log('🔧 Opciones del menú encontradas:', menuCards.length);
        
        menuCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const optionId = parseInt(card.dataset.optionId);
                const action = card.dataset.optionAction;
                const title = card.querySelector('.menu-option-title').textContent;
                
                console.log('🔧 Opción del menú clickeada:', { optionId, action, title });
                
                // Procesar la opción seleccionada
                this.handleMenuOptionClick(optionId, action, title);
            });
        });
    }

    /**
     * Muestra el menú específico del proyecto (solo Crear Tareas y Consultar)
     */
    showProjectMenu() {
        const menuHTML = `
            <div class="menu-container">
                <h3 class="menu-title">Menú del Proyecto - ${this.state.currentProject.name}</h3>
                <div class="menu-options">
                    <div class="menu-option-card" data-option-id="2" data-option-action="add-task">
                        <div class="menu-option-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                        </div>
                        <div class="menu-option-content">
                            <h4 class="menu-option-title">Crear Tarea</h4>
                            <p class="menu-option-description">Agregar nueva tarea al proyecto</p>
                        </div>
                    </div>
                    <div class="menu-option-card" data-option-id="3" data-option-action="view-tasks">
                        <div class="menu-option-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H3v2h16V4z"/>
                            </svg>
                        </div>
                        <div class="menu-option-content">
                            <h4 class="menu-option-title">Consultar Tareas</h4>
                            <p class="menu-option-description">Ver tablero de tareas del proyecto</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.addBotMessage(menuHTML, true);
    }

    /**
     * Muestra el modal para agregar tarea
     */
    showTaskModal() {
        // Verificar si hay una sesión activa (proyecto creado)
        if (!this.state.menuSessionId) {
            this.addBotMessage('❌ Primero debes crear un proyecto.');
            return;
        }
        
        console.log('➕ Mostrando modal para crear tarea...');
        console.log('➕ Elemento taskModal:', this.elements.taskModal);
        console.log('➕ Elemento taskName:', this.elements.taskName);
        
        if (this.elements.taskModal) {
            this.elements.taskModal.style.display = 'flex';
            console.log('✅ Modal de tarea mostrado');
        } else {
            console.error('❌ No se encontró el elemento taskModal');
        }
        
        if (this.elements.taskName) {
            this.elements.taskName.focus();
            console.log('✅ Campo de nombre enfocado');
        } else {
            console.error('❌ No se encontró el elemento taskName');
        }
    }

    /**
     * Oculta el modal de tarea
     */
    hideTaskModal() {
        this.elements.taskModal.style.display = 'none';
        this.elements.taskForm.reset();
    }

    /**
     * Agrega una nueva tarea
     */
    addTask(taskName, taskDescription = '') {
        const newTask = {
            id: Date.now(),
            name: taskName,
            description: taskDescription,
            status: 'new',
            createdAt: new Date()
        };
        
        this.state.tasks.push(newTask);
        
        this.addBotMessage(`✅ Tarea "${taskName}" agregada exitosamente.`);
        this.addBotMessage(`Total de tareas: ${this.state.tasks.length}`);
    }

    /**
     * Muestra el modal para consultar tareas
     */
    showTasksModal() {
        if (!this.state.currentProject) {
            this.addBotMessage('❌ No hay proyecto activo.');
            return;
        }
        
        this.elements.currentProjectName.textContent = this.state.currentProject.name;
        this.elements.tasksModal.style.display = 'flex';
        this.renderTasksList();
    }

    /**
     * Muestra el tablero de tareas en un popup
     */
    showTasksBoard() {
        console.log('📋 Estado actual de tareas:', this.state.tasks);
        console.log('📋 Número de tareas:', this.state.tasks.length);
        console.log('📋 Proyecto actual:', this.state.currentProject);
        console.log('📋 Sesión activa:', this.state.menuSessionId);

        if (this.state.tasks.length === 0) {
            this.addBotMessage('📋 No hay tareas disponibles para mostrar en el tablero.');
            this.addBotMessage('💡 Sincronizando tareas desde el backend...');
            
            // Intentar sincronizar tareas desde el backend
            this.syncTasksFromBackend();
            
            // Mostrar el tablero después de sincronizar
            setTimeout(() => {
                this.showTasksBoard();
            }, 1000);
            return;
        }

        // Mostrar popup con el tablero de tareas
        this.showTasksBoardPopup();
    }

    /**
     * Muestra el popup del tablero de tareas
     */
    showTasksBoardPopup() {
        // Usar el nombre del proyecto de la sesión si no hay proyecto local
        const projectName = this.state.currentProject ? this.state.currentProject.name : 'Proyecto Actual';
        
        const boardHTML = `
            <div class="tasks-board-container">
                <h3 class="board-title">📋 Tablero de Tareas - ${projectName}</h3>
                <div class="tasks-board">
                    <div class="board-column" data-status="new">
                        <div class="column-header">
                            <h4>🆕 Nuevas</h4>
                            <span class="task-count">${this.getTasksByStatus('new').length}</span>
                        </div>
                        <div class="tasks-column" id="new-tasks">
                            ${this.renderTasksForColumn('new')}
                        </div>
                    </div>
                    <div class="board-column" data-status="active">
                        <div class="column-header">
                            <h4>🔄 Activas</h4>
                            <span class="task-count">${this.getTasksByStatus('active').length}</span>
                        </div>
                        <div class="tasks-column" id="active-tasks">
                            ${this.renderTasksForColumn('active')}
                        </div>
                    </div>
                    <div class="board-column" data-status="closed">
                        <div class="column-header">
                            <h4>✅ Cerradas</h4>
                            <span class="task-count">${this.getTasksByStatus('closed').length}</span>
                        </div>
                        <div class="tasks-column" id="closed-tasks">
                            ${this.renderTasksForColumn('closed')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Crear el popup del tablero
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.innerHTML = `
            <div class="popup-content tasks-board-popup">
                <div class="popup-header">
                    <h3>📋 Tablero de Tareas</h3>
                    <button class="popup-close" onclick="this.closest('.popup-overlay').remove()">×</button>
                </div>
                <div class="popup-body">
                    ${boardHTML}
                </div>
            </div>
        `;

        // Añadir el popup al body
        document.body.appendChild(popup);

        // Añadir estilos para el popup
        const style = document.createElement('style');
        style.textContent = `
            .tasks-board-popup {
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
            }
            .tasks-board-popup .popup-body {
                padding: 20px;
            }
        `;
        document.head.appendChild(style);

        console.log('📋 Popup del tablero mostrado');
    }

    /**
     * Oculta el modal de tareas
     */
    hideTasksModal() {
        this.elements.tasksModal.style.display = 'none';
    }

    /**
     * Obtiene las tareas por estado
     */
    getTasksByStatus(status) {
        return this.state.tasks.filter(task => task.status === status);
    }

    /**
     * Renderiza las tareas para una columna específica
     */
    renderTasksForColumn(status) {
        const tasks = this.getTasksByStatus(status);
        if (tasks.length === 0) {
            return '<div class="empty-column">No hay tareas</div>';
        }
        
        return tasks.map(task => `
            <div class="task-card" data-task-id="${task.id}" draggable="true">
                <div class="task-header">
                    <h5 class="task-title">${task.name}</h5>
                    <div class="task-status-badge status-${task.status}">${task.status}</div>
                </div>
                <div class="task-content">
                    <p class="task-description">${task.description || 'Sin descripción'}</p>
                    <div class="task-actions">
                        <select class="status-selector" data-task-id="${task.id}">
                            <option value="new" ${task.status === 'new' ? 'selected' : ''}>Nueva</option>
                            <option value="active" ${task.status === 'active' ? 'selected' : ''}>Activa</option>
                            <option value="closed" ${task.status === 'closed' ? 'selected' : ''}>Cerrada</option>
                        </select>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Maneja el cambio de estado de una tarea
     */
    handleTaskStatusChange(event) {
        if (event.target.classList.contains('status-selector')) {
            const taskId = parseInt(event.target.dataset.taskId);
            const newStatus = event.target.value;
            
            // Actualizar el estado de la tarea
            const task = this.state.tasks.find(t => t.id === taskId);
            if (task) {
                const oldStatus = task.status;
                task.status = newStatus;
                
                console.log(`📝 Tarea "${task.name}" cambiada de ${oldStatus} a ${newStatus}`);
                
                // Mostrar mensaje de confirmación
                this.addBotMessage(`✅ Tarea "${task.name}" movida a estado: ${newStatus}`);
                
                // Actualizar el tablero si está visible
                this.refreshTasksBoard();
            }
        }
    }

    /**
     * Refresca el tablero de tareas
     */
    refreshTasksBoard() {
        // Buscar el contenedor del tablero y actualizarlo
        const boardContainer = document.querySelector('.tasks-board-container');
        if (boardContainer) {
            // Actualizar contadores
            const newCount = this.getTasksByStatus('new').length;
            const activeCount = this.getTasksByStatus('active').length;
            const closedCount = this.getTasksByStatus('closed').length;
            
            // Actualizar contadores en los headers
            const newColumn = boardContainer.querySelector('[data-status="new"] .task-count');
            const activeColumn = boardContainer.querySelector('[data-status="active"] .task-count');
            const closedColumn = boardContainer.querySelector('[data-status="closed"] .task-count');
            
            if (newColumn) newColumn.textContent = newCount;
            if (activeColumn) activeColumn.textContent = activeCount;
            if (closedColumn) closedColumn.textContent = closedCount;
            
            // Actualizar contenido de las columnas
            const newTasksColumn = boardContainer.querySelector('#new-tasks');
            const activeTasksColumn = boardContainer.querySelector('#active-tasks');
            const closedTasksColumn = boardContainer.querySelector('#closed-tasks');
            
            if (newTasksColumn) newTasksColumn.innerHTML = this.renderTasksForColumn('new');
            if (activeTasksColumn) activeTasksColumn.innerHTML = this.renderTasksForColumn('active');
            if (closedTasksColumn) closedTasksColumn.innerHTML = this.renderTasksForColumn('closed');
        }
    }

    /**
     * Sincroniza las tareas del backend con el estado local
     */
    async syncTasksFromBackend() {
        try {
            console.log('🔄 Sincronizando tareas desde el backend...');
            
            // Por ahora, crear tareas de ejemplo basadas en el proyecto
            // En el futuro se puede implementar un endpoint real para obtener las tareas
            console.log('📋 Creando tareas de ejemplo para el proyecto...');
            
            if (this.state.currentProject) {
                const projectTasks = this.generateTasksForProject(this.state.currentProject.name);
                this.state.tasks = projectTasks;
                console.log('📋 Tareas de ejemplo creadas:', this.state.tasks);
                console.log('📋 Total de tareas después de sincronizar:', this.state.tasks.length);
            } else {
                // Si no hay proyecto local, crear tareas genéricas
                const genericTasks = this.generateGenericTasks();
                this.state.tasks = genericTasks;
                console.log('📋 Tareas genéricas creadas:', this.state.tasks);
                console.log('📋 Total de tareas después de sincronizar:', this.state.tasks.length);
            }
            
            // Los botones fijos se mostrarán cuando el usuario cree el proyecto
        } catch (error) {
            console.error('❌ Error sincronizando tareas:', error);
            
            // En caso de error, crear tareas de ejemplo
            const genericTasks = this.generateGenericTasks();
            this.state.tasks = genericTasks;
            console.log('📋 Tareas de ejemplo creadas por error:', this.state.tasks);
        }
    }

    /**
     * Genera tareas genéricas cuando no hay proyecto específico
     */
    generateGenericTasks() {
        const genericTasks = [
            {
                id: Date.now() + 1,
                name: 'Análisis de requisitos',
                description: 'Definir y documentar los requisitos del proyecto',
                status: 'new',
                createdAt: new Date()
            },
            {
                id: Date.now() + 2,
                name: 'Diseño de arquitectura',
                description: 'Crear la arquitectura técnica del sistema',
                status: 'new',
                createdAt: new Date()
            },
            {
                id: Date.now() + 3,
                name: 'Implementación del backend',
                description: 'Desarrollar la lógica del servidor',
                status: 'active',
                createdAt: new Date()
            },
            {
                id: Date.now() + 4,
                name: 'Desarrollo del frontend',
                description: 'Crear la interfaz de usuario',
                status: 'active',
                createdAt: new Date()
            },
            {
                id: Date.now() + 5,
                name: 'Configuración inicial',
                description: 'Configurar el entorno de desarrollo',
                status: 'closed',
                createdAt: new Date()
            }
        ];
        
        return genericTasks;
    }

    /**
     * Genera tareas basadas en el nombre del proyecto
     */
    generateTasksForProject(projectName) {
        // Generar tareas específicas basadas en el tipo de proyecto
        let specificTasks = [];
        
        if (projectName.toLowerCase().includes('automatizacion') || projectName.toLowerCase().includes('automatización')) {
            specificTasks = [
                {
                    id: Date.now() + 1,
                    name: 'Análisis de procesos actuales',
                    description: `Identificar y documentar los procesos a automatizar en ${projectName}`,
                    status: 'new',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 2,
                    name: 'Diseño de flujo de automatización',
                    description: `Crear el flujo de trabajo automatizado para ${projectName}`,
                    status: 'new',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 3,
                    name: 'Implementación de scripts',
                    description: `Desarrollar los scripts de automatización para ${projectName}`,
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 4,
                    name: 'Configuración de herramientas',
                    description: `Configurar las herramientas de automatización para ${projectName}`,
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 5,
                    name: 'Pruebas de automatización',
                    description: `Validar el funcionamiento de la automatización en ${projectName}`,
                    status: 'closed',
                    createdAt: new Date()
                }
            ];
        } else if (projectName.toLowerCase().includes('api') || projectName.toLowerCase().includes('apis')) {
            specificTasks = [
                {
                    id: Date.now() + 1,
                    name: 'Diseño de endpoints',
                    description: `Definir los endpoints de la API para ${projectName}`,
                    status: 'new',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 2,
                    name: 'Implementación de controladores',
                    description: `Desarrollar los controladores de la API para ${projectName}`,
                    status: 'new',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 3,
                    name: 'Configuración de base de datos',
                    description: `Configurar la base de datos para ${projectName}`,
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 4,
                    name: 'Documentación de API',
                    description: `Crear la documentación de la API para ${projectName}`,
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 5,
                    name: 'Pruebas de integración',
                    description: `Realizar pruebas de integración para ${projectName}`,
                    status: 'closed',
                    createdAt: new Date()
                }
            ];
        } else {
            // Tareas genéricas para otros tipos de proyectos
            specificTasks = [
                {
                    id: Date.now() + 1,
                    name: 'Análisis de requisitos',
                    description: `Definir y documentar los requisitos para ${projectName}`,
                    status: 'new',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 2,
                    name: 'Diseño de arquitectura',
                    description: `Crear la arquitectura técnica para ${projectName}`,
                    status: 'new',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 3,
                    name: 'Implementación del backend',
                    description: `Desarrollar la lógica del servidor para ${projectName}`,
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 4,
                    name: 'Desarrollo del frontend',
                    description: `Crear la interfaz de usuario para ${projectName}`,
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: Date.now() + 5,
                    name: 'Configuración inicial',
                    description: `Configurar el entorno de desarrollo para ${projectName}`,
                    status: 'closed',
                    createdAt: new Date()
                }
            ];
        }
        
        return specificTasks;
    }

    /**
     * Crea tareas de ejemplo para demostrar el tablero
     */
    createSampleTasks() {
        const sampleTasks = [
            {
                id: Date.now() + 1,
                name: 'Análisis de requisitos',
                description: 'Definir y documentar los requisitos del proyecto',
                status: 'new',
                createdAt: new Date()
            },
            {
                id: Date.now() + 2,
                name: 'Diseño de arquitectura',
                description: 'Crear la arquitectura técnica del sistema',
                status: 'new',
                createdAt: new Date()
            },
            {
                id: Date.now() + 3,
                name: 'Implementación del backend',
                description: 'Desarrollar la lógica del servidor',
                status: 'active',
                createdAt: new Date()
            },
            {
                id: Date.now() + 4,
                name: 'Desarrollo del frontend',
                description: 'Crear la interfaz de usuario',
                status: 'active',
                createdAt: new Date()
            },
            {
                id: Date.now() + 5,
                name: 'Configuración inicial',
                description: 'Configurar el entorno de desarrollo',
                status: 'closed',
                createdAt: new Date()
            }
        ];

        this.state.tasks = sampleTasks;
        console.log('📋 Tareas de ejemplo creadas:', this.state.tasks);
        console.log('📋 Total de tareas:', this.state.tasks.length);
        
        // Verificar que las tareas se guardaron correctamente
        if (this.state.tasks.length > 0) {
            console.log('✅ Tareas guardadas exitosamente en el estado');
        } else {
            console.error('❌ Error: No se pudieron guardar las tareas');
        }
    }

    /**
     * Renderiza la lista de tareas
     */
    renderTasksList() {
        const filter = this.elements.statusFilter.value;
        let filteredTasks = this.state.tasks;
        
        if (filter !== 'all') {
            filteredTasks = this.state.tasks.filter(task => task.status === filter);
        }
        
        this.elements.tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.elements.tasksList.innerHTML = '<p>No hay tareas disponibles.</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.elements.tasksList.appendChild(taskElement);
        });
    }

    /**
     * Crea un elemento de tarea para la lista
     */
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.innerHTML = `
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div class="task-status">
                <span class="status-badge status-${task.status}">${task.status}</span>
                <select class="status-select" data-task-id="${task.id}">
                    <option value="new" ${task.status === 'new' ? 'selected' : ''}>Nueva</option>
                    <option value="active" ${task.status === 'active' ? 'selected' : ''}>Activa</option>
                    <option value="closed" ${task.status === 'closed' ? 'selected' : ''}>Cerrada</option>
                </select>
            </div>
        `;
        
        // Agregar evento para cambiar estado
        const statusSelect = taskDiv.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => {
            this.updateTaskStatus(task.id, e.target.value);
        });
        
        return taskDiv;
    }

    /**
     * Actualiza el estado de una tarea
     */
    updateTaskStatus(taskId, newStatus) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.renderTasksList();
            this.addBotMessage(`✅ Estado de tarea actualizado a: ${newStatus}`);
        }
    }

    /**
     * Muestra los botones fijos de gestión de tareas
     */
    showFixedTaskButtons() {
        console.log('🔧 showFixedTaskButtons llamado');
        console.log('🔧 this.elements.fixedTaskButtons:', this.elements.fixedTaskButtons);
        
        if (this.elements.fixedTaskButtons) {
            console.log('🔧 Elemento encontrado, mostrando botones...');
            
            // Forzar estilos inline para asegurar visibilidad
            this.elements.fixedTaskButtons.style.display = 'flex';
            this.elements.fixedTaskButtons.style.position = 'fixed';
            this.elements.fixedTaskButtons.style.bottom = '20px';
            this.elements.fixedTaskButtons.style.left = '50%';
            this.elements.fixedTaskButtons.style.transform = 'translateX(-50%)';
            this.elements.fixedTaskButtons.style.zIndex = '1000';
            this.elements.fixedTaskButtons.style.background = 'rgba(255, 255, 255, 0.95)';
            this.elements.fixedTaskButtons.style.padding = '15px 20px';
            this.elements.fixedTaskButtons.style.borderRadius = '15px';
            this.elements.fixedTaskButtons.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            this.elements.fixedTaskButtons.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            
            this.elements.fixedTaskButtons.classList.add('show');
            console.log('✅ Botones fijos de tareas mostrados');
            console.log('🔧 Estilo aplicado:', this.elements.fixedTaskButtons.style.display);
            console.log('🔧 Clases aplicadas:', this.elements.fixedTaskButtons.className);
            console.log('🔧 Posición:', this.elements.fixedTaskButtons.style.position);
            console.log('🔧 Bottom:', this.elements.fixedTaskButtons.style.bottom);
            
            // Verificar que el elemento sea visible
            const rect = this.elements.fixedTaskButtons.getBoundingClientRect();
            console.log('🔧 Dimensiones del elemento:', rect);
            console.log('🔧 Elemento visible:', rect.width > 0 && rect.height > 0);
        } else {
            console.error('❌ No se encontró el elemento fixedTaskButtons');
        }
    }

    /**
     * Crea los botones fijos dinámicamente si no existen
     */
    createFixedButtonsDynamically() {
        console.log('🔧 Creando botones fijos dinámicamente...');
        
        // Crear el contenedor principal
        const container = document.createElement('div');
        container.id = 'fixedTaskButtons';
        container.className = 'fixed-task-buttons';
        container.style.display = 'flex';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '1000';
        container.style.background = 'rgba(255, 255, 255, 0.95)';
        container.style.padding = '15px 20px';
        container.style.borderRadius = '15px';
        container.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        container.style.gap = '15px';
        
        // Crear botón "Crear Tarea"
        const createTaskBtn = document.createElement('button');
        createTaskBtn.id = 'fixedCreateTaskBtn';
        createTaskBtn.className = 'fixed-task-btn create-task-btn';
        createTaskBtn.title = 'Crear nueva tarea';
        createTaskBtn.innerHTML = `
            <span class="btn-icon">➕</span>
            <span class="btn-text">Crear Tarea</span>
        `;
        createTaskBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        createTaskBtn.style.color = 'white';
        createTaskBtn.style.border = '2px solid rgba(16, 185, 129, 0.3)';
        createTaskBtn.style.padding = '12px 20px';
        createTaskBtn.style.borderRadius = '12px';
        createTaskBtn.style.cursor = 'pointer';
        createTaskBtn.style.display = 'flex';
        createTaskBtn.style.alignItems = 'center';
        createTaskBtn.style.gap = '8px';
        createTaskBtn.style.minWidth = '160px';
        createTaskBtn.style.justifyContent = 'center';
        
        // Crear botón "Consultar Tareas"
        const viewTasksBtn = document.createElement('button');
        viewTasksBtn.id = 'fixedViewTasksBtn';
        viewTasksBtn.className = 'fixed-task-btn view-tasks-btn';
        viewTasksBtn.title = 'Consultar tareas';
        viewTasksBtn.innerHTML = `
            <span class="btn-icon">📋</span>
            <span class="btn-text">Consultar Tareas</span>
        `;
        viewTasksBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        viewTasksBtn.style.color = 'white';
        viewTasksBtn.style.border = '2px solid rgba(59, 130, 246, 0.3)';
        viewTasksBtn.style.padding = '12px 20px';
        viewTasksBtn.style.borderRadius = '12px';
        viewTasksBtn.style.cursor = 'pointer';
        viewTasksBtn.style.display = 'flex';
        viewTasksBtn.style.alignItems = 'center';
        viewTasksBtn.style.gap = '8px';
        viewTasksBtn.style.minWidth = '160px';
        viewTasksBtn.style.justifyContent = 'center';
        
        // Añadir botones al contenedor
        container.appendChild(createTaskBtn);
        container.appendChild(viewTasksBtn);
        
        // Añadir el contenedor al body
        document.body.appendChild(container);
        
        // Actualizar la referencia en this.elements
        this.elements.fixedTaskButtons = container;
        this.elements.fixedCreateTaskBtn = createTaskBtn;
        this.elements.fixedViewTasksBtn = viewTasksBtn;
        
        // Configurar event listeners
        createTaskBtn.addEventListener('click', () => this.showTaskModal());
        viewTasksBtn.addEventListener('click', () => this.showTasksBoard());
        
        console.log('✅ Botones fijos creados dinámicamente');
        console.log('🔧 Contenedor creado:', container);
        console.log('🔧 Botón crear tarea:', createTaskBtn);
        console.log('🔧 Botón consultar tareas:', viewTasksBtn);
    }

    /**
     * Oculta los botones fijos de gestión de tareas
     */
    hideFixedTaskButtons() {
        if (this.elements.fixedTaskButtons) {
            this.elements.fixedTaskButtons.style.display = 'none';
            this.elements.fixedTaskButtons.classList.remove('show');
            console.log('✅ Botones fijos de tareas ocultados');
        }
    }

    /**
     * Muestra el botón para agregar tareas
     */
    showAddTaskButton() {
        const addTaskBtn = document.createElement('button');
        addTaskBtn.className = 'add-task-btn';
        addTaskBtn.innerHTML = '+';
        addTaskBtn.title = 'Agregar nueva tarea';
        addTaskBtn.addEventListener('click', () => this.showTaskModal());
        
        // Agregar el botón al chatbot
        const chatForm = this.elements.chatForm;
        chatForm.parentNode.insertBefore(addTaskBtn, chatForm);
    }

    /**
     * MÉTODOS PARA CONFIGURACIÓN DE API KEY
     */

    /**
     * Muestra el modal de configuración
     */
    showConfigModal() {
        this.elements.configModal.style.display = 'flex';
        this.elements.apiKey.focus();
    }

    /**
     * Oculta el modal de configuración
     */
    hideConfigModal() {
        this.elements.configModal.style.display = 'none';
        this.elements.configForm.reset();
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
     * Guarda la configuración de la API key
     */
    async saveConfiguration(apiKey) {
        try {
            const response = await fetch(`${this.config.backendUrl}/api/config/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey: apiKey })
            });

            if (response.ok) {
                this.state.isConfigured = true;
                this.showConfigStatus('✅ API Key configurada exitosamente', 'success');
                this.hideConfigModal();
            } else {
                throw new Error('Error al guardar la configuración');
            }
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            this.showConfigStatus('❌ Error al guardar la configuración', 'error');
        }
    }

    /**
     * Muestra el estado de la configuración
     */
    showConfigStatus(message, type) {
        // Remover status anterior si existe
        const existingStatus = this.elements.configModal.querySelector('.config-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Crear nuevo status
        const statusDiv = document.createElement('div');
        statusDiv.className = `config-status ${type}`;
        statusDiv.textContent = message;
        
        // Insertar después del formulario
        this.elements.configForm.parentNode.insertBefore(statusDiv, this.elements.configForm.nextSibling);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }

    /**
     * Configura los event listeners para gestión de proyectos
     */
    setupProjectEventListeners() {
        // Modal de proyecto
        if (this.elements.projectForm) {
            this.elements.projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const projectName = this.elements.projectName.value.trim();
                if (projectName) {
                    this.createProject(projectName);
                    this.hideProjectModal();
                }
            });
        }

        if (this.elements.closeProjectModal) {
            this.elements.closeProjectModal.addEventListener('click', () => this.hideProjectModal());
        }

        if (this.elements.cancelProject) {
            this.elements.cancelProject.addEventListener('click', () => this.hideProjectModal());
        }

        // Modal de tarea
        if (this.elements.taskForm) {
            this.elements.taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const taskName = this.elements.taskName.value.trim();
                const taskDescription = this.elements.taskDescription.value.trim();
                if (taskName) {
                    this.addTask(taskName, taskDescription);
                    this.hideTaskModal();
                }
            });
        }

        if (this.elements.closeTaskModal) {
            this.elements.closeTaskModal.addEventListener('click', () => this.hideTaskModal());
        }

        if (this.elements.cancelTask) {
            this.elements.cancelTask.addEventListener('click', () => this.hideTaskModal());
        }

        // Modal de consulta de tareas
        if (this.elements.closeTasksModal) {
            this.elements.closeTasksModal.addEventListener('click', () => this.hideTasksModal());
        }

        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', () => this.renderTasksList());
        }

        // Cerrar modales al hacer clic en el overlay
        [this.elements.projectModal, this.elements.taskModal, this.elements.tasksModal, this.elements.configModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }

    /**
     * Configura los event listeners para configuración de API
     */
    setupConfigEventListeners() {
        // Botón de configuración
        if (this.elements.configBtn) {
            this.elements.configBtn.addEventListener('click', () => this.showConfigModal());
        }

        // Formulario de configuración
        if (this.elements.configForm) {
            this.elements.configForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const apiKey = this.elements.apiKey.value.trim();
                if (apiKey) {
                    this.saveConfiguration(apiKey);
                }
            });
        }

        // Botones de cerrar y cancelar
        if (this.elements.closeConfigModal) {
            this.elements.closeConfigModal.addEventListener('click', () => this.hideConfigModal());
        }

        if (this.elements.cancelConfig) {
            this.elements.cancelConfig.addEventListener('click', () => this.hideConfigModal());
        }

        // Event listeners para botones fijos de tareas
        if (this.elements.fixedCreateTaskBtn) {
            this.elements.fixedCreateTaskBtn.addEventListener('click', () => this.showTaskModal());
        }

        if (this.elements.fixedViewTasksBtn) {
            this.elements.fixedViewTasksBtn.addEventListener('click', () => this.showTasksBoard());
        }
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

        // Event listeners para gestión de proyectos
        this.setupProjectEventListeners();
        
        // Event listeners para configuración de API
        this.setupConfigEventListeners();
        
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
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Delegación de eventos en el área de mensajes (para tarjetas del menú)
        if (this.elements.chatMessages) {
            this.elements.chatMessages.addEventListener('click', this.handleMenuCardClick.bind(this));
            this.elements.chatMessages.addEventListener('change', this.handleTaskStatusChange.bind(this));
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
        console.log('🔍 Elementos encontrados:', {
            nombreInput: this.elements.nombreInput,
            correoInput: this.elements.correoInput,
            contraseñaInput: this.elements.contraseñaInput,
            mensajeExito: this.elements.mensajeExito
        });
        
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
                console.log('🔍 Analizando respuesta de error:', result);
                console.log('🔍 Mensaje recibido:', result.message);
                console.log('🔍 ¿Contiene "no está registrado"?', result.message && result.message.includes('no está registrado'));
                
                // Verificar si el error es porque el usuario no está registrado
                if (result.message && result.message.includes('no está registrado')) {
                    console.log('⚠️ Usuario no registrado, mostrando popup');
                    // Limpiar mensaje de éxito
                    this.elements.mensajeExito.textContent = '';
                    // Mostrar popup
                    this.showNoRegistradoPopup();
                    // NO hacer transición al chatbot
                    return;
                } else {
                    console.log('❌ Otro tipo de error, mostrando mensaje normal');
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
        
        // Verificar si hay un popup abierto antes de hacer la transición
        if (this.elements.popupNoRegistrado && this.elements.popupNoRegistrado.style.display === 'flex') {
            console.log('⚠️ Hay un popup abierto, no haciendo transición al chatbot');
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
     * Verifica si hay un usuario guardado en localStorage
     */
    checkSavedUser() {
        // Evitar duplicación si ya se está mostrando el chatbot
        if (this.state.chatbotInitialized) {
            console.log('🔄 Chatbot ya inicializado, evitando duplicación');
            return;
        }

        const savedUser = localStorage.getItem('chatbot_user');
        const savedDate = localStorage.getItem('chatbot_date');

        if (savedUser && savedDate) {
            console.log(`👤 Usuario guardado encontrado: ${savedUser}`);
            this.state.userName = savedUser;
            this.state.selectedDate = savedDate;
            this.state.chatbotInitialized = true;
            this.showChatbot();
        } else {
            // Si hay datos de login, usar el nombre del login como usuario del chatbot
            if (this.state.isLoggedIn && this.state.loginData.nombre) {
                console.log(`👤 Usando nombre del login: ${this.state.loginData.nombre}`);
                this.state.userName = this.state.loginData.nombre;
                this.state.selectedDate = new Date().toISOString().split('T')[0];
                this.state.chatbotInitialized = true;
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
        // Evitar duplicación si ya se está mostrando el chatbot
        if (this.state.chatbotInitialized) {
            console.log('🔄 Chatbot ya inicializado, evitando duplicación');
            return;
        }

        console.log('💬 Mostrando chatbot...');
        console.log('Estado del chatbot:', {
            userName: this.state.userName,
            chatMessages: this.elements.chatMessages,
            chatbot: this.elements.chatbot
        });
        
        // Marcar como inicializado
        this.state.chatbotInitialized = true;
        
        // Limpiar mensajes anteriores
        if (this.elements.chatMessages) {
            this.elements.chatMessages.innerHTML = '';
            this.state.conversationHistory = [];
            
            // Mostrar saludo personalizado
            setTimeout(() => {
                this.addBotMessage(`¡Hola, ${this.state.userName}! Soy tu asistente de proyectos. ¿En qué puedo ayudarte hoy?`);
                // Mostrar menú después del saludo
                setTimeout(() => {
                    this.showMenuOptions();
                }, 1000);
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
        // Evitar duplicación del menú si ya se está mostrando
        if (this.state.menuShown) {
            console.log('🔄 Menú ya mostrado, evitando duplicación');
            return;
        }

        const menuData = await this.loadMenuOptions();
        
        if (!menuData || !menuData.opciones) {
            this.addBotMessage('Lo siento, no pude cargar las opciones del menú. Por favor, intenta nuevamente.');
            return;
        }

        // Marcar como mostrado
        this.state.menuShown = true;

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
            4: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            5: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
        };

        let messageHTML = `<div class="menu-container">`;
        messageHTML += `<div class="menu-header">`;
        messageHTML += `<h4>${menuData.titulo}</h4>`;
        messageHTML += `<p class="menu-subtitle">¿Qué te gustaría hacer?</p>`;
        messageHTML += `</div>`;
        messageHTML += `<div class="menu-options">`;
        
        // Filtrar solo la opción "Salir" (opción 4) del menú principal, mantener las demás
        const opcionesFiltradas = menuData.opciones.filter(opcion => {
            // Solo excluir la opción 4 (Salir) si tiene la acción "salir"
            return !(opcion.id === 4 && opcion.accion === 'salir');
        });
        
        opcionesFiltradas.forEach(opcion => {
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
            4: "Gestiona las tareas de tu proyecto",
            5: "Otra funcionalidad del sistema"
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
        
        // Resetear flags de duplicación
        this.state.chatbotInitialized = false;
        this.state.menuShown = false;
        
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
            // Opción 2: Crear tarea - mostrar modal para agregar tarea
            console.log('➕ Mostrando modal para crear tarea...');
            this.showTaskModal();
        } else if (optionId === 3) {
            // Opción 3: Consultar tareas - mostrar tablero de tareas
            console.log('📋 Mostrando tablero de tareas...');
            this.showTasksBoard();
        } else if (optionId === 4) {
            // Opción 4: Gestionar tareas - mostrar modal de tareas
            console.log('📋 Mostrando modal de gestión de tareas...');
            this.showTasksModal();
        } else if (optionId === 5) {
            // Opción 5: Otra funcionalidad - procesar con backend
            console.log('🔧 Procesando opción 5...');
            this.processMenuAction(action, description, optionId);
        } else {
            // Procesar la acción seleccionada usando el backend para otras opciones
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
                
                // Si es crear proyecto (opción 1), sincronizar las tareas generadas
                if (optionId === 1) {
                    console.log('📋 Proyecto creado, sincronizando tareas...');
                    await this.syncTasksFromBackend();
                }
                
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
        
        const message = this.elements.chatInput.value.trim().toLowerCase();
        
        // Manejar comandos de proyectos
        if (message.includes('crear proyecto') || message.includes('nuevo proyecto')) {
            this.showProjectModal();
            this.elements.chatInput.value = '';
            return;
        }
        
        if (message.includes('agregar tarea') || message.includes('nueva tarea')) {
            this.showTaskModal();
            this.elements.chatInput.value = '';
            return;
        }
        
        if (message.includes('consultar tareas') || message.includes('ver tareas') || message.includes('tareas')) {
            this.showTasksModal();
            this.elements.chatInput.value = '';
            return;
        }
        
        // Si no es un comando de proyecto, procesar como mensaje normal
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
     * Cierra la sesión del usuario
     */
    logout() {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar datos de login
        localStorage.removeItem('user_login');
        
        // Resetear estado
        this.state.isLoggedIn = false;
        this.state.loginData = { nombre: '', correo: '', contraseña: '' };
        this.state.userName = '';
        this.state.conversationHistory = [];
        this.state.chatbotInitialized = false;
        this.state.menuShown = false;
        this.state.currentProject = null;
        this.state.tasks = [];
        this.state.projectCreated = false;
        
        // Ocultar botones fijos de tareas
        this.hideFixedTaskButtons();
        
        // Mostrar mensaje de despedida
        this.addBotMessage('👋 ¡Hasta luego! Gracias por usar el asistente de proyectos.');
        
        // Mostrar login después de un breve delay
        setTimeout(() => {
            this.showLoginSection();
        }, 1500);
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
        console.log('🔍 Elemento popup encontrado:', this.elements.popupNoRegistrado);
        
        if (this.elements.popupNoRegistrado) {
            console.log('🔍 Estableciendo display: flex');
            this.elements.popupNoRegistrado.style.display = 'flex';
            this.elements.popupNoRegistrado.style.opacity = '0';
            
            // Agregar animación de entrada
            setTimeout(() => {
                console.log('🔍 Estableciendo opacity: 1');
                this.elements.popupNoRegistrado.style.opacity = '1';
            }, 10);
        } else {
            console.error('❌ Elemento popupNoRegistrado no encontrado');
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
    chatbotApp.init();
});
