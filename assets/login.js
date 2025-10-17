/*********************************************************************************
 * Ce fichier contient toutes les fonctions nécessaires au fonctionnement de la page de connexion "login".
 * Le chargement du DOM à été fait avec "defer" dans la balise du lien dans le head.
 * Ce code va permettre :
*   - de gérer la soumission du formulaire de connexion
*   - empêcher le rechargement de la page
*   - envoyer une requête POST à l'API avec les identifiants
*   - stocker le jeton d'authentification (authToken) en cas de succès 
*   - rediriger la page d'accueil (index.html)
*   - afficher un message d'erreur en cas d'echec de la connexion
/********************************************************************************/

// URL de base de l'API.
const API_BASE_URL = "http://localhost:5678/api";

/* PREMIERE ETAPE : Utilisation de Fetch pour la récupération des données du back-end. */





