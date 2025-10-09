package com.ejemplo.chatgptwebhook.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Controller
public class WebController {

    /**
     * Sirve el archivo index.html principal
     */
    @GetMapping("/")
    public ResponseEntity<String> index() {
        try {
            Resource resource = new ClassPathResource("static/index.html");
            String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Sirve archivos estáticos (CSS, JS, imágenes)
     */
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> staticFiles(@PathVariable String filename) {
        try {
            String resourcePath = "static/" + filename;
            Resource resource = new ClassPathResource(resourcePath);
            
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] content = resource.getInputStream().readAllBytes();
            String contentType = getContentType(filename);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(content);
                    
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Determina el tipo de contenido basado en la extensión del archivo
     */
    private String getContentType(String filename) {
        if (filename.endsWith(".css")) {
            return "text/css";
        } else if (filename.endsWith(".js")) {
            return "application/javascript";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".svg")) {
            return "image/svg+xml";
        } else if (filename.endsWith(".html")) {
            return "text/html";
        } else {
            return "application/octet-stream";
        }
    }
}
