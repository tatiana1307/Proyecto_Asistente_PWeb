package com.ejemplo.chatgptwebhook.repository;

import com.ejemplo.chatgptwebhook.model.SesionLogin;
import com.ejemplo.chatgptwebhook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SesionLoginRepository extends JpaRepository<SesionLogin, Long> {
    
    /**
     * Busca sesiones activas de un usuario
     */
    @Query("SELECT s FROM SesionLogin s WHERE s.user = :user AND s.activa = true")
    List<SesionLogin> findActiveSessionsByUser(@Param("user") User user);
    
    /**
     * Busca la última sesión activa de un usuario
     */
    @Query("SELECT s FROM SesionLogin s WHERE s.user = :user AND s.activa = true ORDER BY s.fechaLogin DESC")
    Optional<SesionLogin> findLastActiveSessionByUser(@Param("user") User user);
    
    /**
     * Busca sesiones por rango de fechas
     */
    @Query("SELECT s FROM SesionLogin s WHERE s.fechaLogin BETWEEN :fechaInicio AND :fechaFin")
    List<SesionLogin> findSessionsByDateRange(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                             @Param("fechaFin") LocalDateTime fechaFin);
    
    /**
     * Cuenta sesiones activas
     */
    @Query("SELECT COUNT(s) FROM SesionLogin s WHERE s.activa = true")
    long countActiveSessions();
    
    /**
     * Busca sesiones por IP
     */
    List<SesionLogin> findByIpAddress(String ipAddress);
}