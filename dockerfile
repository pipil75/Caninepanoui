FROM node:18
RUN npm install -g pnpm 
WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 3000
CMD [ "pnpm", "run", "dev"]