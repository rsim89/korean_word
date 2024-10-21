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
    const filePath = `https://rsim89.github.io/korean_word/vocab/${chapter}.xlsx`;

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            wordPairs = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row.length >= 3) {
                    const korean = row[0];
                    const english = row[1];
                    const soundFile = row[2];
                    wordPairs.push({ korean, english, soundFile });
                }
            }

            shuffle(wordPairs);
            wordPairs = wordPairs.slice(0, 10);
            createCards();
        })
        .catch(error => {
            console.error('Error loading the file:', error);
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

        // Ensure the soundFile includes the ".mp3" extension
        let soundFile = wordPairs.find(pair => pair.korean === word).soundFile;
        if (!soundFile.endsWith('.mp3')) {
            soundFile += '.mp3';
        }
        card.dataset.soundFile = soundFile;
        card.addEventListener('click', () => selectCard(card));
        koreanContainer.appendChild(card);
    });
}

function startGame() {
    const chapter = document.getElementById('chapter').value;
    score = 0;
    attempt = 0;
    selectedCards = [];

    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('message').innerText = '';
    document.getElementById('reset-button').style.display = 'none';

    if (!chapter) {
        alert('Please select a chapter.');
        return;
    }

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
    // Check if the soundFile does not already end with ".mp3"
    if (!soundFile.endsWith('.mp3')) {
        soundFile += '.mp3'; // Add ".mp3" if it's missing
    }

    // Construct the full URL for the audio file
    const audioPath = `https://rsim89.github.io/korean_word/audiofiles/${soundFile}`;

    // Create a new Audio object with the file URL
    const audio = new Audio(audioPath);

    // Play the audio file
    audio.play().catch(error => {
        console.error('Error playing the audio file:', error);
    });
}

function checkMatch() {
    const [firstCard, secondCard] = selectedCards;
    const firstWord = firstCard.dataset.word;
    const secondWord = secondCard.dataset.word;

    // Check if the selected pair matches
    const match = wordPairs.some(pair =>
        (pair.korean === firstWord && pair.english === secondWord) ||
        (pair.korean === secondWord && pair.english === firstWord)
    );

    if (match) {
        score += 10;
        document.getElementById('score').innerText = `Score: ${score}`;

        // Change the background color of matched cards and keep them revealed
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.style.backgroundColor = '#28a745'; // Green color for matched cards
        secondCard.style.backgroundColor = '#28a745'; // Green color for matched cards
        firstCard.innerText = firstCard.dataset.word; // Keep the word visible
        secondCard.innerText = secondCard.dataset.word; // Keep the word visible

        document.getElementById('message').innerText = 'Correct!';
    } else {
        // If not matched, flip the cards back after a delay
        setTimeout(() => {
            firstCard.classList.remove('revealed');
            firstCard.innerText = '[CARD]';
            firstCard.style.backgroundColor = ''; // Reset to original background
            secondCard.classList.remove('revealed');
            secondCard.innerText = '[CARD]';
            secondCard.style.backgroundColor = ''; // Reset to original background
            document.getElementById('message').innerText = 'Try again!';
        }, 1000); // 1-second delay before flipping cards back
    }

    // Clear the selected cards
    selectedCards = [];
    attempt += 1;

    if (attempt >= maxAttempts) {
        document.getElementById('message').innerText = 'Game Over!';
        document.getElementById('reset-button').style.display = 'block';
    }
}


document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', startGame);
document.getElementById('practice-button').addEventListener('click', showPracticeMode); // New Practice Button Event

function showPracticeMode() {
    const practiceList = document.getElementById('practice-list');
    practiceList.innerHTML = ''; // Clear any previous content
    practiceList.style.display = 'block'; // Show the practice list
    document.querySelector('.game-board').style.display = 'none'; // Hide the game board during practice

    // Display the word pairs in the practice list
    wordPairs.forEach(pair => {
        const practiceItem = document.createElement('div');
        practiceItem.className = 'practice-item';
        practiceItem.innerHTML = `<strong>${pair.english}</strong> - ${pair.korean}`;

        // Add an event listener to play the sound when the item is clicked
        practiceItem.addEventListener('click', () => {
            if (pair.soundFile) {
                playSound(pair.soundFile); // Play the sound file if available
            }
        });

        practiceList.appendChild(practiceItem);
    });
}

function loadWordPairsFromChapter(chapter) {
    const filePath = `https://rsim89.github.io/korean_word/vocab/${chapter}.xlsx`;

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            wordPairs = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row.length >= 3) {
                    const korean = row[0];
                    const english = row[1];
                    const soundFile = row[2];
                    wordPairs.push({ korean, english, soundFile });
                }
            }

            shuffle(wordPairs);
            wordPairs = wordPairs.slice(0, 10);
            createCards();
        })
        .catch(error => {
            console.error('Error loading the file:', error);
            alert('Failed to load the selected chapter. Please make sure the file exists and is accessible.');
        });
}
