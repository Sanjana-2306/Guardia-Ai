package com.guardiaai;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title = "Guardia-AI API",
        version = "1.0.0",
        description = "Enterprise Fraud Detection & Explainable Security Platform — " +
                      "Real-time transaction monitoring with AI-powered risk analysis.",
        contact = @Contact(name = "Guardia-AI Security Team", email = "security@guardiaai.com"),
        license = @License(name = "MIT", url = "https://opensource.org/licenses/MIT")
    )
)
public class GuardiaAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(GuardiaAiApplication.class, args);
    }
}
