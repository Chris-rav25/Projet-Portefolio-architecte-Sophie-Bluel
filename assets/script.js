/*********************************************************************************
 * Ce fichier contient toutes les fonctions nécessaires au fonctionnement du site.
 * Le chargement du DOM à été fait avec "defer" dans la balise du lien dans le head.
/********************************************************************************/


/* PREMIERE ETAPE : Utilisation de Fetch pour la récupération des données du back-end. */

async function fetchWorks() { /* Création d'une fonction asynchrone pour récupérer les travaux et pouvoir utiliser "await". */

  const response = await fetch("http://localhost:5678/api/works"); /* Envoie une requête au serveur pour récupérer les projets. */
  const data = await response.json(); /* Attend la réponse et la convertit en JSON. */
    return data; /* Retourne les données récupérées pour les utiliser ailleurs dans le code. */
};


// ---------------------------------------------------------------------------------------------------------



//* DEUXIEME ETAPE : Création du contenu dynamique du site (photos de la biblioteque de l'architecte).

async function displayGallery(works) { // Création d'une fonction asynchrone pour afficher la galerie, utilise "await" pour attendre les données de l’API.

  const gallery = document.querySelector(".gallery"); // Cible l’endroit où afficher mes images dans le HTML.

  gallery.innerHTML = ""; // Vide la galerie pour repartir à zéro.                                               A REVOIR

  try {
    for (const work of works) { // Pour chaque travail dans les données récupérées, création d'une figure.

      let figure = document.createElement("figure"); // Conteneur pour l’image.

      // Utilisation de "innerHTML" pour insérer du HTML à l’intérieur de la balise <figure>.                     A REVOIR
      figure.innerHTML = ` 
        <img src="${work.imageUrl}" alt="${work.title}"> 
        <figcaption>${work.title}</figcaption>
      `; // insère une image dont l’adresse vient de l’API (work.imageUrl) et une légende (work.title).

      gallery.appendChild(figure); // Ajoute chaque figure à la galerie. 

    }

  } catch(error) { //* Si ça ne fonctionne pas, affiche une erreur dans la console.
    console.error("Erreur lors du chargement :", error);
  }

}

// ---------------------------------------------------------------------------------------------------------



//* Troisième étape : Affichage dynamique des travaux dans la galerie.

let allWorks = []; // Variable globale pour stocker tous les travaux.

// Récupération des catégories depuis le backend.
async function fetchCategories() {

  const response = await fetch("http://localhost:5678/api/categories"); // Envoie une requête au serveur pour récupération.    
  const categories = await response.json(); // Attend la réponse et convertit en JSON.
  return categories; // Retourne les catégories récupérées pour les utiliser ailleurs dans le code.
}


// Fonction pour créer les boutons de filtre.
async function createFilterButtons(listeCategories) {


  // Sélection de l’emplacement où insérer les boutons.
  const filtersDiv = document.querySelector(".filters"); // Cible la section des boutons de filtre dans le HTML.
  filtersDiv.innerHTML = ""; //  nettoyage de la section des filtres pour éviter les doublons.

  // Ajout du bouton "Tous".
  const buttonAll = document.createElement("button");
  buttonAll.textContent = "Tous"; // Texte du bouton "Tous".
  buttonAll.id = 0; // ID spécial pour le bouton "Tous" pour afficher tous les travaux.
  filtersDiv.appendChild(buttonAll); // Positionnement au début de la section des filtres.

  // Boucle sur chaque bouton reçu pour les créer dynamiquement.
  listeCategories.forEach(category => {

    const button = document.createElement("button"); // Créer un élément bouton.
    button.textContent = category.name; // Ajout du nom de la catégorie comme texte du bouton.
    button.id = category.id; // Ajout de l'ID de la catégorie comme ID du bouton.
    filtersDiv.appendChild(button); // Ajout du bouton à la section des filtres.

  });

  // Ecouteurs de clics pour les filtres
  document.querySelectorAll(".filters button").forEach(button => {

    btn.addEventListener("click", () => {
      // Récupération de l'ID du bouton cliqué.(Convertir en nombre si l'ID est une chaine)
      const categoryID = Number(btn.id)
      let filteredWorks = allWorks; // commencer avec la liste complète
      //Application du filtre (sauf pour le bouton "Tous")
      if (categoryID !== 0) {
        filteredWorks = allWorks.filter(work => { // Garde le travail si l'ID catégorie correspond au bouton cliqué
          return work.categoryId === categoryID; // Filtrer les travaux par catégorie.
        });
      }
      displayGallery(filteredWorks); // Affiche la galerie avec les travaux filtrés.
    });

  });

}

// ---------------------------------------------------------------------------------------------------------


async function init () { // Fonction asynchrone pour lancer l'affichage de la galerie.

  const allWorks = await fetchWorks(); // Récupère les travaux en attendant la réponse de l'API.
    displayGallery(allWorks); // Affiche la galerie avec les travaux récupérés.
  const categories = await fetchCategories(); // Récupère les catégories en attendant la réponse de l'API.
    createFilterButtons(categories); // Crée les boutons de filtre avec les catégories récupérées.

}

init(); // Appelle la fonction d'initialisation pour démarrer le processus.
