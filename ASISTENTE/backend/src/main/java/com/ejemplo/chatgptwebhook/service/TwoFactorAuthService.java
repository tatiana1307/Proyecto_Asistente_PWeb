package com.ejemplo.chatgptwebhook.service;

import com.ejemplo.chatgptwebhook.model.VerificationCode;
import com.ejemplo.chatgptwebhook.repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class TwoFactorAuthService {
    
    @Autowired
    private VerificationCodeRepository verificationCodeRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Genera y envía código de verificación
     */
    public boolean sendVerificationCode(String correo, String telefono, String tipo) {
        try {
            // Limpiar códigos expirados
            verificationCodeRepository.deleteExpiredCodes(LocalDateTime.now());
            
            // Invalidar códigos anteriores del usuario
            List<VerificationCode> codigosActivos = verificationCodeRepository.findActiveCodesByEmail(correo, LocalDateTime.now());
            for (VerificationCode codigo : codigosActivos) {
                codigo.setUsado(true);
                verificationCodeRepository.save(codigo);
            }
            
            // Generar código de 6 dígitos
            String codigo = generateVerificationCode();
            
            // Guardar código en base de datos
            VerificationCode verificationCode = new VerificationCode(correo, telefono, codigo, tipo);
            verificationCodeRepository.save(verificationCode);
            
            // Enviar notificación según el tipo
            boolean enviado = false;
            switch (tipo.toUpperCase()) {
                case "SMS":
                    enviado = notificationService.sendSMS(telefono, codigo);
                    break;
                case "EMAIL":
                    enviado = notificationService.sendEmail(correo, codigo);
                    break;
                case "WHATSAPP":
                    enviado = notificationService.sendWhatsApp(telefono, codigo);
                    break;
                default:
                    System.err.println("❌ Tipo de notificación no válido: " + tipo);
                    return false;
            }
            
            if (enviado) {
                System.out.println("✅ Código de verificación enviado por " + tipo + " a " + correo);
                return true;
            } else {
                System.err.println("❌ Error enviando código por " + tipo);
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error en sendVerificationCode: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Verifica el código ingresado por el usuario
     */
    public boolean verifyCode(String correo, String codigo) {
        try {
            Optional<VerificationCode> verificationCode = verificationCodeRepository.findValidCode(
                correo, codigo, LocalDateTime.now()
            );
            
            if (verificationCode.isPresent()) {
                // Marcar código como usado
                VerificationCode code = verificationCode.get();
                code.setUsado(true);
                verificationCodeRepository.save(code);
                
                System.out.println("✅ Código verificado correctamente para " + correo);
                return true;
            } else {
                System.out.println("❌ Código inválido o expirado para " + correo);
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error en verifyCode: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Genera código de verificación de 6 dígitos
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000); // 100000 a 999999
        return String.valueOf(codigo);
    }
    
    /**
     * Verifica si el usuario tiene códigos activos
     */
    public boolean hasActiveCodes(String correo) {
        List<VerificationCode> codigosActivos = verificationCodeRepository.findActiveCodesByEmail(correo, LocalDateTime.now());
        return !codigosActivos.isEmpty();
    }
}
