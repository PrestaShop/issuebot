FROM node:10.7

RUN mkdir -p /app
EXPOSE 3000

COPY . /app
WORKDIR /app
RUN npm install

ENV HOST 0.0.0.0

CMD [ "npm", "start" ]
