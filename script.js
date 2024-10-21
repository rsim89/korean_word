let wordPairs = [];
let score = 0;
let attempt = 0;
let maxAttempts = 12;
let selectedCards = [];
let isEnglishFirst = true;
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
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    displayKorean = wordPairs.map(pair => pair.korean);
    displayEnglish = wordPairs.map(pair => pair.english);
    shuffle(displayKorean);
    shuffle(displayEnglish);

    const allWords = isEnglishFirst ? displayEnglish : displayKorean;
    allWords.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = '[CARD]';
        card.dataset.index = index;
        card.addEventListener('click', () => selectCard(card, word));
        cardsContainer.appendChild(card);
    });
}

function startGame() {
    const difficulty = document.getElementById('difficulty').value;
    isEnglishFirst = document.getElementById('mode').value === 'E';

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
    const firstWord = firstSelection.word;
    const secondWord = secondSelection.word;

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

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', startGame);
document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadWordPairsFromFile(file);
    }
});
