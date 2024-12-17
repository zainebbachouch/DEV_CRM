# Étape 1: Utiliser l'image Node.js officielle
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port de ton backend (ex: 5000)
EXPOSE 4000

# Démarrer le serveur
CMD ["node", "index.js"]
