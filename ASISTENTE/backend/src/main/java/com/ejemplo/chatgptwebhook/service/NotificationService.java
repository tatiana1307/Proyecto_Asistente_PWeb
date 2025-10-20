package com.ejemplo.chatgptwebhook.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    private final JavaMailSender mailSender;
    
    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * Envía código de verificación por SMS (simulado para desarrollo)
     */
    public boolean sendSMS(String telefono, String codigo) {
        try {
            System.out.println("📱 SMS SIMULADO a " + telefono + ": Tu código es " + codigo);
            return true;
        } catch (Exception e) {
            System.err.println("❌ Error enviando SMS: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Envía código de verificación por Email
     */
    public boolean sendEmail(String correo, String codigo) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(correo);
            message.setSubject("Código de Verificación - Asistente Virtual");
            message.setText("Tu código de verificación es: " + codigo + "\n\nVálido por 10 minutos.\n\nAsistente Virtual");
            
            if (fromEmail != null && !fromEmail.isEmpty()) {
                message.setFrom(fromEmail);
            }
            
            mailSender.send(message);
            System.out.println("✅ Email enviado a " + correo);
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Error enviando email: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Envía código de verificación por WhatsApp (simulado para desarrollo)
     */
    public boolean sendWhatsApp(String telefono, String codigo) {
        try {
            System.out.println("💬 WhatsApp SIMULADO a " + telefono + ": Tu código es " + codigo);
            return true;
        } catch (Exception e) {
            System.err.println("❌ Error enviando WhatsApp: " + e.getMessage());
            return false;
        }
    }
}
