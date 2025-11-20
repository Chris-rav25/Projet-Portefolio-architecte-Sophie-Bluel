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

      // Ajout de la classe et du data-id pour permettre la suppression
      figure.classList.add('gallery-item');
      figure.setAttribute('data-id', work.id);

      // Creation de l'image
      let img = document.createElement("img")
      img.src = work.imageUrl; // Défini l'URL de la source
      img.alt = work.title; // Défini le texte

      // Création de la légende "figcaption" (élément HTML de légende d'une figure) A REVOIR
      let figcaption = document.createElement("figcaption")
      // Utilisation de text.content
      figcaption.textContent = work.title;

      // Assemblage des éléments
      figure.appendChild(img)
      figure.appendChild(figcaption)

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
const closeModal = function (e) {
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

    // Affichage de la galerie de la modale avec les travaux complets
    displayModalGallery(allWorks);

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
  setupImagePreview(); // Ajout de l'appel pour la prévisualisation          A REVOIR

  // Liaison du formulaire d'ajout à la fonction de soumission (fetch POST)
  const addWorkForm = document.getElementById('add-work-form');
  if (addWorkForm) {
    addWorkForm.addEventListener('submit', handleFormSubmission);
  }
});


/** SIXIEME ÉTAPE : Affichage et suppression des travaux de la gallerie dans la premiere modale
 * 
 * Partie 1
 * Affiche la galerie des travaux dans la première vue de la modale et attache les écouteurs de suppression
 * @param {Array<Object>} works - Tableau des travaux (projets) à afficher
 */
// Cette fonction s'occupe de créer toutes les miniatures et d'y attacher l'écouteur de clic pour la suppression
const displayModalGallery = function (works) {

  const modalGalleryContainer = document.querySelector('.modal-gallery');
  modalGalleryContainer.innerHTML = '';

  works.forEach(work => {
    // Création de la figure/miniature
    const figure = document.createElement('figure');
    figure.classList.add('gallery-modal-item');
    figure.setAttribute('data-id', work.id);

    // Création de l'image
    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;

    // Création du bouton de suppression/icone corbeille
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-work-btn');
    deleteBtn.setAttribute('data-id', work.id);
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    // Assemblage
    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGalleryContainer.appendChild(figure);

    // Attacher l'écouteur de suppression
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Récuperer l'ID et appeler la fonction de suppression principale
      const idToDelete = parseInt(e.currentTarget.dataset.id);
      deleteWork(idToDelete);
    });
  });
}


/** Partie 2
 * 
 * Retire les éléments DOM du travail supprimé de l'interface (galeries principale et modale)
 * @param {number} workId - ID du travail à retirer
 */
// Ces deux fonctions (Partie 2/3) gèrent la communication avec l'API et la mise à jour immédiate du DOM

function removeWorkFromDOM(workId) {
  // Retirer l'image de la galerie principale
  const mainWorkElement = document.querySelector(`.gallery-item[data-id="${workId}"]`);
  if (mainWorkElement) {
    mainWorkElement.remove();
  }
  // Retirer de la galerie de la modale
  const modalWorkElement = document.querySelector(`.gallery-modal-item[data-id="${workId}"]`);
  if (modalWorkElement) {
    modalWorkElement.remove();
  }
  // Mettre à jour le tableau allWorks en mémoire
  allWorks = allWorks.filter(work => work.id !== workId);
}


/** Partie 3
 * 
 * Gère la requête de suppression d'un travail via l'API
 * @param {number} workId - ID du travail à supprimer
 */
async function deleteWork(workId) {
  const token = sessionStorage.getItem('authToken');
  // Vérification du Token (Essentielle pour la requête)
  if (!token) { // Retour si le token est manquant
    return;
  }
  // Construction et envoi de la requête DELETE
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Traitement de la réponse
    if (response.ok) { // Code 200 OK
      removeWorkFromDOM(workId); // Retire l'élément du DOM sans recharger la page
    } else {
      return;
    }

  } catch (error) {
    return;
  }
}


// Ajout des travaux dans la deuxième modale

// Logique de Prévisualisation de l'Image
const setupImagePreview = function () {
  const fileInput = document.getElementById('image-input');
  const imagePreview = document.getElementById('image-preview');
  const uploadAreaElements = document.querySelectorAll('.image-upload-area > :not(#image-preview)');    // A REVOIR

  fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const allowedTypes = ['image/jpeg', 'image/png'];
      let errorMessage = '';

      // Vérification du type de fichier (JPG ou PNG)
      if (!allowedTypes.includes(file.type)) {
        errorMessage = "Format de fichier non supporté. Les types acceptés sont JPG et PNG.";
      }
      // Vérification de la taille (4 Mo max)
      else if (file.size > 4 * 1024 * 1024) {
        errorMessage = "La taille du fichier ne doit pas dépasser 4 Mo.";
      }
      // Si une erreur est trouvée, afficher l'alerte et arrêter
      if (errorMessage) {
        alert(errorMessage);
        this.value = ''; // Réinitialiser le champ (pour permettre de rechoisir le même fichier)

        // S'assurer que la prévisualisation n'est pas affichée
        imagePreview.style.display = 'none';
        uploadAreaElements.forEach(el => el.style.display = 'flex'); // Rétablir les éléments masqués

        checkFormValidation(); // Mettre à jour la validation (désactiver le bouton)                       // A REVOIR
        return;
      }
      // Si tout est OK, procéder à la lecture du fichier
      const reader = new FileReader();
      reader.onload = function (e) {
        // Masquer les éléments de l'aire de téléchargement (icône, bouton, texte)
        uploadAreaElements.forEach(el => el.style.display = 'none');
        // Afficher l'image
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        // Mettre à jour l'état de validation du formulaire
        checkFormValidation();
      };
      reader.readAsDataURL(file);
    }
  });
};

/** Récupération et Affichage des Catégories
 * Remplit le champ <select> des catégories dans le formulaire d'ajout de photo.
 * @param {Array<Object>} categories - Tableau des catégories récupérées de l'API.
 */

const fillCategorySelect = function (categories) {
  const select = document.getElementById('photo-category');
  select.innerHTML = ''; // Nettoyage

  // Ajouter l'option par défaut (vide ou non sélectionnable)
  const defaultOption = document.createElement('option');            // A REVOIR 
  defaultOption.value = '';
  defaultOption.textContent = ''; // Laisse le champ vide par défaut
  select.appendChild(defaultOption);

  // Ajouter chaque catégorie
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id; // L'ID = valeur envoyée à l'API
    option.textContent = category.name;
    select.appendChild(option);
  });

  // Écouteur pour déclencher la validation lors du choix d'une catégorie
  select.addEventListener('change', checkFormValidation);
};

// Validation du formulaire d'ajout
// Cette fonction vérifie que le fichier, le titre et la catégorie sont tous valides pour activer le bouton "Valider"

const checkFormValidation = function () {
  const fileInput = document.getElementById('image-input');
  const titleInput = document.getElementById('photo-title');
  const categorySelect = document.getElementById('photo-category');
  const submitBtn = document.querySelector('.modal-validate-btn');

  // Vérifie si un fichier est sélectionné, le titre n'est pas vide et qu'une catégorie est bien selectionnée
  if (fileInput.files[0] && titleInput.value.trim() !== '' && categorySelect.value !== '') {                  // A REVOIR
    submitBtn.removeAttribute('disabled');
    submitBtn.style.backgroundColor = '#1D6154'; // Couleur verte (actif)
  } else {
    submitBtn.setAttribute('disabled', 'true');
    submitBtn.style.backgroundColor = '#A7A7A7'; // Couleur grise (désactivé)
  }
};


/** Création de la Fonction de Mise à Jour Dynamique
 * Ajoute un nouveau travail (newWork) au DOM (galerie principale et modale)
 * sans recharger la page, et met à jour le tableau en mémoire.
 * @param {Object} newWork - L'objet travail retourné par l'API (avec id, imageUrl, title, categoryId).
 */

function updateGalleryAfterAdd(newWork) {
  // 1 - Mise à jour du tableau global en mémoire (nécessaire pour les filtres et futures modales)
  allWorks.push(newWork);


  const gallery = document.querySelector(".gallery"); // Mise à jour de la gallerie principale

  let figure = document.createElement("figure");
  figure.classList.add('gallery-item');
  figure.setAttribute('data-id', newWork.id);

  let img = document.createElement("img");
  img.src = newWork.imageUrl;
  img.alt = newWork.title;

  let figcaption = document.createElement("figcaption")
  figcaption.textContent = newWork.title;

  figure.appendChild(img);
  figure.appendChild(figcaption);
  gallery.appendChild(figure); // Ajout dans le DOM principal

  // 2 - Mise à jour de la galerie de la Modale
  const modalGalleryContainer = document.querySelector('.modal-gallery')

  const figureModal = document.createElement('figure');
  figureModal.classList.add('gallery-modal-item');
  figureModal.setAttribute('data-id', newWork.id);

  const imgModal = document.createElement('img');
  imgModal.src = newWork.imageUrl;
  imgModal.alt = newWork.title;

  // Création du bouton de suppression
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-work-btn');
  deleteBtn.setAttribute('data-id', newWork.id);
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

  // Attacher immédiatement l'écouteur de suppression au nouveau bouton
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const idToDelete = parseInt(e.currentTarget.dataset.id);
    deleteWork(idToDelete); // Utilisation de la fonction existante
  });

  figureModal.appendChild(imgModal);
  figureModal.appendChild(deleteBtn);
  modalGalleryContainer.appendChild(figureModal); // Ajout dans le DOM de la modale
}


// Intégration de la Soumission (Fetch POST) du formulaire
// Gère l'envoi des données (FormData) à l'API via fetch en POST et gère le succès/échec de la requête

async function handleFormSubmission(e) {
  e.preventDefault();

  const token = sessionStorage.getItem('authToken');
  const form = document.getElementById('add-work-form');
  const fileInput = document.getElementById('image-input');
  const submitBtn = document.querySelector('.modal-validate-btn');

  // Désactiver le bouton pendant l'envoi
  submitBtn.setAttribute('disabled', 'true');
  submitBtn.textContent = 'Envoi en cours...';

  // Vérification du Token
  if (!token) {
    alert("Erreur: Non autorisé. Veuillez vous reconnecter.");
    submitBtn.removeAttribute('disabled')
    submitBtn.textContent = 'Valider';
    checkFormValidation();                                            // A REVOIR
    return;
  }

  // Création de l'objet FormData      // A REVOIR
  const formData = new FormData();

  formData.append('image', fileInput.files[0]);
  formData.append('title', form['photo-title'].value);
  formData.append('category', form['photo-category'].value);

  // Envoie via Fetch POST
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    // Gestion des réponses de l'API
    if (response.ok) { // Statut 200

      const newWork = await response.json();

      // Affichage dynamique sans rechargement de page
      updateGalleryAfterAdd(newWork);

      // Netoyage après succès
      document.getElementById('add-work-form').reset();
      switchToGalleryView(); // Tester le rechargement de la page (F5) pour vérifier l'affichage
    } else { // Gestion détaillée des erreurs HTTP (400, 401, 500)

      const status = response.status;
      let errorMessage = `Erreur lors de l'ajout (Statut ${status}).`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = `Erreur: ${errorData.message}`;
        }
      } catch (e) { }
      if (status === 400) {
        alert(`Erreur 400 - Requête Invalide: ${errorMessage}`);
      } else if (status === 401) {
        alert(`Erreur 401 - Non Autorisé: Veuillez vous reconnecter.`);
      } else {
        alert(`Erreur ${status} - Serveur: Une erreur inattendue est survenue.`);
      }
    }

  } catch (error) {
    console.error("Erreur de connexion réseau ou du serveur:", error);
    alert("Erreur de connexion. Vérifiez le serveur.");

  } finally { // Rétablissement du bouton valider
    submitBtn.textContent = 'Valider';
    checkFormValidation();
  }
}


// Fonction init asynchrone (déclaration) pour lancer l'affichage de la galerie et modifier la page d'accueil une fois l'admin connecté
async function init() {
  allWorks = await fetchWorks(); // Récupère les travaux en attendant la réponse de l'API
  displayGallery(allWorks); // Affiche la galerie avec les travaux récupérés
  categories = await fetchCategories(); // Récupère les catégories en attendant la réponse de l'API
  createFilterButtons(categories); // Crée les boutons de filtre avec les catégories récupérées
  checkAndUpdateAdminMode(); // (Appel) Fonction pour l'affichage de UI admin
  fillCategorySelect(categories); // Remplit le "select" des catégories de la modale
}

init(); // (Appel) Fonction d'initialisation pour démarrer le processus
