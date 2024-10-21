let wordPairs = [];
let score = 0;
let attempt = 0;
let maxAttempts = 12;
let selectedCards = [];

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('file-upload').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        readExcelFile(file);
    }
}

function readExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        wordPairs = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 3) {
                const korean = row[0];
                const english = row[1];
                let soundFile = row[2];
                if (!soundFile.endsWith('.mp3')) {
                    soundFile += '.mp3';
                }
                wordPairs.push({ korean, english, soundFile });
            }
        }

        console.log("Word pairs loaded:", wordPairs); // Debug log

        shuffle(wordPairs);
        wordPairs = wordPairs.slice(0, 10);
        createCards();
    };
    reader.readAsArrayBuffer(file);
}

function startGame() {
    resetGame();

    if (!wordPairs || wordPairs.length === 0) {
        alert('Please upload a valid Excel file with word pairs.');
        return;
    }

    console.log("Starting game."); // Debug log

    score = 0;
    attempt = 0;
    selectedCards = [];

    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('message').innerText = '';
    document.getElementById('reset-button').style.display = 'none';
    document.querySelector('.game-board').style.display = 'flex';

    createCards();
}

function createCards() {
    const englishContainer = document.getElementById('english-cards');
    const koreanContainer = document.getElementById('korean-cards');
    englishContainer.innerHTML = '';
    koreanContainer.innerHTML = '';

    if (!wordPairs || wordPairs.length === 0) {
        alert('No word pairs available to create cards.');
        return;
    }

    const displayKorean = wordPairs.map(pair => pair.korean);
    const displayEnglish = wordPairs.map(pair => pair.english);
    shuffle(displayKorean);
    shuffle(displayEnglish);

    displayEnglish.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = '[CARD]';
        card.dataset.index = index;
        card.dataset.language = 'english';
        card.dataset.word = word;
        card.addEventListener('click', () => selectCard(card));
        englishContainer.appendChild(card);
    });

    displayKorean.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = '[CARD]';
        card.dataset.index = index;
        card.dataset.language = 'korean';
        card.dataset.word = word;
        const soundFile = wordPairs.find(pair => pair.korean === word).soundFile;
        card.dataset.soundFile = soundFile;
        card.addEventListener('click', () => selectCard(card));
        koreanContainer.appendChild(card);
    });

    console.log("Cards created."); // Debug log
}

// Additional helper functions for card matching and game reset are the same as before
