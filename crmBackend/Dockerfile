FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the backend's port (e.g., 4000)
EXPOSE 4000

# Use npm start to run the app
CMD ["npm", "start"]
