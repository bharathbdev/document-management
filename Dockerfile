FROM node:22.14.0

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install --omit=dev

# Copy the rest of your app
COPY . .

# Expose app port
EXPOSE 3000

# Run app
CMD ["npm", "run", "start"]
