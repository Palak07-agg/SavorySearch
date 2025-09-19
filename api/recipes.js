// api/recipes.js
export default async function handler(req, res) {
  const KEY = process.env.SPOON_KEY;
  if (!KEY) return res.status(500).json({ error: "Missing SPOON_KEY" });

  const { query, type, diet, number, id, info } = req.query;

  let url = "";

  if (id && info) {
    // ✅ Single recipe detail with nutrition
    url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${KEY}`;
  } else if (type === "ingredients") {
    // ✅ Search by ingredients
    url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
      query || ""
    )}&number=${number || 20}&apiKey=${KEY}`;
  } else {
    // ✅ Search by name or with filters
    url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      query || ""
    )}&number=${number || 20}&addRecipeInformation=true&apiKey=${KEY}`;
    if (diet) url += `&diet=${encodeURIComponent(diet)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
