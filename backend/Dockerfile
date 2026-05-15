# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw.cmd mvnw.cmd
# Download deps first (cache layer)
RUN apk add --no-cache bash && chmod +x mvnw.cmd || true
COPY src src
RUN apk add --no-cache maven && mvn package -DskipTests --no-transfer-progress -q

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S guardia && adduser -S guardia -G guardia
COPY --from=builder /app/target/guardia-ai-backend-1.0.0.jar app.jar
USER guardia
EXPOSE 8080
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
