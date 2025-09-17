                                                                                            // Aligne 127.0.0.1 / localhost avec le front (Live Server)
const API_URL = `http://${location.hostname}:5678/api/works`;                               // confirmation /api/works okay

const galleryEl = document.querySelector(".gallery");                                       // <div class="gallery">...</div> //

async function fetchWorks() {                                                               // recupère les travaux depuis l’API //
  const res = await fetch(API_URL);                                                         // GET par défaut //
  if (!res.ok) {                                                                            // 200-299 //
    throw new Error(`HTTP ${res.status} ${res.statusText}`);                                // gestion erreur //
  }
  return res.json();                                                                        // [{id,title,imageUrl,categoryId,...}, ...]
}

function createWorkFigure(work) {                                                           // crée <figure> pour un travail //
const fig = document.createElement("figure");                                               // <figure>...</figure> //

const img = document.createElement("img");                                                  // <img ...> //
img.src = work.imageUrl;                                                                    // l’API renvoie URL utilisable //
img.alt = work.title;                                                                       // texte alternatif //

const cap = document.createElement("figcaption");                                           // <figcaption>...</figcaption> //
cap.textContent = work.title;                                                               // titre du travail //

  fig.append(img, cap);                                                                     // <figure><img ...><figcaption>...</figcaption></figure> //
  return fig;                                                                               // renvoie <figure> complète //
}

function renderGallery(works) {                                                             // affiche la galerie de travaux //
  galleryEl.innerHTML = "";                                                                 // vide la galerie //
  works.forEach(w => galleryEl.appendChild(createWorkFigure(w)));                           // ajoute chaque travail //
}

async function init() {                                                                     // initialise la page //
  try {                                                                                     // gestion des erreurs //
    const works = await fetchWorks();                                                       // récupère les travaux //
    renderGallery(works);                                                                   // affiche la galerie //
    console.log("Galerie chargée :", works);                                                // debug //
  } catch (e) {                                                                             // en cas d’erreur //
    console.error("Erreur de chargement :", e);                                             // debug //
    galleryEl.innerHTML = `<p style="color:#c00">Impossible de charger la galerie.</p>`;    // message utilisateur //
  }
}

document.addEventListener("DOMContentLoaded", init);                                        // initialise après chargement du DOM //

