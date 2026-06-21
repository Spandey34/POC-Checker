FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package management files
COPY package*.json ./

# 1. Copy your prisma folder containing schema.prisma
COPY prisma ./prisma/

# Install dependencies
RUN npm install --production

# 2. Generate the Prisma Client
RUN npx prisma generate

# Copy the rest of your application code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]