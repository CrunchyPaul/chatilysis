// Global array to store parsed chat lines
let chatLines = new Array();

/**
 * Handles file upload input and reads the text content.
 * Accepts only plain text files (.txt), reads line by line,
 * and calls `formatFile()` after loading is complete.
 * 
 * @param {HTMLInputElement} input - The file input element
 */
function getFile(input) {
    const file = input.files[0];
    if (file && file.type === "text/plain") {
        let reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const lines = text.split(/\r?\n/);
            lines.forEach((line) => {
                chatLines.push(line);
            });
            formatFile();
        };
        reader.readAsText(file);
    } else {
        document.getElementById('content').textContent = "Bitte eine gültige .txt-Datei auswählen.";
    }
}

/**
 * Parses a custom date and time string in the format "DD.MM.YY" and "HH:MM"
 * and returns a JavaScript Date object.
 * Handles conversion from two-digit to full year.
 * 
 * @param {string} dateStr - The date string (e.g., "01.04.23")
 * @param {string} timeStr - The time string (e.g., "15:30")
 * @returns {Date} - A valid JavaScript Date object
 */
function parseCustomDate(dateStr, timeStr) {
    const [day, month, year] = dateStr.split(".");
    const [hours, minutes] = timeStr.split(":");
    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
    return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
}

/**
 * Parses and formats the uploaded chat text lines into structured arrays.
 * Each valid line will be converted into a tuple of [Date, Person, Message].
 * Invalid lines will be ignored.
 */
function formatFile() {
    if (!chatLines) {
        document.getElementById('content').textContent = "Bitte eine gültige .txt-Datei auswählen.";
        return;
    }
    chatLines = chatLines
        .map((content) => {
            const match = content.match(/^(.+?), (.+?) - (.+?): (.+)$/);
            if (match) {
                const [, dateStr, timeStr, person, message] = match;
                const dateObj = parseCustomDate(dateStr.trim(), timeStr.trim());
                return [dateObj, person.trim(), message.trim()];
            }
            return null;
        })
        .filter(entry => entry !== null);

    console.log(chatLines);
}

/**
 * Main function triggered by user interaction to analyze chat data.
 * Delegates work to selected sub-analyses based on checkbox states.
 */
function analyzeFile() {
    let chrAnalysis = document.getElementById("dateAnalysis");
    let semAnalysis = document.getElementById("messageAnalysis");
    let mdAnalysis = document.getElementById("moodAnalysis");

    if (chrAnalysis.checked) { chronoAnalysis(); }
    if (semAnalysis.checked) { semanticAnalysis(); }
    if (mdAnalysis.checked) { moodAnalysis(); }
}

/**
 * Analyzes the number of messages per month and year.
 * Groups and counts messages and displays them sorted by time.
 */
function chronoAnalysis() {
    const monthYearCount = {};

    chatLines.forEach(([date, person, message]) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthName = new Date(2021, month).toLocaleString('de-DE', { month: 'long' });
        const monthYearKey = `${year}-${monthName}`;
        monthYearCount[monthYearKey] = (monthYearCount[monthYearKey] || 0) + 1;
    });

    const sortedMonthYearNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    const sortedMonthYearCount = [];
    for (let year = chatLines[0][0].getFullYear(); year <= new Date().getFullYear(); year++) {
        sortedMonthYearNames.forEach(month => {
            const monthYearKey = `${year}-${month}`;
            sortedMonthYearCount.push({ monthYear: monthYearKey, count: monthYearCount[monthYearKey] || 0 });
        });
    }

    let innerContent = displayMonthYearCount(sortedMonthYearCount);
    document.getElementById('dateAnalysisContent').appendChild(innerContent);
}

/**
 * Creates and returns a <details> HTML element showing message counts by month and year.
 * 
 * @param {Array} sortedMonthYearCount - Array of objects {monthYear, count}
 * @returns {HTMLElement} - A <details> element with formatted analysis
 */
function displayMonthYearCount(sortedMonthYearCount) {
    const detailElement = document.createElement('details');
    const heading = document.createElement('h3');
    heading.textContent = 'Nachrichten pro Jahr und Monat:';
    detailElement.appendChild(heading);
    sortedMonthYearCount.forEach(item => {
        if (item.count > 0) {
            let pElement = document.createElement('p');
            pElement.textContent = `${item.monthYear}: ${item.count} Nachrichten`;
            detailElement.appendChild(pElement);
        }
    });
    return detailElement;
}

/**
 * Analyzes the frequency of words in the chat messages (case-insensitive).
 * Converts words to uppercase and ignores the string "null".
 */
function semanticAnalysis() {
    const wordCount = {};

    chatLines.forEach(([date, person, message]) => {
        message.split(" ").forEach((word) => {
            word = word.toUpperCase();
            if (word === "null") return;
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
    });

    const sortedEntries = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
    const sortedList = sortedEntries.map(([word, amount]) => ({ word, amount }));

    let innerContent = displayWordCount(sortedList);
    document.getElementById('semAnalysisContent').appendChild(innerContent);
}

/**
 * Displays a word frequency list using HTML elements.
 * 
 * @param {Array} sortedWordCount - Array of objects {word, amount}
 * @returns {HTMLElement} - A <details> element with formatted word counts
 */
function displayWordCount(sortedWordCount) {
    const detailElement = document.createElement('details');
    const heading = document.createElement('h3');
    heading.textContent = 'Die meist genutzen Wörter:';
    detailElement.appendChild(heading);
    sortedWordCount.forEach(item => {
        let pElement = document.createElement('p');
        pElement.textContent = `${item.word}: ${item.amount}`;
        detailElement.appendChild(pElement);
    });
    return detailElement;
}

/**
 * Displays the AI-based mood and context analysis by injecting HTML.
 * 
 * @param {string} text - The generated AI analysis text
 */
function displayAiAnalysis(text) {
    document.getElementById("moodAnalysisContent").innerHTML = text;
}

/**
 * Prepares the chat history into a formatted string and sends it to a local AI model.
 * Sends a detailed instruction for analysis and waits for response to display.
 */
async function fetchChatLines() {
    let chatMessages = "";
    chatLines.forEach((message) => {
        chatMessages += `(${message[1]}:) ${message[2]} | `;
    });

    const response = await fetch('http://localhost:11434/api/generate', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama3.2",
            "messages": [
                {
                    "role": "system",
                    "content": `...` // (Full analysis instruction, omitted here for brevity)
                },
            ],
            prompt: chatMessages,
            stream: false
        })
    });

    const data = await response.json();
    console.log(data);
    displayAiAnalysis(data.response);
}

/**
 * Calls `fetchChatLines` to analyze chat mood and context using local AI.
 */
function moodAnalysis() {
    fetchChatLines();
}
