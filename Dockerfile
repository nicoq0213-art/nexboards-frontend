FROM node:18

WORKDIR /app

COPY . .

RUN npm install && npm run build

EXPOSE $PORT

CMD ["sh", "-c", "npx serve -s build -l ${PORT:-3000}"]
