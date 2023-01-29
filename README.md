# cicd-project

docker pull gitlab/gitlab-ce:15.7.0-ce.0
docker pull gitlab/gitlab-runner:v15.7.1

## Setup Gitlab and Runner
1. Create necessary directories for volume mapping
```bash
mkdir gitlab-data
export GITLAB_HOME=~/gitlab-data
mkdir gitlab-runner
export GITLAB_RUNNER_HOME=~/gitlab-runner
```

2. Start Gitlab Container
    - To avoid conflicts with existing port mappings use 8XXX series ports
```bash
docker run -d -p 8000:80 -p 8443:443 -p 8022:22 --hostname <host_name> --name gitlab --restart always --volume $GITLAB_HOME/config:/etc/gitlab --volume $GITLAB_HOME/logs:/var/log/gitlab --volume $GITLAB_HOME/data:/var/opt/gitlab --shm-size 256m gitlab/gitlab-ce:15.7.0-ce.0
```
Use docker ps to check the status until it reports health check -> healthy

3. Start Gitlab Runner Container
```bash
docker run -d --name gitlab-runner --restart always --volume $GITLAB_RUNNER_HOME/config:/etc/gitlab-runner --volume /var/run/docker.sock:/var/run/docker.sock gitlab/gitlab-runner:v15.7.1
```

4. Navigate to localhost:8080 in browser
5. Register as a new user
    - The user needs approval from admin before logging-in
6. Retrieve password for admin
```bash
docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```

7. Login with username ```root``` and retrieved password from above step
8. Go to Admin from Menu
9. Navigate to Users -> Pending Approvals tab -> Click on Approve for the registered user
10. Logout as Admin
11. Login with registered user
12. Create a new project
13. Go to Settings -> CI / CD -> Scroll to Runners -> Click on Expand
14. Register the Runner
    - Use the registration token from above step
    - Use the hostname you used in url option
    - Use 172.17.0.1 if you used localhost as hostname
    - IMPORTANT: There is a security issue when using if-not-present pull policy, if some malicious image has been tagged with the required image, nd things can happen. However, considering the implementation for couse project, setting up the registry mirror is an overkill. [Reference](https://about.gitlab.com/blog/2020/10/30/mitigating-the-impact-of-docker-hub-pull-requests-limits/)
```bash
docker exec -it gitlab-runner gitlab-runner register --non-interactive --executor "docker" --docker-image ubuntu:20.04 --docker-volumes /var/run/docker.sock:/var/run/docker.sock --docker-pull-policy if-not-present --url "http://<host_name>:8000/" --clone-url "http://<host_name>:8000/" --registration-token <registration_token> --description "self-hosted-runner" --tag-list "docker,self-hosted" --run-untagged="true" --locked="false" --access-level="not_protected"
```
15. Verify runner is registered
    - Go to Settings -> CI / CD -> Scroll to Runners -> Click on Expand
    - The runner should show up

## Setup SonarQube
1. Start SonarQube Container
```
docker run -d --name sonarqube --restart always -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
```
2. Login with default credentials at http://localhost:9000
 - Username: admin
 - Password: admin
3. Change the password for account and relogin
4. Create a new project
 - Setup manually
 - give a name for the project
 - main branch should be set as ```project```
5. Setup Analysis with GitLab CI
 - Follow the steps provided from SonarQube admin
 - Update the ```sonar-project.properties``` file with your configuration
6. On next, push the static analysis should report errors in pipeline and also on the SonarQube dashboard

## Create Pipeline

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