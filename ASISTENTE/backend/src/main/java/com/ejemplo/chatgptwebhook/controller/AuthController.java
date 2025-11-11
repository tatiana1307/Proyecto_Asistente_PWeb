package com.ejemplo.chatgptwebhook.controller;

import com.ejemplo.chatgptwebhook.model.User;
import com.ejemplo.chatgptwebhook.model.SesionLogin;
import com.ejemplo.chatgptwebhook.model.JwtResponse;
import com.ejemplo.chatgptwebhook.repository.UserRepository;
import com.ejemplo.chatgptwebhook.repository.SesionLoginRepository;
import com.ejemplo.chatgptwebhook.util.JwtUtil;
import com.ejemplo.chatgptwebhook.service.CustomUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para gestionar la autenticación de usuarios.
 * Proporciona endpoints para registro, login y verificación de usuarios.
 * 
 * @author Asistente Virtual
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SesionLoginRepository sesionLoginRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registra un nuevo usuario en el sistema.
     * 
     * @param request Mapa con los datos del usuario: nombre, correo, cargo, contraseña
     * @return ResponseEntity con el resultado del registro
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Iniciando registro de nuevo usuario");
            
            // Extraer y validar datos
            String nombre = request.get("nombre");
            String correo = request.get("correo");
            String cargo = request.get("cargo");
            String contraseña = request.get("contraseña");
            
            // Validar campos requeridos
            if (nombre == null || nombre.trim().isEmpty() ||
                correo == null || correo.trim().isEmpty() ||
                contraseña == null || contraseña.trim().isEmpty()) {
                
                logger.warn("Intento de registro con campos vacíos");
                response.put("success", false);
                response.put("message", "Los campos nombre, correo y contraseña son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validar formato de correo básico
            if (!correo.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                logger.warn("Intento de registro con correo inválido: {}", correo);
                response.put("success", false);
                response.put("message", "El formato del correo electrónico no es válido");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Verificar si el correo ya existe
            if (userRepository.existsByCorreo(correo)) {
                logger.warn("Intento de registro con correo existente: {}", correo);
                response.put("success", false);
                response.put("message", "Ya existe un usuario con este correo electrónico");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Crear nuevo usuario con contraseña encriptada
            String contraseñaEncriptada = passwordEncoder.encode(contraseña);
            User nuevoUsuario = new User(nombre, correo, cargo, contraseñaEncriptada);
            User usuarioGuardado = userRepository.save(nuevoUsuario);
            
            logger.info("Usuario registrado exitosamente con ID: {}", usuarioGuardado.getId());
            
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("userId", usuarioGuardado.getId());
            response.put("nombre", usuarioGuardado.getNombre());
            response.put("correo", usuarioGuardado.getCorreo());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al registrar usuario", e);
            response.put("success", false);
            response.put("message", "Error al registrar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Autentica un usuario y genera un token JWT.
     * 
     * @param request Mapa con correo y contraseña del usuario
     * @param httpRequest Request HTTP para obtener información de la sesión
     * @return ResponseEntity con el token JWT y datos del usuario
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String correo = request.get("correo");
            String contraseña = request.get("contraseña");
            
            // Validar campos requeridos
            if (correo == null || correo.trim().isEmpty() ||
                contraseña == null || contraseña.trim().isEmpty()) {
                
                logger.warn("Intento de login con campos vacíos");
                return ResponseEntity.badRequest()
                    .body(new JwtResponse(null, null, null, null, "Correo y contraseña son obligatorios"));
            }
            
            // Buscar usuario por correo
            Optional<User> usuarioOpt = userRepository.findByCorreo(correo);
            
            if (usuarioOpt.isEmpty()) {
                logger.warn("Intento de login con usuario no encontrado: {}", correo);
                return ResponseEntity.badRequest()
                    .body(new JwtResponse(null, null, null, null, "Usuario no encontrado"));
            }
            
            User usuario = usuarioOpt.get();
            
            // Verificar contraseña
            if (!passwordEncoder.matches(contraseña, usuario.getContraseña())) {
                logger.warn("Intento de login con contraseña incorrecta para: {}", correo);
                return ResponseEntity.badRequest()
                    .body(new JwtResponse(null, null, null, null, "Contraseña incorrecta"));
            }
            
            // Generar token JWT
            UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getCorreo());
            String token = jwtUtil.generateToken(userDetails);
            Long expirationTime = jwtUtil.getExpirationTime();
            
            // Crear sesión de login
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            SesionLogin sesion = new SesionLogin(usuario, ipAddress, userAgent);
            sesionLoginRepository.save(sesion);
            
            logger.info("Login exitoso para usuario: {}", correo);
            
            return ResponseEntity.ok(new JwtResponse(token, expirationTime, usuario.getNombre(), 
                usuario.getCorreo(), "Login exitoso"));
            
        } catch (Exception e) {
            logger.error("Error al hacer login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new JwtResponse(null, null, null, null, "Error al hacer login: " + e.getMessage()));
        }
    }

    /**
     * Verifica si un correo electrónico ya está registrado en el sistema.
     * 
     * @param correo Correo electrónico a verificar
     * @return ResponseEntity con información sobre la existencia del correo
     */
    @GetMapping("/check-email/{correo}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String correo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean exists = userRepository.existsByCorreo(correo);
            response.put("exists", exists);
            response.put("message", exists ? "El correo ya está registrado" : "El correo está disponible");
            
            logger.debug("Verificación de correo {}: {}", correo, exists ? "existe" : "disponible");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al verificar correo: {}", correo, e);
            response.put("exists", false);
            response.put("message", "Error al verificar correo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtiene la dirección IP del cliente desde el request HTTP.
     * Considera headers de proxy como X-Forwarded-For y X-Real-IP.
     * 
     * @param request HttpServletRequest del cliente
     * @return Dirección IP del cliente
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
