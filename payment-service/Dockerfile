# ─────────────────────────────────────────────────────────────
# 임시 우회 버전 (Maven 중앙 저장소 429 Too Many Requests 대응)
#
# 컨테이너 안에서 gradle 빌드를 하면 매번 라이브러리를 새로 받는데,
# 강의실에서 여러 명이 동시에 빌드하면 Maven이 429로 차단한다.
# 그래서 JAR은 로컬에서 만들고 여기서는 복사만 한다.
#
# 사용법 — 코드를 고칠 때마다 도커 빌드 전에 반드시 아래를 먼저 실행:
#   cd payment-service && sh gradlew bootJar -x test
#   docker compose build payment-service
#
# 네트워크가 정상으로 돌아오면 맨 아래 원본 내용으로 되돌리면 된다.
# ─────────────────────────────────────────────────────────────

# FROM eclipse-temurin:21-jre-alpine
# WORKDIR /app
#COPY build/libs/*.jar app.jar
#ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]

