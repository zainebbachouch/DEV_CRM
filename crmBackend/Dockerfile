# Étape 1: Utiliser Node.js version 18
FROM node:18

# Étape 2: Définir le répertoire de travail
WORKDIR /app

# Étape 3: Installer les dépendances
COPY package*.json ./
RUN npm install

# Étape 4: Copier le reste des fichiers
COPY . .

# Étape 5: Exposer le port 5000
EXPOSE 5000

# Étape 6: Lancer le serveur
CMD ["node", "index.js"]
