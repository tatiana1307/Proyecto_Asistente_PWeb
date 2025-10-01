package com.ejemplo.chatgptwebhook.controller;

import com.ejemplo.chatgptwebhook.model.User;
import com.ejemplo.chatgptwebhook.model.SesionLogin;
import com.ejemplo.chatgptwebhook.repository.UserRepository;
import com.ejemplo.chatgptwebhook.repository.SesionLoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SesionLoginRepository sesionLoginRepository;

    /**
     * Endpoint para registrar un nuevo usuario
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🔍 Iniciando registro de usuario...");
            
            String nombre = request.get("nombre");
            String correo = request.get("correo");
            String cargo = request.get("cargo");
            String contraseña = request.get("contraseña");
            
            System.out.println("📝 Datos recibidos - Nombre: " + nombre + ", Correo: " + correo + ", Cargo: " + cargo);
            
            // Validar campos requeridos
            if (nombre == null || nombre.trim().isEmpty() ||
                correo == null || correo.trim().isEmpty() ||
                contraseña == null || contraseña.trim().isEmpty()) {
                
                System.out.println("❌ Validación fallida: campos vacíos");
                response.put("success", false);
                response.put("message", "Los campos nombre, correo y contraseña son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("✅ Validación de campos exitosa");
            
            // Verificar si el correo ya existe
            System.out.println("🔍 Verificando si el correo ya existe...");
            boolean correoExiste = userRepository.existsByCorreo(correo);
            System.out.println("📧 Correo existe: " + correoExiste);
            
            if (correoExiste) {
                response.put("success", false);
                response.put("message", "Ya existe un usuario con este correo electrónico");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Crear nuevo usuario
            System.out.println("👤 Creando nuevo usuario...");
            User nuevoUsuario = new User(nombre, correo, cargo, contraseña);
            System.out.println("💾 Guardando usuario en la base de datos...");
            
            User usuarioGuardado = userRepository.save(nuevoUsuario);
            System.out.println("✅ Usuario guardado exitosamente con ID: " + usuarioGuardado.getId());
            
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("userId", usuarioGuardado.getId());
            response.put("nombre", usuarioGuardado.getNombre());
            response.put("correo", usuarioGuardado.getCorreo());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error en registro: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al registrar usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Endpoint para hacer login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String correo = request.get("correo");
            String contraseña = request.get("contraseña");
            
            // Validar campos requeridos
            if (correo == null || correo.trim().isEmpty() ||
                contraseña == null || contraseña.trim().isEmpty()) {
                
                response.put("success", false);
                response.put("message", "Correo y contraseña son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Primero verificar si el usuario existe
            boolean usuarioExiste = userRepository.existsByCorreo(correo);
            
            if (!usuarioExiste) {
                response.put("success", false);
                response.put("message", "El usuario con el correo " + correo + " no está registrado en nuestra base de datos");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Si el usuario existe, verificar credenciales
            Optional<User> usuarioOpt = userRepository.findByCorreoAndContraseña(correo, contraseña);
            
            if (usuarioOpt.isPresent()) {
                User usuario = usuarioOpt.get();
                
                // Crear sesión de login
                String ipAddress = getClientIpAddress(httpRequest);
                String userAgent = httpRequest.getHeader("User-Agent");
                
                SesionLogin sesion = new SesionLogin(usuario, ipAddress, userAgent);
                sesionLoginRepository.save(sesion);
                
                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("userId", usuario.getId());
                response.put("nombre", usuario.getNombre());
                response.put("correo", usuario.getCorreo());
                response.put("sessionId", sesion.getId());
                
                return ResponseEntity.ok(response);
                
            } else {
                response.put("success", false);
                response.put("message", "Contraseña incorrecta para el usuario " + correo);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al hacer login: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Endpoint para verificar si un correo existe
     */
    @GetMapping("/check-email/{correo}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String correo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean exists = userRepository.existsByCorreo(correo);
            response.put("exists", exists);
            response.put("message", exists ? "El correo ya está registrado" : "El correo está disponible");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("exists", false);
            response.put("message", "Error al verificar correo: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Método auxiliar para obtener la IP del cliente
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
