CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

CREATE TABLE IF NOT EXISTS categorie (
    idcategorie INT AUTO_INCREMENT PRIMARY KEY,
    nom_categorie VARCHAR(255) NOT NULL,
    description TEXT
);
