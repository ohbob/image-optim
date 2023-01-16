FROM node:16.9
COPY . /app
WORKDIR /app
# RUN npm start
CMD ["node", "optimize.js"]