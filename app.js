const recipeContainer = document.getElementById("recipeContainer");
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

// === Search Recipes ===
// === Search Recipes (via proxy) ===
searchBtn.onclick = async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  const filters = Array.from(document.querySelectorAll('.filters input:checked'))
    .map(cb => cb.value.toLowerCase());

  // Build query params for proxy
  const params = new URLSearchParams({
    query: q,
    type: searchType.value,
    number: 30
  });

  if (filters.includes("vegan")) params.append("diet", "vegan");
  if (filters.includes("vegetarian")) params.append("diet", "vegetarian");
  if (filters.includes("gluten free")) params.append("diet", "gluten free");

  const url = `/api/recipes?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    renderRecipes(Array.isArray(data) ? data : data.results);
  } catch (err) {
    console.error("API error:", err);
  }
};


// === Render Recipe Cards ===
function renderRecipes(recipes) {
  recipeContainer.innerHTML = "";
  if (!recipes.length) {
    document.getElementById("noResults").classList.remove("hidden");
    return;
  }
  document.getElementById("noResults").classList.add("hidden");

  recipes.forEach((r) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <img src="${r.image}" class="recipe-img">
      <div style="padding:10px">
        <h3>${r.title}</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="icon-btn viewBtn">View</button>
          <button class="icon-btn favBtn">⭐</button>
        </div>
      </div>`;
    card.querySelector(".viewBtn").onclick = () => openRecipe(r.id);
    card.querySelector(".favBtn").onclick = () => toggleFavorite(r);
    makeDraggable(card, r);
    recipeContainer.appendChild(card);
  });
}

// === Open Recipe Modal ===
async function openRecipe(id) {
  const res = await fetch(
   `/api/recipes?id=${id}&info=true`
  );
  const info = await res.json();
  detailImg.src = info.image;
  detailTitle.textContent = info.title;
  detailMeta.textContent = `Ready in ${info.readyInMinutes} mins • Servings: ${info.servings}`;
  detailIngredients.innerHTML = info.extendedIngredients
    .map((i) => `<li>${i.original}</li>`)
    .join("");
  detailSteps.innerHTML = info.analyzedInstructions.length
    ? info.analyzedInstructions[0].steps
        .map((s) => `<p>${s.step}</p>`)
        .join("")
    : "<p>No steps.</p>";
  overlay.classList.add("show");

  // Nutrition chart
  if (info.nutrition && info.nutrition.nutrients) {
    const topNutrients = info.nutrition.nutrients.filter((n) =>
      ["Calories", "Protein", "Fat", "Carbohydrates"].includes(n.name)
    );
    const ctx = document.getElementById("nutriChart").getContext("2d");
    if (window.nutriChartObj) window.nutriChartObj.destroy();
    window.nutriChartObj = new Chart(ctx, {
      type: "pie",
      data: {
        labels: topNutrients.map((n) => n.name),
        datasets: [{ data: topNutrients.map((n) => n.amount) }],
      },
    });
    document.getElementById("nutriNote").style.display = "none";
  }
}
closeDetail.onclick = () => {
  overlay.classList.remove("show");
  detailImg.src = "";
  detailIngredients.innerHTML = "";
  detailSteps.innerHTML = "";
};

// === Favorites ===
let favorites = JSON.parse(localStorage.getItem("savory_favs") || "[]");

function toggleFavorite(recipe) {
  const exists = favorites.find((f) => f.id === recipe.id);
  if (exists) {
    favorites = favorites.filter((f) => f.id !== recipe.id);
  } else {
    favorites.push(recipe);
  }
  localStorage.setItem("savory_favs", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  const favList = document.getElementById("favList");
  favList.innerHTML = "";
  favorites.forEach((r) => {
    const div = document.createElement("div");
    div.className = "planned-item";
    div.innerHTML = `<img src="${r.image}" width="30"> ${r.title}`;
    favList.appendChild(div);
  });
  document.getElementById("favCount").textContent = favorites.length;
}
renderFavorites();

// === Meal Planner Drag & Drop ===
function makeDraggable(card, recipe) {
  card.draggable = true;
  card.ondragstart = (e) => {
    e.dataTransfer.setData("recipe", JSON.stringify(recipe));
  };
}

document.querySelectorAll(".day").forEach((day) => {
  day.ondragover = (e) => e.preventDefault();
  day.ondrop = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("recipe"));
    const div = document.createElement("div");
    div.className = "planned-item";
    div.innerHTML = `<img src="${data.image}" width="40"> ${data.title}`;
    day.appendChild(div);
    savePlanner();
  };
});

function savePlanner() {
  const plan = {};
  document.querySelectorAll(".day").forEach((day) => {
    const title = day.getAttribute("data-day");
    plan[title] = Array.from(day.querySelectorAll(".planned-item")).map((d) =>
      d.innerText.trim()
    );
  });
  localStorage.setItem("savory_plan", JSON.stringify(plan));
}

function loadPlanner() {
  const plan = JSON.parse(localStorage.getItem("savory_plan") || "{}");
  for (let d in plan) {
    const day = document.querySelector(`.day[data-day="${d}"]`);
    plan[d].forEach((title) => {
      const div = document.createElement("div");
      div.className = "planned-item";
      div.textContent = title;
      day.appendChild(div);
    });
  }
}
loadPlanner();
// === Clear Planner ===
document.getElementById("clearPlanner").onclick = () => {
  document.querySelectorAll(".day").forEach(day => {
    day.innerHTML = `<h4>${day.getAttribute("data-day")}</h4><div class="drop-hint">Drop here</div>`;
  });
  localStorage.removeItem("savory_plan");
};


// === PDF Export ===
document.getElementById("exportPdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SavorySearch — Weekly Meal Plan", 14, 20);
  let y = 30;

  document.querySelectorAll(".day").forEach((day) => {
    const title = day.getAttribute("data-day");
    doc.setFontSize(14);
    doc.text(title, 14, y);
    y += 8;
    const items = day.querySelectorAll(".planned-item");
    if (!items.length) {
      doc.text(" - No recipes", 20, y);
      y += 8;
    } else {
      items.forEach((item) => {
        doc.setFontSize(12);
        doc.text(` - ${item.innerText.trim()}`, 20, y);
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 30;
        }
      });
    }
    y += 6;
  });
  doc.save("SavorySearch-MealPlan.pdf");
};

// === Dark Mode Toggle ===
themeBtn.onclick = () => {
  const current = document.body.getAttribute("data-theme");
  const newTheme = current === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("savory_theme", newTheme);
  themeBtn.textContent = newTheme === "light" ? "🌙" : "☀️";
};

if (localStorage.getItem("savory_theme")) {
  const saved = localStorage.getItem("savory_theme");
  document.body.setAttribute("data-theme", saved);
  themeBtn.textContent = saved === "light" ? "🌙" : "☀️";
}

// === Language Support ===
const translations = {
  en: {
    results: "Results",
    noResults: "No recipes found. Try different ingredients.",
    planner: "Meal Planner",
    favorites: "Favorites",
    nutrition: "Nutrition",
  },
  hi: {
    results: "परिणाम",
    noResults: "कोई रेसिपी नहीं मिली। अलग सामग्री आज़माएँ।",
    planner: "भोजन योजना",
    favorites: "पसंदीदा",
    nutrition: "पोषण",
  },
};

langSel.onchange = () => {
  const lang = langSel.value;
  localStorage.setItem("savory_lang", lang);
  applyLanguage(lang);
};

function applyLanguage(lang) {
  document.getElementById("resultsTitle").textContent =
    translations[lang].results;
  document.getElementById("noResults").textContent =
    translations[lang].noResults;
  document.getElementById("plannerTitle").textContent =
    translations[lang].planner;
  document.getElementById("favTitle").textContent =
    translations[lang].favorites;
  document.getElementById("nutritionTitle").textContent =
    translations[lang].nutrition;
}

// Load saved language
if (localStorage.getItem("savory_lang")) {
  const savedLang = localStorage.getItem("savory_lang");
  langSel.value = savedLang;
  applyLanguage(savedLang);
}
