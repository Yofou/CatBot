FROM gradle:7-jdk18 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon

FROM amazoncorretto:18
RUN mkdir /app
COPY --from=build /home/gradle/src /app
ENTRYPOINT ["java","-jar","/app/build/libs/Catbot-6.0-all.jar"]
