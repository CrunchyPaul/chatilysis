let chatLines = new Array();

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

            // Jetzt wird formatFile nach dem Laden der Datei aufgerufen
            formatFile();
        };
        reader.readAsText(file);
    } else {
        document.getElementById('content').textContent = "Bitte eine gültige .txt-Datei auswählen.";
    }
}

function parseCustomDate(dateStr, timeStr) {
    const [day, month, year] = dateStr.split(".");
    const [hours, minutes] = timeStr.split(":");

    // Jahr anpassen: "23" => 2023 (oder 1923, je nachdem)
    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);

    return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
}

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

function analyzeFile() {
    let chrAnalysis = document.getElementById("dateAnalysis");
    let semAnalysis = document.getElementById("messageAnalysis");
    let mdAnalysis = document.getElementById("moodAnalysis");



    if (chrAnalysis.checked) { chronoAnalysis() }
    if (semAnalysis.checked) { semanticAnalysis() }
    if (mdAnalysis.checked) { moodAnalysis() }
}

function chronoAnalysis() {
    // Objekt, um die Anzahl der Nachrichten pro Jahr und Monat zu zählen
    const monthYearCount = {};

    chatLines.forEach(([date, person, message]) => {
        // Monat und Jahr extrahieren
        const year = date.getFullYear();
        const month = date.getMonth();

        // Monat als String (z.B. "Januar", "Februar")
        const monthName = new Date(2021, month).toLocaleString('de-DE', { month: 'long' });

        const monthYearKey = `${year}-${monthName}`;

        // Wenn der Schlüssel bereits existiert, erhöhen wir den Zähler
        if (monthYearCount[monthYearKey]) {
            monthYearCount[monthYearKey]++;
        } else {
            // Wenn der Schlüssel noch nicht existiert, setzen wir den Zähler auf 1
            monthYearCount[monthYearKey] = 1;
        }
    });

    // Sortierung der Jahre und Monate (zuerst Jahr, dann Monat)
    const sortedMonthYearNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    // Sortierte Liste der Jahre und Monate mit ihren Zählungen erstellen
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

function semanticAnalysis() {
    const wordCount = {};

    chatLines.forEach(([date, person, message]) => {
        message.split(" ").forEach((message) => {
            message = message.toUpperCase();
            if (message === "null") { return; }

            if (wordCount[message]) {
                wordCount[message]++;
            } else {
                wordCount[message] = 1;
            }
        });

    });

    const sortedEntries = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);

    sortedList = new Array();

    sortedEntries.forEach((message) => {
        sortedList.push({ word: message[0], amount: message[1] });
    });

    let innerContent = displayWordCount(sortedList);

    document.getElementById('semAnalysisContent').appendChild(innerContent);
}

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

function displayAiAnalysis(text) {
    document.getElementById("moodAnalysisContent").innerHTML = text;
}

async function fetchChatLines() {
    let chatMessages = "";
    chatLines.forEach((message) => {
        chatMessages += `(${message[1]}:) ${message[2]} | `;
    })
    console.log(chatMessages);
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
                    "content": `Du erhältst im folgenden einen vollständigen oder auszugsweisen Chatverlauf. Jede Nachricht ist klar durch den Namen der schreibenden Person gekennzeichnet und hat folgendes Format:
                    (NAME:) Nachricht
                    Analysiere diesen Chatverlauf höchst detailliert und umfassend. Gehe dabei bitte auf die folgenden Punkte ein – strukturiert, tiefgehend und so, als würdest du ein psychologisches, sprachliches und soziologisches Gutachten über die Kommunikation erstellen.
                    1. Themenanalyse:
                    Welche Themen kommen vor?
                    Welche zentralen inhaltlichen Schwerpunkte lassen sich erkennen?
                    Welche emotionalen, sozialen oder politischen Kontexte stehen im Hintergrund?
                    Gibt es wiederkehrende Themen oder ein dominantes Grundmotiv?
                    2. Personenanalyse:
                    Für jede im Chatverlauf vorkommende Person:
                    Wie wirkt die Person charakterlich? (z. B. emotional, ironisch, unsicher, bestimmend, fürsorglich, provokant)
                    Wie ist ihr sprachlicher Stil? (z. B. förmlich, flapsig, gebildet, poetisch, vulgär)
                    Welche möglichen psychologischen Merkmale oder Persönlichkeitszüge lassen sich erkennen? (z. B. Narzissmus, Selbstzweifel, Humor, Sarkasmus, Reife, Naivität)
                    Welche sozialen Rollen nehmen sie im Chat ein? (z. B. Anführerin, Vermittlerin, Provokateurin, Außenseiterin)
                    3. Beziehungsanalyse:
                    Wie stehen die Personen zueinander? Welche Beziehungen lassen sich erkennen?
                    Welche Konflikte, Allianzen oder Hierarchien gibt es?
                    Wer beeinflusst wen? Wer dominiert Gespräche? Wer sucht Anschluss, wer distanziert sich?
                    Gibt es Zeichen von Intimität, Ironie, Missverständnissen, Machtspielchen oder Manipulation?
                    4. Kommunikationsstil und Chatverhalten:
                    Wie wird miteinander kommuniziert? (kurze/lange Nachrichten, Emoji-Nutzung, Ironie, Ernsthaftigkeit, etc.)
                    Welche Arten von Sprachebenen, Dialekten, Slang oder Wortneuschöpfungen treten auf?
                    Wie verändert sich der Ton im Laufe des Gesprächs? Gibt es emotionale Wendepunkte oder Eskalationen?
                    Wie individuell oder stereotyp agieren die Personen sprachlich?
                    5. Gesamtinterpretation:
                    Was sagt dieser Chatverlauf über die beteiligten Personen und ihre Beziehungen aus?
                    Welche versteckten Botschaften, impliziten Haltungen oder sozialen Spannungen lassen sich erkennen?
                    Welche offenen oder verdeckten Dynamiken sind spürbar?
                    Gibt es Hinweise auf psychologische Belastungen, Gruppenmechanismen oder strategisches Verhalten?
                    Nenne zwei, drei besonders lustige Nachrichten.
                    Schreibe deine Analyse in einem klar gegliederten, ausführlichen Text. Verwende Zwischenüberschriften, Beispiele aus dem Chat (als Zitate) und bleibe analytisch, aber auch interpretierend. Wenn Interpretationen unsicher sind, kennzeichne sie entsprechend als Hypothese.
                    Am Ende fasse in einem kurzen Fazit die zentralen Erkenntnisse über Personen, Themen und Beziehungen zusammen.`
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

function moodAnalysis() {
    fetchChatLines();
}