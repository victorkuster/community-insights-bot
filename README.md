# Community Insights Bot

A Discord bot that turns raw community conversations into structured, actionable insights using local LLMs.

Analyze messages directly from Discord or exported `.txt` files (Discord or WhatsApp), without token limits or API costs.

---

## 🚀 Features

* `/analyze` → Analyze messages directly from a Discord channel
* `/analyzefile` → Analyze exported `.txt` files (Discord or WhatsApp)
* Weekly and monthly summaries
* Identify recurring topics, questions, and potential issues
* Understand community sentiment over time
* Designed for community managers and data-driven insights
* Handles large volumes of messages through automatic chunking (e.g. 100 messages per batch)
* Successfully tested with datasets of 2,000+ messages

---

## 🎥 Demo

> Demo of the `/analyze` command (sped up for brevity)  
> Shows how raw messages are transformed into structured insights

![Demo](./assets/demo.gif)

---

## 🧠 LLM Support

This project supports multiple providers:

### 🟢 Ollama (default)

* Runs locally (no API cost)
* Requires Ollama to be installed and running locally
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
* Useful if you don't have enough hardware to run local models
* Can be used as an alternative to Ollama

---

## 🏗️ How it works

1. Messages are collected from Discord or `.txt` files
2. Data is grouped into smaller chunks to avoid LLM limits
3. Weekly summaries are generated using a faster model (`gemma3`)
4. A final consolidation step is performed using a more capable model (`qwen3`)
5. The result is a structured report with insights, topics, and sentiment

---

## ⚡ Quick Usage

Once the bot is running:

* Use `/analyze` inside a Discord channel to analyze messages
* Use `/analyzefile` to upload and analyze `.txt` exports from Discord or WhatsApp conversations

The bot will generate structured summaries with insights, topics, and sentiment.

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

### 3. Install and run Ollama

If you plan to use OpenAI instead, you can skip this step.

Download and install Ollama (local LLM runtime):
https://ollama.com

Then pull the recommended models:

```bash
ollama pull gemma3:12b
ollama pull qwen3:14b
```

Make sure Ollama is running locally at:
http://localhost:11434 (default configuration)

---

### 4. Configure environment variables

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

### 5. Configure LLM provider

By default, the bot is already configured to use **Ollama**.
No changes are required if you followed the setup above.

**If you want to use OpenAI instead**, edit:

```
src/config/config.js
```

```js
llm: {
  provider: "ollama" // or "openai"
}
```

---

### 6. Run the bot

```bash
node src/bot/index.js
```

---

## 📊 Example Output

The bot generates structured insights such as:

* 📊 Overview of activity and engagement patterns
* 🧩 Key discussion topics and trends
* ❓ Recurring questions from users
* ⚠️ Potential issues or friction points
* 💬 Overall community sentiment

---

## 📊 Example Insights

The bot helps surface actionable insights from conversations, such as:

* **Learning difficulties in programming**
  → Recurring across multiple weeks (Java, Python, React, fundamentals)  
  → Indicates where users struggle the most, helping prioritize educational content, events, or onboarding improvements

* **Platform-related questions**
  → Frequent mentions about navigation, courses, and learning paths  
  → Highlights potential UX issues and opportunities for product improvements

* **Development tools discussions**
  → Topics like VS Code, Docker, SQL, and automation tools appear consistently  
  → Suggests strong interest in tooling, which can guide content strategy or integrations

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

Community conversations generate a huge amount of data, but extracting insights from them is still difficult.

Most tools struggle with scale, cost, or context limitations.

This project was built to solve that by bringing analysis directly into Discord, using local LLMs to enable unlimited, cost-efficient exploration.

---

## 📄 License

MIT — free to use, modify, and adapt as you see fit.
