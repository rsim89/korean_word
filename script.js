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

function loadWordPairsFromChapter(chapter) {
    // Construct the path to the chapter file
    const filePath = `https://rsim89.github.io/korean_word/vocab/${chapter}.xlsx`;
    console.log("Loading file:", filePath); // Debug log

    // Fetch the file and load word pairs
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

            shuffle(wordPairs);
            wordPairs = wordPairs.slice(0, 10); // Pick 10 random pairs
            createCards();
        })
        .catch(error => {
            console.error('Error loading the chapter file:', error);
            alert('Failed to load the selected chapter. Please make sure the file exists and is accessible.');
        });
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
}

function startGame() {
    console.log("Start Game function called."); // Debug log

    resetGame(); // Reset the game state

    const chapter = document.getElementById('chapter').value;
    console.log("Selected chapter:", chapter); // Debug log

    if (!chapter) {
        alert('Please select a chapter.');
        return;
    }

    const difficulty = document.getElementById('difficulty').value || 'medium';
    maxAttempts = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 10 : 12;

    score = 0;
    attempt = 0;
    selectedCards = [];

    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('message').innerText = '';
    document.getElementById('reset-button').style.display = 'none';

    // Hide the practice list if visible
    const practiceList = document.getElementById('practice-list');
    if (practiceList) {
        practiceList.style.display = 'none';
    }
    document.querySelector('.game-board').style.display = 'flex';

    // Load word pairs based on the selected chapter
    loadWordPairsFromChapter(chapter);
}

function selectCard(card) {
    if (selectedCards.length < 2 && !card.classList.contains('revealed')) {
        card.classList.add('revealed');
        card.innerText = card.dataset.word;
        selectedCards.push(card);

        if (card.dataset.language === 'korean') {
            playSound(card.dataset.soundFile);
        }

        if (selectedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

function playSound(soundFile) {
    const audioPath = `https://rsim89.github.io/korean_word/audiofiles/${soundFile}`;
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
        console.error('Error playing the audio file:', error);
    });
}

function checkMatch() {
    const [firstCard, secondCard] = selectedCards;
    const firstWord = firstCard.dataset.word;
    const secondWord = secondCard.dataset.word;

    const match = wordPairs.some(pair =>
        (pair.korean === firstWord && pair.english === secondWord) ||
        (pair.korean === secondWord && pair.english === firstWord)
    );

    if (match) {
        score += 10;
        document.getElementById('score').innerText = `Score: ${score}`;
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.style.backgroundColor = '#ffd700';
        secondCard.style.backgroundColor = '#ffd700';
        document.getElementById('message').innerHTML = `<span style="color: green;">You are correct! 😊 The word pair '${firstWord}' and '${secondWord}' is a correct match!</span>`;
    } else {
        setTimeout(() => {
            firstCard.classList.remove('revealed');
            firstCard.innerText = '[CARD]';
            firstCard.style.backgroundColor = '';
            secondCard.classList.remove('revealed');
            secondCard.innerText = '[CARD]';
            secondCard.style.backgroundColor = '';
            document.getElementById('message').innerHTML = `<span style="color: red;">Oops... try again. 😞 The word pair '${firstWord}' and '${secondWord}' does not match.</span>`;
        }, 1000);
    }

    selectedCards = [];
    attempt += 1;

    if (attempt >= maxAttempts) {
        document.getElementById('message').innerText = 'Game Over!';
        document.getElementById('reset-button').style.display = 'block';
    }
}

function showPracticeMode() {
    resetGame();
    const practiceList = document.getElementById('practice-list');
    practiceList.innerHTML = '';
    practiceList.style.display = 'block';
    document.querySelector('.game-board').style.display = 'none';

    wordPairs.forEach(pair => {
        const practiceItem = document.createElement('div');
        practiceItem.className = 'practice-item';
        practiceItem.innerHTML = `<strong>${pair.english}</strong> - ${pair.korean}`;
        practiceItem.addEventListener('click', () => {
            if (pair.soundFile) {
                playSound(pair.soundFile);
            }
        });
        practiceList.appendChild(practiceItem);
    });
}

function resetGame() {
    document.getElementById('english-cards').innerHTML = '';
    document.getElementById('korean-cards').innerHTML = '';
    document.getElementById('message').innerText = '';
    document.getElementById('score').innerText = 'Score: 0';
    document.getElementById('reset-button').style.display = 'none';
    selectedCards = [];
    wordPairs = [];
}

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', startGame);
document.getElementById('practice-button').addEventListener('click', showPracticeMode);

// Initialize the game
startGame();
