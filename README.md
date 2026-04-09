# Community Insights Bot

A Discord bot that analyzes community conversations and generates structured insights using LLMs.

It processes messages directly from Discord or from exported `.txt` files (Discord or WhatsApp), organizing discussions into weekly and monthly summaries.

---

## 🚀 Features

* `/analyze` → Analyze messages directly from a Discord channel
* `/analyzefile` → Analyze exported `.txt` files (Discord or WhatsApp)
* Weekly and monthly summaries
* Sentiment and topic clustering
* Designed for community managers and data-driven insights

---

## 🎥 Demo

> Demo sped up for brevity

![Demo](./assets/demo.gif)

---

## 🧠 LLM Support

This project supports multiple providers:

### 🟢 Ollama (default)

* Runs locally (no API cost)
* Default base URL:

  ```
  http://localhost:11434/api/generate
  ```
* Configuration location:

  ```
  src/config/config.js
  ```

#### Model choices

* `gemma3:12b` → used for **weekly analysis**

  * Faster responses
  * Good enough for smaller context windows

* `qwen3:14b` → used for **monthly analysis**

  * Better classification and structuring
  * Handles larger context more reliably

> These defaults aim to balance speed and output quality.

---

### 🔵 OpenAI (optional)

* Requires API key
* Useful if you don't have enough hardware for local models

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/victorkuster/community-insights-bot.git
cd community-insights-bot
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id

# Optional (only if using OpenAI)
OPENAI_API_KEY=
```

---

### 4. Configure LLM provider

By default, the bot is already configured to use **Ollama**.

If you want to change it, edit:

```
src/config/config.js
```

```js
llm: {
  provider: "ollama" // or "openai"
}
```

---

### 5. Run the bot

```bash
node src/bot/index.js
```

---

## 📊 Example Output

* Weekly breakdown of discussions
* Key topics and trends
* Community sentiment
* Monthly consolidated insights

---

## ⚠️ Notes

* Ollama must be running locally if used
* OpenAI is optional and requires credits
* You can change models and provider in `config.js`

---

## 🌐 Prompt Language

The default prompts are written in Brazilian Portuguese.

You can customize them in:

- `src/prompts/weeklyPrompt.js`
- `src/prompts/periodPrompt.js`
- `src/prompts/monthlyPrompt.js`

To generate outputs in another language, or adapt the analysis for different use cases, you can rewrite these prompt files as needed.

---

## 📌 Why this project exists

Community data is often noisy and hard to interpret at scale.

This bot helps transform raw conversations into structured insights, enabling better decisions for:

* Community managers
* Product teams
* Developer relations

---

## 📄 License

MIT
