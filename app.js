const API_KEY = "2ff7c00a21414e39bf5295472a1af258"; // <-- YOUR SPOONACULAR API KEY

// ---------- DOM ELEMENTS ----------
const recipeContainer = document.getElementById("recipeContainer");
const favoritesContainer = document.getElementById("favoritesContainer");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("mainSearch");
const searchType = document.getElementById("searchType");
const overlay = document.getElementById("overlay");
const detailImg = document.getElementById("detailImg");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailIngredients = document.getElementById("detailIngredients");
const detailSteps = document.getElementById("detailSteps");
const closeDetail = document.getElementById("closeDetail");
const themeBtn = document.getElementById("themeBtn");
const langSel = document.getElementById("langSel");
const resultCountEl = document.getElementById("resultCount");
const noResultsEl = document.getElementById("noResults");
const PLACEHOLDER = "https://via.placeholder.com/640x420?text=No+Image";

// ---------- THEME ----------
(function initTheme() {
  const saved = localStorage.getItem("savory_theme") || "light";
  document.body.setAttribute("data-theme", saved);
  if(themeBtn) themeBtn.textContent = saved === "light" ? "🌙" : "☀️";
})();
if(themeBtn) themeBtn.onclick = () => {
  const current = document.body.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", next);
  localStorage.setItem("savory_theme", next);
  themeBtn.textContent = next === "light" ? "🌙" : "☀️";
};

// ---------- LANGUAGE ----------
const translations = {
  en: { results: "Results", noResults: "No recipes found. Try different ingredients.", planner: "Meal Planner", favorites: "Favorites", nutrition: "Nutrition" },
  hi: { results: "परिणाम", noResults: "कोई रेसिपी नहीं मिली। अलग सामग्री आज़माएँ।", planner: "भोजन योजना", favorites: "पसंदीदा", nutrition: "पोषण" }
};
(function initLang() {
  const saved = localStorage.getItem("savory_lang") || "en";
  if(langSel) langSel.value = saved;
  applyLanguage(saved);
})();
if(langSel) langSel.onchange = () => {
  const lang = langSel.value;
  localStorage.setItem("savory_lang", lang);
  applyLanguage(lang);
};
function applyLanguage(lang) {
  const resultsTitle = document.getElementById("resultsTitle");
  const plannerTitle = document.getElementById("plannerTitle");
  const favTitle = document.getElementById("favTitle");
  const nutritionTitle = document.getElementById("nutritionTitle");

  if(resultsTitle) resultsTitle.textContent = translations[lang].results;
  if(noResultsEl) noResultsEl.textContent = translations[lang].noResults;
  if(plannerTitle) plannerTitle.textContent = translations[lang].planner;
  if(favTitle) favTitle.textContent = translations[lang].favorites;
  if(nutritionTitle) nutritionTitle.textContent = translations[lang].nutrition;
}

// ---------- SEARCH ----------
if(searchBtn) searchBtn.onclick = async () => {
  const q = searchInput.value.trim();
  if (!q) return alert("Please enter a search term.");

  const filters = Array.from(document.querySelectorAll('.filters input:checked')).map(cb => cb.value.toLowerCase());
  let url = "";

  if (filters.length > 0 || (searchType && searchType.value === "name")) {
    const params = new URLSearchParams({
      query: q,
      number: 20,
      addRecipeInformation: "true",
      apiKey: API_KEY
    });
    if (filters.includes("vegan")) params.append("diet", "vegan");
    if (filters.includes("vegetarian")) params.append("diet", "vegetarian");
    if (filters.includes("gluten free")) params.append("intolerances", "gluten");
    url = `https://api.spoonacular.com/recipes/complexSearch?${params}`;
  } else {
    const params = new URLSearchParams({
      ingredients: q,
      number: 20,
      apiKey: API_KEY
    });
    url = `https://api.spoonacular.com/recipes/findByIngredients?${params}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.results || []);
    if(resultCountEl) resultCountEl.textContent = `${items.length} results`;
    renderRecipes(items);
    renderFavorites();
  } catch (err) {
    alert("Search failed. Check API key or network.");
    console.error(err);
  }
};

// ---------- RENDER RECIPES ----------
function renderRecipes(recipes) {
  if(!recipeContainer) return;
  recipeContainer.innerHTML = "";
  if (!recipes.length) {
    noResultsEl?.classList.remove("hidden");
    return;
  }
  noResultsEl?.classList.add("hidden");

  recipes.forEach(r => {
    const rid = r.id;
    const title = r.title || r.name || "Untitled";
    const img = r.image || PLACEHOLDER;

    const card = document.createElement("div");
    card.className = "recipe-card meal-item";
    card.dataset.id = rid;
    card.innerHTML = `
      <img src="${img}" class="recipe-img" alt="${title}">
      <div style="padding:10px">
        <h3>${title}</h3>
        <div style="display:flex;gap:10px;">
          <button class="icon-btn viewBtn">View</button>
          <button class="icon-btn favorite-btn">⭐</button>
        </div>
      </div>
    `;

    // View recipe
    card.querySelector(".viewBtn").onclick = () => openRecipe(rid);

    // Favorite toggle
    card.querySelector(".favorite-btn").onclick = () => toggleFavorite({id: rid, title, image: img});

    // Make draggable
    makeDraggable(card);

    recipeContainer.appendChild(card);
  });
}

// ---------- FAVORITES ----------
function toggleFavorite(recipe) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const exists = favorites.find(r => r.id === recipe.id);
  if(exists) {
    favorites = favorites.filter(r => r.id !== recipe.id);
  } else {
    favorites.push(recipe);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  if(!favoritesContainer) return;
  favoritesContainer.innerHTML = "";
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card meal-item';
    card.dataset.id = recipe.id;
    card.innerHTML = `
      <img src="${recipe.image || PLACEHOLDER}" class="recipe-img" alt="${recipe.title}">
      <div style="padding:10px">
        <h3>${recipe.title}</h3>
        <div style="display:flex;gap:10px;">
          <button class="icon-btn viewBtn">View</button>
          <button class="icon-btn removeFavBtn">⭐</button>
        </div>
      </div>
    `;
    card.querySelector(".viewBtn").onclick = () => openRecipe(recipe.id);
    card.querySelector(".removeFavBtn").onclick = () => toggleFavorite(recipe);
    makeDraggable(card);
    favoritesContainer.appendChild(card);
  });
}

// ---------- MAKE DRAGGABLE ----------
function makeDraggable(element) {
  element.setAttribute("draggable", true);
  element.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  });
}

// ---------- OPEN RECIPE ----------
async function openRecipe(id) {
  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`;
    const res = await fetch(url);
    const info = await res.json();

    if(detailImg) detailImg.src = info.image || PLACEHOLDER;
    if(detailTitle) detailTitle.textContent = info.title;
    if(detailMeta) detailMeta.textContent = `Ready in ${info.readyInMinutes} mins • Servings: ${info.servings}`;
    if(detailIngredients) detailIngredients.innerHTML = info.extendedIngredients.map(i => `<li>${i.original}</li>`).join("");
    if(detailSteps) detailSteps.innerHTML = info.analyzedInstructions.length
      ? info.analyzedInstructions[0].steps.map(s => `<p>${s.step}</p>`).join("")
      : "<p>No steps available.</p>";

    overlay?.classList.add("show");
  } catch(e) {
    console.error("openRecipe error", e);
  }
}
if(closeDetail) closeDetail.onclick = () => overlay?.classList.remove("show");

// ---------- PLANNER DRAG & DROP ----------
function setupPlannerSlots() {
  document.querySelectorAll('.planner-slot').forEach(slot => {
    slot.ondragover = e => e.preventDefault();
    slot.ondrop = e => {
      e.preventDefault();
      const recipeId = e.dataTransfer.getData('text/plain');
      const mealItem = document.querySelector(`.meal-item[data-id='${recipeId}']`);
      if(mealItem) slot.appendChild(mealItem);
      savePlannerData();
    };
  });
}

// ---------- SAVE & LOAD PLANNER ----------
function savePlannerData() {
  const plannerData = {};
  document.querySelectorAll('.planner-slot').forEach(slot => {
    plannerData[slot.dataset.slot] = slot.querySelector('.meal-item')?.dataset.id || null;
  });
  localStorage.setItem('planner', JSON.stringify(plannerData));
}

function loadPlannerData() {
  const plannerData = JSON.parse(localStorage.getItem('planner')) || {};
  for(const slotId in plannerData) {
    const recipeId = plannerData[slotId];
    if(recipeId) {
      const slot = document.querySelector(`.planner-slot[data-slot="${slotId}"]`);
      const mealItem = document.querySelector(`.meal-item[data-id="${recipeId}"]`);
      if(slot && mealItem) slot.appendChild(mealItem);
    }
  }
}

// ---------- INITIALIZE ----------
window.onload = () => {
  loadPlannerData();
  renderFavorites();
  setupPlannerSlots();
};
