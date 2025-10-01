package com.ejemplo.chatgptwebhook.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones_login")
public class SesionLogin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "fecha_login", nullable = false)
    private LocalDateTime fechaLogin;
    
    @Column(name = "fecha_logout")
    private LocalDateTime fechaLogout;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "activa", nullable = false)
    private Boolean activa = true;
    
    // Constructores
    public SesionLogin() {
        this.fechaLogin = LocalDateTime.now();
    }
    
    public SesionLogin(User user, String ipAddress, String userAgent) {
        this();
        this.user = user;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public LocalDateTime getFechaLogin() {
        return fechaLogin;
    }
    
    public void setFechaLogin(LocalDateTime fechaLogin) {
        this.fechaLogin = fechaLogin;
    }
    
    public LocalDateTime getFechaLogout() {
        return fechaLogout;
    }
    
    public void setFechaLogout(LocalDateTime fechaLogout) {
        this.fechaLogout = fechaLogout;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public Boolean getActiva() {
        return activa;
    }
    
    public void setActiva(Boolean activa) {
        this.activa = activa;
    }
    
    @Override
    public String toString() {
        return "SesionLogin{" +
                "id=" + id +
                ", user=" + (user != null ? user.getCorreo() : "null") +
                ", fechaLogin=" + fechaLogin +
                ", fechaLogout=" + fechaLogout +
                ", ipAddress='" + ipAddress + '\'' +
                ", activa=" + activa +
                '}';
    }
}