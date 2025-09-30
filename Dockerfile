# Step 1: Base image
FROM node:18-alpine

# Step 2: Set working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json dan lock file dulu
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy seluruh source code
COPY . .

# Step 6: Generate Prisma Client
RUN npx prisma generate

# Step 7: Build NestJS
RUN npm run build

# Step 8: Start app
CMD ["npm", "run", "start:prod"]
