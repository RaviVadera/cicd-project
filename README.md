# cicd-ex7-message-queue

## Information about host
Linux 2d82d88fccd6 5.10.102.1-microsoft-standard-WSL2 #1 SMP Wed Mar 2 00:30:59 UTC 2022 x86_64 GNU/Linux  
Docker version 20.10.21+azure-1, build baeda1f82a10204ec5708d5fbba130ad76cfee49  
docker-compose version 1.29.2, build 5becea4c

## Perceived benefits of topic-based communication compared to request-response (HTTP)
1. Low latency
2. Low traffice overhead
3. No restrictions on payload or its formatting
4. Possibilty to broadcast / multicast
5. Options of choosing durable / non-durable delivery
6. Loose coupling of end-user interface

## Main Learnings
### 1. RabbitMQ features and functionalities
Exchanges  
Queues  
Topic and Routing  
Durability

### 2. Learnigns related to docker and docker compose
Volumes  
Dependencies  
Healthchecks  
Overriding behaviour of base image

### A note on exposed ports
The rabbitmq image has built-in exposed ports. It only includes the EXPOSE directive int their Dockerfile which may
or may not be exposed based on certain conditions. Creating a fork out of their image and building it without
EXPOSE directives may be out of scope of the exercise.