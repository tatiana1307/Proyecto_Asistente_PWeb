package com.ejemplo.chatgptwebhook.repository;

import com.ejemplo.chatgptwebhook.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    // Buscar código válido por correo y código
    @Query("SELECT v FROM VerificationCode v WHERE v.correo = :correo AND v.codigo = :codigo AND v.usado = false AND v.fechaExpiracion > :ahora")
    Optional<VerificationCode> findValidCode(@Param("correo") String correo, @Param("codigo") String codigo, @Param("ahora") LocalDateTime ahora);
    
    // Buscar códigos no usados por correo
    @Query("SELECT v FROM VerificationCode v WHERE v.correo = :correo AND v.usado = false AND v.fechaExpiracion > :ahora")
    List<VerificationCode> findActiveCodesByEmail(@Param("correo") String correo, @Param("ahora") LocalDateTime ahora);
    
    // Buscar códigos no usados por teléfono
    @Query("SELECT v FROM VerificationCode v WHERE v.telefono = :telefono AND v.usado = false AND v.fechaExpiracion > :ahora")
    List<VerificationCode> findActiveCodesByPhone(@Param("telefono") String telefono, @Param("ahora") LocalDateTime ahora);
    
    // Limpiar códigos expirados
    @Query("DELETE FROM VerificationCode v WHERE v.fechaExpiracion < :ahora")
    void deleteExpiredCodes(@Param("ahora") LocalDateTime ahora);
}
