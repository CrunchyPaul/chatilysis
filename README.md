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

For the mood and relationship analysis to work, the tool uses a locally running instance of **[Ollama](https://ollama.com/)** – an open-source LLM runtime.

### Prerequisites

1. Download and install Ollama:

   ```bash
   https://ollama.com
   ```

2. Download and run a suitable model (e.g. LLaMA 3):

   ```bash
   ollama run llama3
   ```

   > The default model name used in `main.js` is `llama3.2`. Make sure this matches the model you're running, or change it in the code.

3. Set the following environment variables to allow the web app to communicate with Ollama via CORS:

   ```bash
   export OLLAMA_HOST=0.0.0.0
   export OLLAMA_ORIGINS=*
   ```

4. Make sure the Ollama server is running and accessible at:

   ```
   http://localhost:11434
   ```

## File Structure

- `index.html` – Main user interface
- `main.js` – JavaScript logic for parsing, analyzing, and interacting with Ollama
- `style.css` – Basic layout and styling

## Example Input Format

Your `.txt` file should be in the standard WhatsApp export format, for example:

```
14.03.24, 20:15 - Alex: Hey, how are you?
14.03.24, 20:17 - Sam: I'm good, you?
```

## Notes

- All AI-based analysis is done **locally** — no data is sent to the internet.
- The app interface is in German but can be translated or modified as needed.
- The more messages are provided, the more meaningful the analysis becomes.


## Contributing

> 💡 **Want to contribute?** Check out our [contributing guidelines](./CONTRIBUTING.md) before you start.
