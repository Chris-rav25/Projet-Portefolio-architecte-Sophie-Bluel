/*********************************************************************************
 * Ce fichier contient toutes les fonctions nécessaires au fonctionnement du site
 * Le chargement du DOM à été fait avec "defer" dans la balise du lien dans le head
/********************************************************************************/


/* PREMIERE ÉTAPE : Utilisation de Fetch pour la récupération des données du back-end. */

let allWorks = []; // Variable globale pour stocker tous les travaux
let categories = []; // Variable globale pour stocker les catégories

// Fonction pour récupérer les travaux depuis le backend
async function fetchWorks() { /* Création d'une fonction asynchrone pour récupérer les travaux et pouvoir utiliser "await" */

  const response = await fetch("http://localhost:5678/api/works"); /* Envoie une requête au serveur pour récupérer les projets */
  const data = await response.json(); /* Attend la réponse et la convertit en JSON */
  return data; /* Retourne les données récupérées pour les utiliser ailleurs dans le code */
};


//* DEUXIEME ÉTAPE : Création du contenu dynamique du site (photos de la biblioteque de l'architecte)

async function displayGallery(works) { // Création d'une fonction asynchrone pour afficher la galerie, utilise "await" pour attendre les données de l’API

  const gallery = document.querySelector(".gallery"); // Cible l’endroit où afficher mes images dans le HTML
  gallery.innerHTML = ""; // Vide la galerie pour repartir à zéro                                        

  try {
    for (const work of works) { // Pour chaque travail dans les données récupérées, création d'une figure
      let figure = document.createElement("figure"); // Conteneur pour l’image

      // Utilisation de "innerHTML" pour insérer du HTML à l’intérieur de la balise <figure>                     A REVOIR
      figure.innerHTML = ` 
        <img src="${work.imageUrl}" alt="${work.title}"> 
        <figcaption>${work.title}</figcaption>
      `; // insère une image dont l’adresse vient de l’API (work.imageUrl) et une légende (work.title)
      gallery.appendChild(figure); // Ajoute chaque figure à la galerie
    }
  } catch (error) { //* Si ça ne fonctionne pas, affiche une erreur dans la console
    console.error("Erreur lors du chargement :", error);
  }
}


//* TROISIEME ÉTAPE : Affichage dynamique des travaux dans la galerie

// Récupération des catégories depuis le backend
async function fetchCategories() {
  const response = await fetch("http://localhost:5678/api/categories"); // Envoie une requête au serveur pour récupération  
  const categories = await response.json(); // Attend la réponse et convertit en JSON
  return categories; // Retourne les catégories récupérées pour les utiliser ailleurs dans le code
}

async function createFilterButtons(listeCategories) { // Fonction pour créer les boutons de filtre
  // Sélection de l’emplacement où insérer les boutons
  const filtersDiv = document.querySelector(".filters"); // Cible la section des boutons de filtre dans le HTML
  filtersDiv.innerHTML = ""; // Nettoyage de la section des filtres pour éviter les doublons

  // Ajout du bouton "Tous"
  const buttonAll = document.createElement("button");
  buttonAll.textContent = "Tous"; // Texte du bouton "Tous"
  buttonAll.id = 0; // ID spécial pour le bouton "Tous" pour afficher tous les travaux
  filtersDiv.appendChild(buttonAll); // Positionnement au début de la section des filtres

  // Boucle sur chaque bouton reçu pour les créer dynamiquement
  listeCategories.forEach(category => {
    const button = document.createElement("button"); // Créer un élément bouton.
    button.textContent = category.name; // Ajout du nom de la catégorie comme texte du bouton
    button.id = category.id; // Ajout de l'ID de la catégorie comme ID du bouton
    filtersDiv.appendChild(button); // Ajout du bouton à la section des filtres
  });

  // Ecouteurs de clics pour les filtres
  document.querySelectorAll(".filters button").forEach(button => {
    button.addEventListener("click", () => {
      // Récupération de l'ID du bouton cliqué.(Convertir en nombre si l'ID est une chaine)
      const categoryID = Number(button.id)
      let filteredWorks = allWorks; // commencer avec la liste complète
      //Application du filtre (sauf pour le bouton "Tous")
      if (categoryID !== 0) {
        filteredWorks = allWorks.filter(work => { // Garde le travail si l'ID catégorie correspond au bouton cliqué
          return work.categoryId === categoryID; // Filtrer les travaux par catégorie
        });
      }
      displayGallery(filteredWorks); // Affiche la galerie avec les travaux filtrés
    });
  });
}


//* QUATRIEME ÉTAPE : Affichage UI avec admin connecté

// Fonction pour vérifier si l'utilisateur est connecté (mode admin), met à jour l'interface utilisateur
function checkAndUpdateAdminMode() {
  const token = sessionStorage.getItem("authToken"); // Vérifier l'état du jeton
  const loginLink = document.getElementById("nav-login-logout"); // Ciblage de l'élément login à modifier
  const adminBanner = document.getElementById("admin-banner");
  const filtersButton = document.querySelector(".filters");
  const editBtnAdminProjets = document.getElementById("btn-projets-admin")

  if (token) {
    loginLink.innerHTML = 'logout'; // Change le "login" en "logout"
    loginLink.href = "#"; // Annule le lien vers login.html
    loginLink.addEventListener("click", (event) => {
      event.preventDefault();
      sessionStorage.removeItem("authToken");
      window.location.href = "index.html";
    });

    if (adminBanner) {
      adminBanner.style.display = "flex";
    }
    if (filtersButton) {
      filtersButton.style.display = "none"
    }
    if (editBtnAdminProjets) {
      editBtnAdminProjets.style.display = "flex"
    }

  } else { // Force que le lien est bien login dans le cas contraire
    loginLink.innerHTML = "login";
    loginLink.href = "login.html";

    if (adminBanner) {
      adminBanner.style.display = "none"
    }
    if (filtersButton) {
      filtersButton.style.display = "flex"
    }
    if (editBtnAdminProjets) {
      editBtnAdminProjets.style.display = "none"
    }
  }
}


// CINQUIEME ÉTAPE : Fonctionnement des modales
// Le but principal de ce code est de contrôler l'état de la modale (ouverte/fermée) et de gérer l'interface (basculement entre les deux vues)

let modal = null
// Empêche le clic dans le contenu blanc de fermer la Modale 
const stopPropagation = function (e) {
  e.stopPropagation()
}

// Fermeture de la modale
const closeModal = function(e) {
  if (e && e.target !== modal && !e.target.closest('.js-modal-close')) { // Si le clic est sur le contenu ou le fond et non sur la croix, on l'ignore
  return;
}

if (modal === null) return // Si la modale est null, on ne fait rien

e.preventDefault()
//Retrait des écouteurs afin d'éviter les fuites de mémoires
modal.removeEventListener('click', closeModal)
modal.querySelector('.js-modal-close').removeEventListener('click', closeModal)
modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)

// Masquer la modale et la rendre inaccessible
modal.style.display = 'none'
modal.setAttribute('aria-hidden', 'true')
modal.removeAttribute('aria-modal')
modal = null
}

//Ouverture de la modale
const openModal = function (e) {
  e.preventDefault()
  modal = document.getElementById('modal1')

  if (modal) {
    modal.style.display = 'flex' // Rend la modal visible
    modal.setAttribute('aria-hidden', 'false')
    modal.setAttribute('aria-modal', 'true') //                                               A REVOIR

    // Cibler TOUS les boutons de fermeture
    const closeButtons = modal.querySelectorAll('.js-modal-close');

    closeButtons.forEach(button => {
      button.addEventListener('click', closeModal);
    })

    // Ajout des écouteurs pour la fermeture
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal)
    modal.addEventListener('click', closeModal) // Fermeture par clic sur le fond gris
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)

    // Forcer l'affichage sur la vue galerie au démarrage
    switchToGalleryView();
  }
}

// Changement de la vue "galerie" vers la vue "Ajout de photo"
const switchToAddPhotoView = function () {
  document.querySelector('.modal-gallery-view').style.display = 'none';
  document.querySelector('.modal-add-view').style.display = 'block';
}

// Changement de la vue "Ajout de vue photo" ver la vue "gallerie"
const switchToGalleryView = function () {
  document.querySelector('.modal-add-view').style.display = 'none';
  document.querySelector('.modal-gallery-view').style.display = "block"


  // Nettoyage du formulaire lors du retour
  document.getElementById('add-work-form').reset();
}

// Initialisation des écouteurs d'évennements
// Charger le DOM avant d'attacher les écouteurs
document.addEventListener('DOMContentLoaded', () => {

  // Liaison du bouton "Modifier" du portfolio à l'ouverture de la Modale
  const editBtn = document.getElementById('btn-projets-admin');
  if (editBtn) {
    editBtn.addEventListener('click', openModal);
  }

  //Liaison des boutons de changement des vues des modales
  const addPhotoBtn = document.getElementById('add-photo-btn')
  const returnBtn = document.querySelector('.js-modal-return');

  if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', switchToAddPhotoView);
  }
  if (returnBtn) {
    returnBtn.addEventListener('click', switchToGalleryView);
  }
});


// SIXIEME ÉTAPE : Affichage des travaux de la gallerie dans la premiere modale



// Fonction init asynchrone (déclaration) pour lancer l'affichage de la galerie et modifier la page d'accueil une fois l'admin connecté
async function init() {
  allWorks = await fetchWorks(); // Récupère les travaux en attendant la réponse de l'API
  displayGallery(allWorks); // Affiche la galerie avec les travaux récupérés
  categories = await fetchCategories(); // Récupère les catégories en attendant la réponse de l'API
  createFilterButtons(categories); // Crée les boutons de filtre avec les catégories récupérées
  checkAndUpdateAdminMode(); // (Appel) Fonction pour l'affichage de UI admin
}

init(); // (Appel) Fonction d'initialisation pour démarrer le processus
