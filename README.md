# chatilysis
Analyse your exported Whatsapp Chat with Chatilysis!

This is a browser-based chat analysis tool that allows users to upload and analyze WhatsApp `.txt` chat exports. It supports three main types of analysis:

- **Chronological Analysis:** Shows how active the chat was over time.
- **Semantic Analysis:** Counts and ranks the most used words.
- **Mood & Relationship Analysis:** Uses an AI model to perform a deep psychological, linguistic, and social interpretation of the chat.

## How It Works

1. Upload a `.txt` file from a WhatsApp export (plaintext format).
2. Select one or more types of analysis:
   - **Chronoanalyse** – message frequency per month and year
   - **Semantische Analyse** – most frequent words
   - **Stimmungsanalyse Analyse** – AI-based detailed interpretation
3. Click **Absenden** to start the analysis.
4. Results will appear below the upload section.

## Requirements

For the mood and relationship analysis, the app sends chat content to a locally running instance of **[Ollama](https://ollama.com/)** – an open-source LLM runtime.

### Prerequisites

1. Install [Ollama](https://ollama.com/).
2. Download and start the required model, e.g.:

   ```bash
   ollama run llama3
