document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DU DOM ---
    const gridContainer = document.getElementById('grid-container');
    const wordListElement = document.getElementById('word-list');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const endGameOverlay = document.getElementById('end-game-overlay');
    const endGameTitle = document.getElementById('end-game-title');
    const endGameScore = document.getElementById('end-game-score');

    // --- PARAMÈTRES DU JEU ---
    const GRID_SIZE = 15;
    const GAME_DURATION = 180;
    const WORDS = [
        "ARCHITECTE", "MACONNERIE", "CHARPENTE", "FONDATION", "URBANISME",
        "CHANTIER", "ESQUISSE", "BETON", "FACADE", "TOITURE",
        "PLOMBERIE", "GRUE", "CIMENT", "ISOLANT", "PERMIS",
        "OSSATURE", "MORTIER", "FERRAILLAGE", "PLAN", "ECHAFAUDAGE"
    ];

    // --- VARIABLES D'ÉTAT DU JEU ---
    let grid = [];
    let timerInterval;
    let score = 0;
    let timeLeft = GAME_DURATION;
    let isPlaying = false;
    let isSelecting = false;
    let currentSelection = [];
    let foundWords = [];
    let selectionDirection = null;

    // --- FONCTIONS DE GÉNÉRATION ---
    function initializeGrid() {
        grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
        placeWords();
        fillEmptyCells();
        renderGrid();
    }

    function placeWords() {
        const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ];
        for (const word of WORDS) {
            let placed = false, attempts = 0;
            while (!placed && attempts < 100) {
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * GRID_SIZE);
                const col = Math.floor(Math.random() * GRID_SIZE);
                if (canPlaceWord(word, row, col, dir)) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row + i * dir.y][col + i * dir.x] = word[i];
                    }
                    placed = true;
                }
                attempts++;
            }
        }
    }

    function canPlaceWord(word, row, col, dir) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + i * dir.y, newCol = col + i * dir.x;
            if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE ||
                (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i])) {
                return false;
            }
        }
        return true;
    }

    function fillEmptyCells() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }

    // --- FONCTIONS D'AFFICHAGE ---
    function renderGrid() {
        gridContainer.innerHTML = '';
        gridContainer.style.pointerEvents = 'none';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.textContent = grid[r][c];
                cell.dataset.row = r;
                cell.dataset.col = c;
                gridContainer.appendChild(cell);
            }
        }
    }

    function renderWordList() {
        wordListElement.innerHTML = '';
        WORDS.sort().forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.id = `word-${word}`;
            wordListElement.appendChild(li);
        });
    }

    // --- LOGIQUE DE JEU ---
    function resetGame() {
        isPlaying = false;
        score = 0;
        timeLeft = GAME_DURATION;
        foundWords = [];
        clearInterval(timerInterval);
        timerElement.textContent = "3:00";
        scoreElement.textContent = "0";
        startBtn.style.display = 'block';
        endGameOverlay.classList.add('hidden');
        initializeGrid();
        renderWordList();
        currentSelection = [];
        selectionDirection = null;
    }

    function startGame() {
        isPlaying = true;
        startBtn.style.display = 'none';
        startTimer();
        gridContainer.style.pointerEvents = 'auto';
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) endGame(false);
        }, 1000);
    }
    
    function endGame(isWin) {
        clearInterval(timerInterval);
        isPlaying = false;
        gridContainer.style.pointerEvents = 'none';
        if (isWin) {
            endGameTitle.textContent = "Félicitations !";
            endGameScore.textContent = `Vous avez trouvé tous les mots !`;
        } else {
            endGameTitle.textContent = "Temps écoulé !";
            endGameScore.textContent = `Votre score final est de ${score} sur ${WORDS.length}.`;
        }
        endGameOverlay.classList.remove('hidden');
    }

    function updateScore() {
        scoreElement.textContent = score;
        if (score === WORDS.length) endGame(true);
    }

    // --- GESTION DE LA SÉLECTION ---
    function addGridEventListeners() {
        gridContainer.addEventListener('pointerdown', handlePointerDown);
        gridContainer.addEventListener('pointermove', handlePointerMove);
        gridContainer.addEventListener('pointerup', handlePointerUp);
        gridContainer.addEventListener('pointercancel', handlePointerUp);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp);
    }

    function handlePointerDown(e) {
        e.preventDefault();
        if (!isPlaying || !e.target.classList.contains('cell')) return;
        isSelecting = true;
        currentSelection.forEach(cell => cell.classList.remove('selected'));
        currentSelection = [e.target];
        selectionDirection = null;
        e.target.classList.add('selected');
    }

    function handlePointerMove(e) {
        e.preventDefault();
        if (!isSelecting || !e.target.classList.contains('cell') || currentSelection.includes(e.target)) return;
        const cell = e.target;
        const lastCell = currentSelection[currentSelection.length - 1];
        if (currentSelection.length === 1) {
            const dx = parseInt(cell.dataset.col) - parseInt(lastCell.dataset.col);
            const dy = parseInt(cell.dataset.row) - parseInt(lastCell.dataset.row);
            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                selectionDirection = { x: dx, y: dy };
                currentSelection.push(cell);
                cell.classList.add('selected');
            }
        }
        else if (selectionDirection) {
            const expectedCol = parseInt(lastCell.dataset.col) + selectionDirection.x;
            const expectedRow = parseInt(lastCell.dataset.row) + selectionDirection.y;
            if (parseInt(cell.dataset.col) === expectedCol && parseInt(cell.dataset.row) === expectedRow) {
                currentSelection.push(cell);
                cell.classList.add('selected');
            }
        }
    }

    function handlePointerUp(e) {
        e.preventDefault();
        if (!isSelecting) return;
        isSelecting = false;
        if (currentSelection.length > 1) {
            const selectedWord = currentSelection.map(cell => cell.textContent).join('');
            const reversedSelectedWord = selectedWord.split('').reverse().join('');
            let wordFound = null;

            if (WORDS.includes(selectedWord) && !foundWords.includes(selectedWord)) {
                wordFound = selectedWord;
            } else if (WORDS.includes(reversedSelectedWord) && !foundWords.includes(reversedSelectedWord)) {
                wordFound = reversedSelectedWord;
            }

            if (wordFound) {
                foundWords.push(wordFound);
                score++;
                updateScore();
                document.getElementById(`word-${wordFound}`).classList.add('found-word');
                currentSelection.forEach(cell => {
                    cell.classList.remove('selected');
                    cell.classList.add('found');
                });
            } else {
                currentSelection.forEach(cell => cell.classList.remove('selected'));
            }
        } else {
             currentSelection.forEach(cell => cell.classList.remove('selected'));
        }
        currentSelection = [];
        selectionDirection = null;
    }

    // --- LIAISON DES ÉVÉNEMENTS ---
    // Ajout des lignes manquantes ici !
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    addGridEventListeners();

    // --- INITIALISATION AU DÉMARRAGE ---
    resetGame();
});