FROM node:16
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --omit=dev
COPY . .
# Configure healthcheck
HEALTHCHECK --interval=2s --timeout=5s --start-period=1s --retries=15 CMD node listening.js
ENTRYPOINT ["npm", "start"]