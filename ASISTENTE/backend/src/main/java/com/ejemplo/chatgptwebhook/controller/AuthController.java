package com.ejemplo.chatgptwebhook.controller;

import com.ejemplo.chatgptwebhook.model.User;
import com.ejemplo.chatgptwebhook.model.SesionLogin;
import com.ejemplo.chatgptwebhook.model.JwtResponse;
import com.ejemplo.chatgptwebhook.repository.UserRepository;
import com.ejemplo.chatgptwebhook.repository.SesionLoginRepository;
import com.ejemplo.chatgptwebhook.util.JwtUtil;
import com.ejemplo.chatgptwebhook.service.CustomUserDetailsService;
import com.ejemplo.chatgptwebhook.service.TwoFactorAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TwoFactorAuthService twoFactorAuthService;

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
            
            // Crear nuevo usuario con contraseña encriptada
            System.out.println("👤 Creando nuevo usuario...");
            String contraseñaEncriptada = passwordEncoder.encode(contraseña);
            User nuevoUsuario = new User(nombre, correo, cargo, contraseñaEncriptada);
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
     * Endpoint para hacer login con JWT
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String correo = request.get("correo");
            String contraseña = request.get("contraseña");
            
            // Validar campos requeridos
            if (correo == null || correo.trim().isEmpty() ||
                contraseña == null || contraseña.trim().isEmpty()) {
                
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Correo y contraseña son obligatorios"));
            }
            
            // Buscar usuario por correo
            Optional<User> usuarioOpt = userRepository.findByCorreo(correo);
            
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Usuario no encontrado"));
            }
            
            User usuario = usuarioOpt.get();
            
            // Verificar contraseña
            if (!passwordEncoder.matches(contraseña, usuario.getContraseña())) {
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Contraseña incorrecta"));
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
            
            return ResponseEntity.ok(new JwtResponse(token, expirationTime, usuario.getNombre(), usuario.getCorreo(), "Login exitoso"));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new JwtResponse(null, null, null, null, "Error al hacer login: " + e.getMessage()));
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
     * Endpoint para enviar código de verificación 2FA
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<Map<String, Object>> sendVerificationCode(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String correo = request.get("correo");
            String telefono = request.get("telefono");
            String tipo = request.get("tipo"); // "EMAIL", "SMS", "WHATSAPP"
            
            if (correo == null || correo.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El correo es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (tipo == null || tipo.trim().isEmpty()) {
                tipo = "EMAIL"; // Por defecto usar email
            }
            
            if (telefono == null || telefono.trim().isEmpty()) {
                telefono = "0000000000"; // Teléfono por defecto para desarrollo
            }
            
            boolean enviado = twoFactorAuthService.sendVerificationCode(correo, telefono, tipo);
            
            if (enviado) {
                response.put("success", true);
                response.put("message", "Código de verificación enviado por " + tipo);
                response.put("tipo", tipo);
            } else {
                response.put("success", false);
                response.put("message", "Error al enviar código de verificación");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Endpoint para verificar código 2FA
     */
    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, Object>> verifyCode(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String correo = request.get("correo");
            String codigo = request.get("codigo");
            
            if (correo == null || correo.trim().isEmpty() || 
                codigo == null || codigo.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Correo y código son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean verificado = twoFactorAuthService.verifyCode(correo, codigo);
            
            if (verificado) {
                response.put("success", true);
                response.put("message", "Código verificado correctamente");
            } else {
                response.put("success", false);
                response.put("message", "Código inválido o expirado");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Endpoint para login con 2FA
     */
    @PostMapping("/login-2fa")
    public ResponseEntity<?> loginWith2FA(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String correo = request.get("correo");
            String contraseña = request.get("contraseña");
            String codigo = request.get("codigo");
            
            // Validar campos requeridos
            if (correo == null || correo.trim().isEmpty() ||
                contraseña == null || contraseña.trim().isEmpty() ||
                codigo == null || codigo.trim().isEmpty()) {
                
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Correo, contraseña y código son obligatorios"));
            }
            
            // Verificar usuario y contraseña
            Optional<User> usuarioOpt = userRepository.findByCorreo(correo);
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Usuario no encontrado"));
            }
            
            User usuario = usuarioOpt.get();
            if (!passwordEncoder.matches(contraseña, usuario.getContraseña())) {
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Contraseña incorrecta"));
            }
            
            // Verificar código 2FA
            if (!twoFactorAuthService.verifyCode(correo, codigo)) {
                return ResponseEntity.badRequest().body(new JwtResponse(null, null, null, null, "Código de verificación inválido o expirado"));
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
            
            return ResponseEntity.ok(new JwtResponse(token, expirationTime, usuario.getNombre(), usuario.getCorreo(), "Login con 2FA exitoso"));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new JwtResponse(null, null, null, null, "Error al hacer login con 2FA: " + e.getMessage()));
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
