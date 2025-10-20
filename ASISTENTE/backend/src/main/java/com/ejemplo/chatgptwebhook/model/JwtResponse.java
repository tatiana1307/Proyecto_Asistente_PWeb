package com.ejemplo.chatgptwebhook.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JwtResponse {
    
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("token_type")
    private String tokenType = "Bearer";
    
    @JsonProperty("expires_in")
    private Long expiresIn;
    
    private String username;
    private String email;
    private String message;
    
    // Constructores
    public JwtResponse() {}
    
    public JwtResponse(String accessToken, Long expiresIn, String username, String email) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.username = username;
        this.email = email;
    }
    
    public JwtResponse(String accessToken, Long expiresIn, String username, String email, String message) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.username = username;
        this.email = email;
        this.message = message;
    }
    
    // Getters y Setters
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    public Long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
