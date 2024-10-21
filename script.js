let wordPairs = [];
let score = 0;
let attempt = 0;
let maxAttempts = 12;
let selectedCards = [];

document.getElementById('start-button').addEventListener('click', startGame);

// Update startGame() to ensure it works correctly after reset
function startGame() {
    console.log("Start Game button clicked."); // Debug log

    // Reset the game to ensure a fresh start
    resetGame();

    const chapter = document.getElementById('chapter').value;
    if (!chapter) {
        alert('Please select a chapter.');
        return;
    }

    console.log("Loading chapter:", chapter); // Debug log

    // Reset variables for a new game
    score = 0;
    attempt = 0;
    selectedCards = [];

    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('message').innerText = '';
    document.getElementById('reset-button').style.display = 'none';

    // Show the game board
    document.querySelector('.game-board').style.display = 'flex';

    // Load word pairs for the selected chapter
    loadWordPairsFromChapter(chapter);
}

function loadWordPairsFromChapter(chapter) {
    const filePath = `https://rsim89.github.io/korean_word/vocab/${chapter}.xlsx`;

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load the file');
            }
            return response.arrayBuffer();
        })
        .then(data => {
            console.log("File loaded successfully."); // Debug log
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
        })
        .catch(error => {
            console.error('Error loading the chapter file:', error);
            alert('Failed to load the selected chapter. Please make sure the file exists and is accessible.');
        });
}

function resetGame() {
    console.log("Resetting game..."); // Debug log

    // Clear the game board
    document.getElementById('english-cards').innerHTML = '';
    document.getElementById('korean-cards').innerHTML = '';

    // Clear messages and reset the score display
    document.getElementById('message').innerText = '';
    document.getElementById('score').innerText = 'Score: 0';

    // Hide the reset button initially
    document.getElementById('reset-button').style.display = 'none';

    // Reset game variables
    selectedCards = [];
    wordPairs = [];
    score = 0;
    attempt = 0;

    // Make sure the game board is hidden initially
    document.querySelector('.game-board').style.display = 'none';
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

function selectCard(card) {
    if (selectedCards.length < 2 && !card.classList.contains('revealed')) {
        card.classList.add('revealed');
        card.innerText = card.dataset.word;
        selectedCards.push(card);

        if (selectedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const [firstCard, secondCard] = selectedCards;
    const match = wordPairs.some(pair =>
        (pair.korean === firstCard.dataset.word && pair.english === secondCard.dataset.word) ||
        (pair.korean === secondCard.dataset.word && pair.english === firstCard.dataset.word)
    );

    if (match) {
        score += 10;
        document.getElementById('score').innerText = `Score: ${score}`;
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        document.getElementById('message').innerText = 'Correct match!';
    } else {
        setTimeout(() => {
            firstCard.classList.remove('revealed');
            secondCard.classList.remove('revealed');
            firstCard.innerText = '[CARD]';
            secondCard.innerText = '[CARD]';
        }, 1000);
        document.getElementById('message').innerText = 'Try again.';
    }

    selectedCards = [];
}
