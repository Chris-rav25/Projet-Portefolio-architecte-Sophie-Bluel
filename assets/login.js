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

/* PREMIERE ETAPE : Configuration et ciblage */
//Ciblage des éléments du DOM
const loginForm = document.querySelector("#formulaire form"); // Selectionne le formulaire de connexion
const emailInput = document.getElementById("email"); 
const passwordInput = document.getElementById("password");
const errorMessageEl = document.getElementById("login-error-message"); // Mettre cet Id dans le HTML pour afficher les messages d'erreur


/* DEUXIEME ETAPE : Ecouteur d'évenement */

if (loginForm) {
    loginForm.addEventListener("submit", handlelogin); // Ajoute un écouteur d'événement pour la soumission du formulaire
}


/* TROISIEME ETAPE : Fonction de gestion de la connexion asynchrone*/
/**
 * Gère la soumission du formulaire de connexion et la communication avec l'API.
 * @param {Event} e - L'objet événement de soumission.
 */

async function handlelogin(e) {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire
    // Utilisation du nom de variable et gestion de l'affichage
    if (errorMessageEl) { 
        errorMessageEl.textContent = "";
        errorMessageEl.style.display = "none"; // Masque l'élément d'erreur
    }

    // Valeurs des champs de saisie
    const userCredentials = {
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        // Envoie une requête POST à l'API pour la connexion
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userCredentials)
        });

        const data = await response.json(); // Attend la réponse et la convertit en JSON

        if (response.ok) {
            // Utilisation de sessionStorage plutot que localStorage
            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem("userId", data.userId); 
            window.location.href = "index.html"; // Redirige vers la page d'accueil
            
        // Gestion de l'erreur 401 et 404
        } else if (response.status === 401 || response.status === 404) {
            if (errorMessageEl) {
                errorMessageEl.textContent = "Email ou mot de passe incorrect."; 
                // Propriété pour afficher l'élément : style.display = "block"
                errorMessageEl.style.display = "block"; 
            }
            passwordInput.value = ""; // Efface le mot de passe
        }
        
    } catch (error) {
        // Gère les erreurs réseau (API éteinte, etc...)
        console.error("Erreur lors de la connexion au serveur :", error);
    }
}