# 📚 Bebe's Reviewer

A personalized quiz app that turns your PowerPoint and PDF study materials into interactive quizzes using AI.

**Made with ♥ for Bebe (future OT!)**

---

## ✨ Features

- 📄 **Upload Files** - Support for `.pptx`, `.ppt`, and `.pdf` files
- 🤖 **AI-Powered** - Generates questions using Groq AI (Llama 3.3 70B)
- 🎯 **Multiple Quiz Types**:
  - Multiple Choice
  - Identification (fill-in-the-blank)
  - True or False
  - Mixed Mode
- 📊 **Track Progress** - Save and review past quizzes
- ✝️ **Daily Bible Verse** - Encouraging verse every day
- 🎨 **Beautiful UI** - Modern, clean design

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Groq API key (free tier available at [console.groq.com](https://console.groq.com))
- Supabase account for database (free tier at [supabase.com](https://supabase.com))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Groq AI API Key (get free at console.groq.com)
   GROQ_API_KEY=your_groq_api_key_here
   
   # Supabase Database (required for saving quizzes)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 🎨 Customization

### Change Theme Colors

Edit `config/theme.ts` or `app/globals.css`:

```css
:root {
  --color-primary: #7c3aed;    /* Purple */
  --color-accent: #f472b6;      /* Pink */
  --color-background: #faf5ff;  /* Light lavender */
}
```

For **OT Theme** (healthcare colors):
```css
:root {
  --color-primary: #0d9488;    /* Teal */
  --color-accent: #fb923c;      /* Coral */
  --color-background: #f0fdfa;  /* Mint */
}
```

### Change App Name & Content

Edit `config/content.ts`:

```typescript
export const APP_CONTENT = {
  name: "Bebe's OT Reviewer",
  tagline: "Ace your OT boards, one quiz at a time",
  footer: "Made with ♥ for my future OT",
  icon: "🤲",
  // ... more options
};
```

### Add Bible Verses

Edit `config/verses.ts` to add more verses.

---

## 📁 Project Structure

```
bebe's-app/
├── app/                 # Next.js App Router pages
│   ├── api/            # Backend API routes
│   ├── page.tsx        # Home page
│   ├── configure/      # Quiz settings page
│   ├── quiz/[id]/      # Quiz taking page
│   ├── results/[id]/   # Results page
│   └── history/        # Quiz history page
│
├── components/         # Reusable React components
├── config/             # App configuration (theme, content)
├── lib/                # Core logic (AI, parsers, database)
└── public/             # Static assets
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B Versatile)
- **Database**: Supabase
- **Language**: TypeScript

---

## 💡 How It Works

1. **Upload** your PowerPoint or PDF reviewer
2. **Configure** quiz settings (type, number of questions)
3. **AI generates** questions from your content
4. **Take the quiz** and see your results
5. **Review** past quizzes anytime

---

## 📝 Notes

- Groq API has a **generous free tier** - perfect for personal use
- Supabase free tier includes **500MB database** storage
- Questions are optimized for **OT board exam preparation**

---

## ❤️ Made For

My future OT girlfriend, to help her ace her exams! 📚✨
