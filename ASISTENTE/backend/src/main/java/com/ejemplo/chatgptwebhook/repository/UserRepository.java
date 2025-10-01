package com.ejemplo.chatgptwebhook.repository;

import com.ejemplo.chatgptwebhook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Busca un usuario por su correo electrónico
     */
    Optional<User> findByCorreo(String correo);
    
    /**
     * Verifica si existe un usuario con el correo dado
     */
    boolean existsByCorreo(String correo);
    
    /**
     * Busca un usuario por correo y contraseña (para login)
     */
    @Query("SELECT u FROM User u WHERE u.correo = :correo AND u.contraseña = :contraseña AND u.activo = true")
    Optional<User> findByCorreoAndContraseña(@Param("correo") String correo, @Param("contraseña") String contraseña);
    
    /**
     * Busca usuarios activos
     */
    @Query("SELECT u FROM User u WHERE u.activo = true")
    java.util.List<User> findActiveUsers();
}