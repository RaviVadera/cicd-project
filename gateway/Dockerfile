FROM node:16
RUN curl -fsSL https://get.docker.com -o get-docker.sh
RUN sh get-docker.sh
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --omit=dev
COPY . .
# Configure wait-for-it.sh for healthcheck
RUN chmod +x ./wait-for-it.sh
EXPOSE 3000
HEALTHCHECK --interval=2s --timeout=5s --start-period=1s --retries=15 CMD ./wait-for-it.sh -h localhost -p 3000 -t 0
ENTRYPOINT ["node", "."]