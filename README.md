# 🍳 SavorySearch — Smart Recipe Finder

SavorySearch is a modern recipe discovery app that helps you **find, save, and cook recipes** tailored to your taste.  
It supports **meal planning, favorites, dark mode, multi-language support, and nutrition insights**, all in a clean responsive UI.

🔗 **Live Demo:*https://savory-search.vercel.app/* 

---

## ✨ Features
- 🔍 Search recipes **by name or ingredients**
- 🥦 Apply filters: Vegan, Vegetarian, Gluten-Free
- 📊 View **nutrition breakdown** (calories, protein, carbs, fat)
- ⭐ Save and manage **favorite recipes**
- 📅 Drag & drop **weekly meal planner** with PDF export
- 🌓 Light/Dark mode toggle
- 🌍 Multi-language support (English & Hindi)
- 📱 Fully responsive design
- 🔒 Secure API key handling using Vercel serverless functions

---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS (modern gradients, responsive grid), Vanilla JS
- **Backend Proxy:** Vercel Serverless Function (`/api/recipes`)
- **API:** [Spoonacular Recipe API](https://spoonacular.com/food-api)
- **Deployment:** [Vercel](https://vercel.com/home)

---

## 🚀 Getting Started (Local Development)

1. Clone the repository:
   ```bash 
   git clone https://github.com/your-username/savorysearch.git
   cd savorysearch
2. Install Vercel CLI (if not already):
   ```bash
   npm i -g vercel
3. Create an .env.local file:
   ```ini
   SPOON_KEY=your_api_key_here
4. Run locally with:
   ```bash
   vercel dev
5.Open http://localhost:3000

🌐 Deployment (Vercel)
1. Push this repo to GitHub.

2. Import the repo in Vercel Dashboard.

3. Add an Environment Variable:

Key: SPOON_KEY

Value: your Spoonacular API key

4. Deploy → you’ll get a live link like:

   ```arduino
   https://savorysearch.vercel.app

---

📜 License

MIT License © 2025 Palak Aggarwal
