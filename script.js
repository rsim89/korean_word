let wordPairs = [];
let score = 0;
let attempt = 0;
let maxAttempts = 12;
let selectedCards = [];
let displayKorean = [];
let displayEnglish = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadWordPairsFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        wordPairs = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 2) {
                const korean = row[0];
                const english = row[1];
                wordPairs.push({ korean, english });
            }
        }

        shuffle(wordPairs);
        createCards();
    };
    reader.readAsArrayBuffer(file);
}

function createCards() {
    const englishContainer = document.getElementById('english-cards');
    const koreanContainer = document.getElementById('korean-cards');
    englishContainer.innerHTML = '';
    koreanContainer.innerHTML = '';

    displayKorean = wordPairs.map(pair => pair.korean);
    displayEnglish = wordPairs.map(pair => pair.english);
    shuffle(displayKorean);
    shuffle(displayEnglish);

    displayEnglish.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = '[CARD]';
        card.dataset.index = index;
        card.dataset.language = 'english';
        card.addEventListener('click', () => selectCard(card, word));
        englishContainer.appendChild(card);
    });

    displayKorean.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = '[CARD]';
        card.dataset.index = index;
        card.dataset.language = 'korean';
        card.addEventListener('click', () => selectCard(card, word));
        koreanContainer.appendChild(card);
    });
}

function startGame() {
    const difficulty = document.getElementById('difficulty').value;
    maxAttempts = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 10 : 12;

    score = 0;
    attempt = 0;
    selectedCards = [];

    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('message').innerText = '';
    document.getElementById('reset-button').style.display = 'none';

    if (wordPairs.length === 0) {
        alert('Please upload a valid Excel file with word pairs.');
        return;
    }

    createCards();
}

function selectCard(card, word) {
    if (selectedCards.length < 2 && !card.classList.contains('revealed')) {
        card.classList.add('revealed');
        card.innerText = word;
        selectedCards.push({ card, word });

        if (selectedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const [firstSelection, secondSelection] = selectedCards;

    // Check if one card is English and the other is Korean
    if (firstSelection.card.dataset.language === secondSelection.card.dataset.language) {
        document.getElementById('message').innerText = 'Select one Korean and one English card!';
        resetSelectedCards();
        return;
    }

    const firstWord = firstSelection.word;
    const secondWord = secondSelection.word;

    // Check if the selected pair matches
    const match = wordPairs.some(pair =>
        (pair.korean === firstWord && pair.english === secondWord) ||
        (pair.korean === secondWord && pair.english === firstWord)
    );

    if (match) {
        score += 10;
        document.getElementById('score').innerText = `Score: ${score}`;
        document.getElementById('message').innerText = 'Correct!';
    } else {
        firstSelection.card.classList.remove('revealed');
        firstSelection.card.innerText = '[CARD]';
        secondSelection.card.classList.remove('revealed');
        secondSelection.card.innerText = '[CARD]';
        document.getElementById('message').innerText = 'Try again!';
    }

    selectedCards = [];
    attempt += 1;

    if (attempt >= maxAttempts) {
        document.getElementById('message').innerText = 'Game Over!';
        document.getElementById('reset-button').style.display = 'block';
    }
}

function resetSelectedCards() {
    selectedCards.forEach(selection => {
        selection.card.classList.remove('revealed');
        selection.card.innerText = '[CARD]';
    });
    selectedCards = [];
}

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', startGame);
document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadWordPairsFromFile(file);
    }
});

// Initialize the game
startGame();
