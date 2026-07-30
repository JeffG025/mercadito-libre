# Compila el JAR dentro de la imagen para no depender del Maven ni del JDK local
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
# Escucha solo dentro de la red de Docker; nginx es el unico que lo alcanza
ENV SERVER_ADDRESS=0.0.0.0
EXPOSE 8085
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "/app/app.jar"]
