FROM node:18.20-alpine

USER node
WORKDIR /app
COPY --chown=node:node . .
RUN npm install

EXPOSE 3000
CMD ["npm", "run", "start"]