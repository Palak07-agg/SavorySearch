// api/recipes.js
export default async function handler(req, res) {
  const KEY = process.env.SPOON_KEY; // ✅ will be set in Vercel dashboard
  if (!KEY) {
    return res.status(500).json({ error: "Missing SPOON_KEY in environment" });
  }

  const { query = "", type = "name", diet = "", number = 20 } = req.query;

  let url = "";
  if (type === "ingredients") {
    url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
      query
    )}&number=${number}&apiKey=${KEY}`;
  } else {
    url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      query
    )}&number=${number}&addRecipeInformation=true&apiKey=${KEY}`;
    if (diet) url += `&diet=${encodeURIComponent(diet)}`;
  }

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
