package com.ejemplo.chatgptwebhook.service;

import com.ejemplo.chatgptwebhook.model.ChatGptRequest;
import com.ejemplo.chatgptwebhook.model.ChatGptResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Servicio para comunicarse con la API de ChatGPT
 */
@Service
public class ChatGptService {

    private static final Logger logger = LoggerFactory.getLogger(ChatGptService.class);
    
    private final WebClient webClient;
    @SuppressWarnings("unused")
    private final String apiKey;

    public ChatGptService(@Value("${openai.api.key}") String apiKey,
                         @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}") String apiUrl) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    /**
     * Envía un mensaje a ChatGPT y obtiene la respuesta
     * 
     * @param mensaje El mensaje del usuario
     * @return La respuesta de ChatGPT
     */
    public Mono<String> enviarMensaje(String mensaje) {
        return enviarMensajeConTokens(mensaje, 2000);
    }
    
    /**
     * Envía un mensaje a ChatGPT y obtiene la respuesta con un límite específico de tokens
     * 
     * @param mensaje El mensaje del usuario
     * @param maxTokens Límite máximo de tokens para la respuesta
     * @return La respuesta de ChatGPT
     */
    public Mono<String> enviarMensajeConTokens(String mensaje, int maxTokens) {
        logger.info("Enviando mensaje a ChatGPT con {} tokens máximo: {}", maxTokens, mensaje);

        // Crear la petición para ChatGPT
        ChatGptRequest request = new ChatGptRequest();
        request.setModel("gpt-3.5-turbo");
        request.setMaxTokens(maxTokens);
        request.setTemperature(0.7);
        
        // Configurar el mensaje
        List<Map<String, String>> messages = List.of(
            Map.of("role", "user", "content", mensaje)
        );
        request.setMessages(messages);

        return webClient.post()
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ChatGptResponse.class)
                .map(response -> {
                    if (response.getChoices() != null && !response.getChoices().isEmpty()) {
                        ChatGptResponse.Message message = response.getChoices().get(0).getMessage();
                        String content = message != null ? message.getContent() : "Sin respuesta";
                        logger.info("Respuesta recibida de ChatGPT ({} tokens solicitados): {} caracteres", maxTokens, content.length());
                        return content;
                    } else {
                        logger.warn("No se recibieron opciones en la respuesta de ChatGPT");
                        return "No pude generar una respuesta. Inténtalo de nuevo.";
                    }
                })
                .onErrorResume(WebClientResponseException.class, ex -> {
                    logger.error("Error al comunicarse con ChatGPT: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                    
                    String errorMessage = ex.getResponseBodyAsString();
                    if (errorMessage.contains("insufficient_quota")) {
                        return Mono.just("❌ **Cuota de OpenAI excedida**\n\n" +
                                       "Tu cuenta de OpenAI ha alcanzado el límite de uso.\n\n" +
                                       "**Para solucionarlo:**\n" +
                                       "• Ve a https://platform.openai.com/account/billing\n" +
                                       "• Agrega créditos a tu cuenta\n" +
                                       "• O espera hasta el próximo período de facturación\n\n" +
                                       "Una vez resuelto, la funcionalidad funcionará correctamente.");
                    } else if (errorMessage.contains("invalid_api_key")) {
                        return Mono.just("❌ **API Key inválida**\n\n" +
                                       "La API key de OpenAI no es válida o ha expirado.\n\n" +
                                       "**Para solucionarlo:**\n" +
                                       "• Ve a https://platform.openai.com/account/api-keys\n" +
                                       "• Crea una nueva API key\n" +
                                       "• Actualiza la configuración del backend");
                    } else {
                        return Mono.just("❌ **Error de conexión con OpenAI**\n\n" +
                                       "No se pudo conectar con la API de OpenAI.\n\n" +
                                       "**Posibles causas:**\n" +
                                       "• Problemas de conectividad\n" +
                                       "• Servicio temporalmente no disponible\n" +
                                       "• Límite de velocidad alcanzado\n\n" +
                                       "Por favor, inténtalo más tarde.");
                    }
                })
                .onErrorResume(Exception.class, ex -> {
                    logger.error("Error inesperado al comunicarse con ChatGPT", ex);
                    return Mono.just("Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
                });
    }
}
