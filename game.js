class SnakesAndLaddersGame {
    constructor() {
        this.boardSize = 100;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.pipes = new Map(); // Will be populated dynamically
        this.pipeStories = new Map(); // Maps square numbers to story objects
        this.pipePositions = new Map(); // Maps pipe keys to consistent random positions
        this.gameStartTime = null; // Track when game starts
        this.timerInterval = null; // Timer interval reference
        this.gameActuallyStarted = false; // Track if first turn has been completed
        this.isAnimating = false; // Track when tokens are moving
        this.positiveStatements = [];
        this.negativeStatements = [];
        this.initialize();
    }

    initialize() {
        this.initializeStoryContent();
        this.initializeUI();
    }

    initializeStoryContent() {
        // Embedded cloud adoption statements (from statements.json)
        this.positiveStatements = [
            {
                "cause": "Implementing single sign-on (SSO) leads to",
                "effect": "Improved user experience and reduced password fatigue"
            },
            {
                "cause": "Automated CI/CD pipelines lead to",
                "effect": "Faster deployment cycles and fewer manual errors"
            },
            {
                "cause": "Multi-factor authentication deployment leads to",
                "effect": "Significantly reduced unauthorized access attempts"
            },
            {
                "cause": "Centralized account management leads to",
                "effect": "Streamlined user provisioning and deprovisioning processes"
            },
            {
                "cause": "Container-based app deployment leads to",
                "effect": "Improved scalability and resource utilization efficiency"
            },
            {
                "cause": "End-to-end data encryption leads to",
                "effect": "Enhanced data protection and regulatory compliance"
            },
            {
                "cause": "Automated cloud backups lead to",
                "effect": "Improved disaster recovery and reduced data loss"
            },
            {
                "cause": "Identity federation implementation leads to",
                "effect": "Seamless cross-platform authentication and user mobility"
            },
            {
                "cause": "Infrastructure as code adoption leads to",
                "effect": "Consistent environments and reduced configuration drift"
            },
            {
                "cause": "Cloud-native security monitoring leads to",
                "effect": "Real-time threat detection and faster incident response"
            }
        ];

        this.negativeStatements = [
            {
                "cause": "Poor identity governance leads to",
                "effect": "Excessive user privileges and security vulnerabilities"
            },
            {
                "cause": "Inadequate CI/CD security controls lead to",
                "effect": "Vulnerable code deployment and production breaches"
            },
            {
                "cause": "Weak cloud access controls lead to",
                "effect": "Unauthorized data exposure and compliance violations"
            },
            {
                "cause": "Decentralized account management leads to",
                "effect": "Orphaned accounts and inconsistent access policies"
            },
            {
                "cause": "Improper app deployment practices lead to",
                "effect": "Service downtime and degraded user experience"
            },
            {
                "cause": "Insufficient data encryption leads to",
                "effect": "Data breaches and regulatory penalty risks"
            },
            {
                "cause": "Infrequent backup testing leads to",
                "effect": "Failed recovery attempts during critical incidents"
            },
            {
                "cause": "Misconfigured cloud permissions lead to",
                "effect": "Data leaks and unauthorized resource access"
            },
            {
                "cause": "Lack of network segmentation leads to",
                "effect": "Lateral movement of threats across systems"
            },
            {
                "cause": "Inadequate monitoring and logging lead to",
                "effect": "Delayed breach detection and prolonged incidents"
            }
        ];

        console.log(`Loaded ${this.positiveStatements.length} positive and ${this.negativeStatements.length} negative cloud adoption statements`);
    }

    generateRandomPipes() {
        this.pipes.clear();
        this.pipeStories.clear();
        this.pipePositions.clear(); // Clear previous pipe positions

        const occupiedSquares = new Set([1, 100]); // Don't put pipes on start/end squares
        const minDistance = 3; // Reduced minimum distance for better placement success
        
        // Row tracking sets to ensure unique start/end rows per pipe type
        const usedSnakeStartRows = new Set();
        const usedSnakeEndRows = new Set();
        const usedLadderStartRows = new Set();
        const usedLadderEndRows = new Set();

        // Generate 6-8 red pipes (snakes) - negative outcomes
        const targetSnakes = Math.floor(Math.random() * 3) + 6; // Random between 6-8
        const availableSnakes = Math.min(targetSnakes, this.negativeStatements.length);
        const usedNegativeStatements = [];
        let actualSnakes = 0;

        for (let i = 0; i < availableSnakes; i++) {
            let attempts = 0;
            let source, destination;

            // Try to find valid snake positions
            while (attempts < 500) { // Much higher attempts for better success rate
                // Smart placement: prefer edge areas first, then center areas
                // Snakes need room to go down to lower rows, so minimum should be row 1+ (square 11+)
                let sourceMin, sourceMax;
                if (attempts < 200) {
                    // First 200 attempts: prefer upper-edge areas (higher squares) 
                    sourceMin = 70; sourceMax = 98;
                } else if (attempts < 350) {
                    // Next 150 attempts: prefer middle-edge areas
                    sourceMin = 45; sourceMax = 69;
                } else {
                    // Final attempts: use full range (must be at least row 1 to have room to go down)
                    sourceMin = 11; sourceMax = 98;
                }

                source = Math.floor(Math.random() * (sourceMax - sourceMin + 1)) + sourceMin;

                // Calculate source row (0-based from bottom: row 0 = squares 1-10, row 1 = squares 11-20, etc.)
                const sourceRow = Math.floor((source - 1) / 10);

                // Check if source row is already used by another snake
                if (usedSnakeStartRows.has(sourceRow)) {
                    attempts++;
                    continue;
                }

                // Destination must be in a lower row (at most sourceRow - 1)
                const maxDestinationRow = sourceRow - 1;
                const minDestinationRow = 0; // Bottom row (squares 1-10)

                if (maxDestinationRow >= minDestinationRow) {
                    // Pick a random row below the source that's not already used
                    let availableDestRows = [];
                    for (let row = minDestinationRow; row <= maxDestinationRow; row++) {
                        if (!usedSnakeEndRows.has(row)) {
                            availableDestRows.push(row);
                        }
                    }
                    
                    if (availableDestRows.length === 0) {
                        attempts++;
                        continue; // No available destination rows
                    }
                    
                    const destinationRow = availableDestRows[Math.floor(Math.random() * availableDestRows.length)];

                    // Pick a random square within that row
                    const rowStartSquare = destinationRow * 10 + 1;
                    const rowEndSquare = (destinationRow + 1) * 10;
                    destination = Math.floor(Math.random() * (rowEndSquare - rowStartSquare + 1)) + rowStartSquare;

                    // Ensure minimum 3-square distance as well
                    if (source - destination < 3) {
                        destination = Math.max(source - 3, rowStartSquare);
                    }
                } else {
                    // Source is too low (row 0), skip this attempt
                    attempts = 500; // Force retry with different source
                    continue;
                }

                // Check if positions are available and have minimum distance
                const tooClose = Array.from(occupiedSquares).some(square =>
                    Math.abs(square - source) < minDistance || Math.abs(square - destination) < minDistance
                );

                // Check for path intersections with existing pipes
                let hasIntersection = false;
                for (const [existingSource, existingDest] of this.pipes) {
                    if (this.pipesWouldIntersect(source, destination, existingSource, existingDest)) {
                        hasIntersection = true;
                        break;
                    }
                }

                if (!tooClose && !occupiedSquares.has(source) && !occupiedSquares.has(destination) && !hasIntersection) {
                    break;
                }
                attempts++;
            }

            if (attempts < 500) {
                // Calculate rows for tracking
                const sourceRow = Math.floor((source - 1) / 10);
                const destinationRow = Math.floor((destination - 1) / 10);
                
                // Select random unused negative statement
                let statementIndex;
                do {
                    statementIndex = Math.floor(Math.random() * this.negativeStatements.length);
                } while (usedNegativeStatements.includes(statementIndex));

                usedNegativeStatements.push(statementIndex);
                const statement = this.negativeStatements[statementIndex];

                this.pipes.set(source, destination);
                this.pipeStories.set(source, { type: 'cause', text: statement.cause, isNegative: true });
                this.pipeStories.set(destination, { type: 'effect', text: statement.effect, isNegative: true });

                // Store consistent random positions for this pipe
                this.generateAndStorePipePositions(source, destination);

                occupiedSquares.add(source);
                occupiedSquares.add(destination);
                
                // Track used rows for snakes
                usedSnakeStartRows.add(sourceRow);
                usedSnakeEndRows.add(destinationRow);
                
                actualSnakes++;
            }
        }

        // Generate 8-10 green pipes (ladders) - positive outcomes
        const targetLadders = Math.floor(Math.random() * 3) + 8; // Random between 8-10
        const availableLadders = Math.min(targetLadders, this.positiveStatements.length);
        const usedPositiveStatements = [];
        let actualLadders = 0;

        for (let i = 0; i < availableLadders; i++) {
            let attempts = 0;
            let source, destination;

            // Try to find valid ladder positions
            while (attempts < 500) { // Much higher attempts for better success rate
                // Smart placement: prefer different areas than snakes to reduce crossings
                // Ladders need room to go up to higher rows, so maximum should be row 8 (square 80)
                let sourceMin, sourceMax;
                if (attempts < 200) {
                    // First 200 attempts: prefer lower-edge areas (lower squares)
                    sourceMin = 2; sourceMax = 30;
                } else if (attempts < 350) {
                    // Next 150 attempts: prefer middle-edge areas  
                    sourceMin = 31; sourceMax = 55;
                } else {
                    // Final attempts: use full range (must be at most row 8 to have room to go up)
                    sourceMin = 2; sourceMax = 80;
                }

                source = Math.floor(Math.random() * (sourceMax - sourceMin + 1)) + sourceMin;

                // Calculate source row (0-based from bottom: row 0 = squares 1-10, row 1 = squares 11-20, etc.)
                const sourceRow = Math.floor((source - 1) / 10);

                // Check if source row is already used by another ladder
                if (usedLadderStartRows.has(sourceRow)) {
                    attempts++;
                    continue;
                }

                // Destination must be in a higher row (at least sourceRow + 1)
                const minDestinationRow = sourceRow + 1;
                const maxDestinationRow = 9; // Top row (squares 91-100)

                if (minDestinationRow <= maxDestinationRow) {
                    // Pick a random row above the source that's not already used
                    let availableDestRows = [];
                    for (let row = minDestinationRow; row <= maxDestinationRow; row++) {
                        if (!usedLadderEndRows.has(row)) {
                            availableDestRows.push(row);
                        }
                    }
                    
                    if (availableDestRows.length === 0) {
                        attempts++;
                        continue; // No available destination rows
                    }
                    
                    const destinationRow = availableDestRows[Math.floor(Math.random() * availableDestRows.length)];

                    // Pick a random square within that row
                    const rowStartSquare = destinationRow * 10 + 1;
                    const rowEndSquare = Math.min((destinationRow + 1) * 10, 100);
                    destination = Math.floor(Math.random() * (rowEndSquare - rowStartSquare + 1)) + rowStartSquare;

                    // Ensure minimum 3-square distance, but don't allow going back to same or lower row
                    const minimumValidDestination = Math.max(source + 3, rowStartSquare);
                    if (destination < minimumValidDestination) {
                        // If we can't maintain both row constraint and distance constraint, skip this attempt
                        if (minimumValidDestination > rowEndSquare) {
                            attempts++;
                            continue;
                        }
                        destination = minimumValidDestination;
                    }

                    // Double-check: ensure destination is actually in a higher row
                    const destRow = Math.floor((destination - 1) / 10);
                    if (destRow <= sourceRow) {
                        attempts++;
                        continue;
                    }
                } else {
                    // Source is too high (row 9), skip this attempt
                    attempts = 500; // Force retry with different source
                    continue;
                }

                // Check if positions are available and have minimum distance
                const tooClose = Array.from(occupiedSquares).some(square =>
                    Math.abs(square - source) < minDistance || Math.abs(square - destination) < minDistance
                );

                // Check for path intersections with existing pipes
                let hasIntersection = false;
                for (const [existingSource, existingDest] of this.pipes) {
                    if (this.pipesWouldIntersect(source, destination, existingSource, existingDest)) {
                        hasIntersection = true;
                        break;
                    }
                }

                if (!tooClose && !occupiedSquares.has(source) && !occupiedSquares.has(destination) && !hasIntersection) {
                    break;
                }
                attempts++;
            }

            if (attempts < 500) {
                // Calculate rows for tracking
                const sourceRow = Math.floor((source - 1) / 10);
                const destinationRow = Math.floor((destination - 1) / 10);
                
                // Select random unused positive statement
                let statementIndex;
                do {
                    statementIndex = Math.floor(Math.random() * this.positiveStatements.length);
                } while (usedPositiveStatements.includes(statementIndex));

                usedPositiveStatements.push(statementIndex);
                const statement = this.positiveStatements[statementIndex];

                this.pipes.set(source, destination);
                this.pipeStories.set(source, { type: 'cause', text: statement.cause, isNegative: false });
                this.pipeStories.set(destination, { type: 'effect', text: statement.effect, isNegative: false });

                // Store consistent random positions for this pipe
                this.generateAndStorePipePositions(source, destination);

                occupiedSquares.add(source);
                occupiedSquares.add(destination);
                
                // Track used rows for ladders
                usedLadderStartRows.add(sourceRow);
                usedLadderEndRows.add(destinationRow);
                
                actualLadders++;
            }
        }

        // If we didn't generate enough pipes, try again with more relaxed constraints
        if (actualSnakes < 6 || actualLadders < 8) {
            console.log(`First attempt failed. Got ${actualSnakes} snakes and ${actualLadders} ladders. Trying with relaxed constraints...`);
            this.generatePipesWithRelaxedConstraints(targetSnakes, targetLadders, actualSnakes, actualLadders, occupiedSquares, usedNegativeStatements, usedPositiveStatements, usedSnakeStartRows, usedSnakeEndRows, usedLadderStartRows, usedLadderEndRows);
        }

        console.log(`Final result: ${this.pipes.size} pipes: ${actualSnakes} snakes (target: ${targetSnakes}) and ${actualLadders} ladders (target: ${targetLadders})`);

        // Debug: Log all pipe positions and their rows
        console.log('=== SNAKES ===');
        this.pipes.forEach((destination, start) => {
            if (destination < start) { // Snake
                const startRow = Math.floor((start - 1) / 10);
                const destRow = Math.floor((destination - 1) / 10);
                console.log(`Snake: ${start} (row ${startRow}) → ${destination} (row ${destRow})`);
            }
        });
        
        console.log('=== LADDERS ===');
        this.pipes.forEach((destination, start) => {
            if (destination > start) { // Ladder
                const startRow = Math.floor((start - 1) / 10);
                const destRow = Math.floor((destination - 1) / 10);
                console.log(`Ladder: ${start} (row ${startRow}) → ${destination} (row ${destRow})`);
            }
        });
    }

    generatePipesWithRelaxedConstraints(targetSnakes, targetLadders, currentSnakes, currentLadders, occupiedSquares, usedNegativeStatements, usedPositiveStatements, usedSnakeStartRows, usedSnakeEndRows, usedLadderStartRows, usedLadderEndRows) {
        // Use minimal distance and any available positions
        let actualSnakes = currentSnakes;
        let actualLadders = currentLadders;

        // Try to add more snakes if needed
        while (actualSnakes < 6 && usedNegativeStatements.length < this.negativeStatements.length) {
            for (let source = 90; source > 10 && actualSnakes < targetSnakes; source -= 5) {
                const sourceRow = Math.floor((source - 1) / 10);
                // Skip if source row is already used
                if (usedSnakeStartRows.has(sourceRow)) continue;
                
                for (let destination = 2; destination < source - 3 && actualSnakes < targetSnakes; destination += 5) {
                    const destinationRow = Math.floor((destination - 1) / 10);
                    // Skip if destination row is already used or not lower than source
                    if (usedSnakeEndRows.has(destinationRow) || destinationRow >= sourceRow) continue;
                    
                    if (!occupiedSquares.has(source) && !occupiedSquares.has(destination)) {
                        let statementIndex;
                        do {
                            statementIndex = Math.floor(Math.random() * this.negativeStatements.length);
                        } while (usedNegativeStatements.includes(statementIndex));

                        usedNegativeStatements.push(statementIndex);
                        const statement = this.negativeStatements[statementIndex];

                        this.pipes.set(source, destination);
                        this.pipeStories.set(source, { type: 'cause', text: statement.cause, isNegative: true });
                        this.pipeStories.set(destination, { type: 'effect', text: statement.effect, isNegative: true });

                        // Store consistent random positions for this pipe
                        this.generateAndStorePipePositions(source, destination);

                        occupiedSquares.add(source);
                        occupiedSquares.add(destination);
                        
                        // Track used rows for snakes
                        usedSnakeStartRows.add(sourceRow);
                        usedSnakeEndRows.add(destinationRow);
                        
                        actualSnakes++;
                        break;
                    }
                }
            }
            break; // Prevent infinite loop
        }

        // Try to add more ladders if needed
        while (actualLadders < 8 && usedPositiveStatements.length < this.positiveStatements.length) {
            for (let source = 5; source < 80 && actualLadders < targetLadders; source += 5) {
                // Ensure destination is in a higher row
                const sourceRow = Math.floor((source - 1) / 10);
                // Skip if source row is already used
                if (usedLadderStartRows.has(sourceRow)) continue;
                
                const minDestRow = sourceRow + 1;
                const minDestination = minDestRow * 10 + 1;
                for (let destination = Math.max(minDestination, source + 5); destination < 99 && actualLadders < targetLadders; destination += 5) {
                    const destRow = Math.floor((destination - 1) / 10);
                    // Skip if destination row is already used
                    if (usedLadderEndRows.has(destRow)) continue;
                    
                    if (!occupiedSquares.has(source) && !occupiedSquares.has(destination) && destRow > sourceRow) {
                        let statementIndex;
                        do {
                            statementIndex = Math.floor(Math.random() * this.positiveStatements.length);
                        } while (usedPositiveStatements.includes(statementIndex));

                        usedPositiveStatements.push(statementIndex);
                        const statement = this.positiveStatements[statementIndex];

                        this.pipes.set(source, destination);
                        this.pipeStories.set(source, { type: 'cause', text: statement.cause, isNegative: false });
                        this.pipeStories.set(destination, { type: 'effect', text: statement.effect, isNegative: false });

                        // Store consistent random positions for this pipe
                        this.generateAndStorePipePositions(source, destination);

                        occupiedSquares.add(source);
                        occupiedSquares.add(destination);
                        
                        // Track used rows for ladders
                        usedLadderStartRows.add(sourceRow);
                        usedLadderEndRows.add(destRow);
                        
                        actualLadders++;
                        break;
                    }
                }
            }
            break; // Prevent infinite loop
        }

        console.log(`Relaxed constraints generated ${actualSnakes - currentSnakes} additional snakes and ${actualLadders - currentLadders} additional ladders`);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    getSquarePosition(square) {
        // Find which visual row and column this square should appear in
        // Based on the serpentine pattern: 100-91 (row 0), 81-90 (row 1), etc.

        const mathRow = Math.floor((square - 1) / 10); // 0-9 from bottom
        const mathCol = (square - 1) % 10; // 0-9 from left in math terms

        const visualRow = 9 - mathRow; // Convert to visual row (0=top, 9=bottom)
        let visualCol;

        if (mathRow % 2 === 0) {
            // Even math rows (1-10, 21-30, etc): left to right in visual
            visualCol = mathCol;
        } else {
            // Odd math rows (11-20, 31-40, etc): right to left in visual  
            visualCol = 9 - mathCol;
        }

        return { row: visualRow, col: visualCol };
    }

    getSquareArrowDirection(square) {
        // Return the direction a player should move from this square
        // Based on the serpentine (snake-like) board layout
        
        if (square === 100) {
            // Final square has no arrow
            return null;
        }

        // Special cases for squares that transition to the next row
        const rowTransitionSquares = [10, 20, 30, 40, 50, 60, 70, 80, 90];
        if (rowTransitionSquares.includes(square)) {
            return 'up';
        }

        const mathRow = Math.floor((square - 1) / 10); // 0-9 from bottom

        if (mathRow % 2 === 0) {
            // Even math rows (1-10, 21-30, 41-50, 61-70, 81-90): left to right movement
            return 'right';
        } else {
            // Odd math rows (11-20, 31-40, 51-60, 71-80, 91-100): right to left movement  
            return 'left';
        }
    }

    rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    setupPlayers(playerNames) {
        this.players = playerNames.map(name => ({
            name: name,
            position: 0
        }));
    }

    movePlayer(playerIndex, steps) {
        const newPosition = this.players[playerIndex].position + steps;
        if (newPosition <= 100) {
            this.players[playerIndex].position = newPosition;
        }
    }

    checkPipeTransport(playerIndex) {
        const currentPosition = this.players[playerIndex].position;
        if (this.pipes.has(currentPosition)) {
            const destination = this.pipes.get(currentPosition);
            const causeStory = this.pipeStories.get(currentPosition);
            const effectStory = this.pipeStories.get(destination);

            // Show educational message
            this.showEducationalMessage(causeStory, effectStory, destination > currentPosition);

            this.players[playerIndex].position = destination;
        }
    }

    showEducationalMessage(causeStory, effectStory, isPositive) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `educational-message ${isPositive ? 'positive' : 'negative'}`;
        messageDiv.innerHTML = `
            <div class="story-content">
                <h3>${isPositive ? '🚀 Positive Outcome!' : '⚠️ Negative Consequence!'}</h3>
                <p><strong>Cause:</strong> ${causeStory.text}</p>
                <p><strong>Effect:</strong> ${effectStory.text}</p>
                <button onclick="this.parentElement.parentElement.remove()" class="close-message">Continue</button>
            </div>
        `;

        document.body.appendChild(messageDiv);

        // Auto-remove after 5 seconds if not manually closed
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }

    getCurrentPlayer() {
        if (this.players.length === 0) {
            return null;
        }
        return this.players[this.currentPlayerIndex];
    }

    nextTurn() {
        if (this.players.length > 0) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
    }

    checkWinCondition() {
        for (const player of this.players) {
            if (player.position === 100) {
                return player.name;
            }
        }
        return null;
    }

    initializeUI() {
        if (typeof document !== 'undefined') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.setupWelcomeScreen();
            });

            // Handle window resize to recalculate pipe positions
            window.addEventListener('resize', () => {
                // Debounce resize events
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    if (document.getElementById('game-screen').classList.contains('active')) {
                        // Regenerate pipe positions for new board size
                        this.regeneratePipePositions();
                        this.drawPipes();
                    }
                }, 100);
            });
        }
    }

    setupEventListeners() {
        const startButton = document.getElementById('start-game');
        const rollDiceButton = document.getElementById('roll-dice');
        const newGameButton = document.getElementById('new-game');
        const playerCountInput = document.getElementById('player-count');
        const toggleInstructionsButton = document.getElementById('toggle-instructions');

        if (playerCountInput) {
            playerCountInput.addEventListener('change', () => {
                this.updatePlayerNameInputs();
            });
        }

        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        if (rollDiceButton) {
            rollDiceButton.addEventListener('click', () => {
                this.handleDiceRoll();
            });
        }
        
        // Add spacebar support for rolling dice
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && document.getElementById('game-screen').classList.contains('active')) {
                event.preventDefault(); // Prevent page scrolling
                const rollButton = document.getElementById('roll-dice');
                if (rollButton && !rollButton.disabled) {
                    this.handleDiceRoll();
                }
            }
        });

        if (newGameButton) {
            newGameButton.addEventListener('click', () => {
                this.resetGame();
            });
        }

        if (toggleInstructionsButton) {
            toggleInstructionsButton.addEventListener('click', () => {
                this.toggleInstructions();
            });
        }
    }

    setupWelcomeScreen() {
        // Ensure welcome screen is explicitly active
        this.showScreen('welcome-screen');

        // Update player name inputs for welcome screen
        this.updatePlayerNameInputs();

        // Prepare empty board in background (but keep it hidden)
        this.prepareBackgroundBoard();

        // Draw pipes after a short delay to ensure DOM is ready
        setTimeout(() => this.drawPipes(), 100);
    }

    updatePlayerNameInputs() {
        const playerCount = parseInt(document.getElementById('player-count').value);
        const playerNamesContainer = document.getElementById('player-names');

        playerNamesContainer.innerHTML = '';

        for (let i = 1; i <= playerCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-name-input';
            input.placeholder = `Player ${i} Name`;
            input.value = `Player ${i}`;
            input.id = `player-${i}-name`;
            playerNamesContainer.appendChild(input);
        }
    }

    startGame() {
        const playerCount = parseInt(document.getElementById('player-count').value);
        const playerNames = [];

        for (let i = 1; i <= playerCount; i++) {
            const name = document.getElementById(`player-${i}-name`).value || `Player ${i}`;
            playerNames.push(name);
        }

        // Generate new random pipes for this game
        this.generateRandomPipes();

        this.setupPlayers(playerNames);
        this.gameActuallyStarted = false; // Reset at start of new game
        this.isAnimating = false; // Reset animation state
        this.startTimer(); // Start the game timer
        this.showScreen('game-screen');
        this.renderBoard();
        this.updateGameStatus();

        // Draw pipes after DOM is ready
        setTimeout(() => {
            this.drawPipes();
        }, 200);
    }

    showScreen(screenId) {
        // Always ensure game screen is visible (for background)
        document.getElementById('game-screen').classList.add('active');

        if (screenId === 'game-screen') {
            // Hide all overlays when showing just the game
            document.getElementById('welcome-screen').classList.remove('active');
            document.getElementById('win-screen').classList.remove('active');
        } else if (screenId === 'welcome-screen') {
            // Show welcome overlay, hide win overlay
            document.getElementById('welcome-screen').classList.add('active');
            document.getElementById('win-screen').classList.remove('active');
        } else if (screenId === 'win-screen') {
            // Show win overlay, hide welcome overlay
            document.getElementById('win-screen').classList.add('active');
            document.getElementById('welcome-screen').classList.remove('active');
        }
    }

    prepareBackgroundBoard() {
        // Simple square creation - CSS handles all positioning
        const gameBoard = document.getElementById('game-board');

        // Clear only squares, keep pipes-container
        const squares = gameBoard.querySelectorAll('.square');
        squares.forEach(square => square.remove());

        // Ensure pipes container exists
        let pipesContainer = document.getElementById('pipes-container');
        if (!pipesContainer) {
            pipesContainer = document.createElement('div');
            pipesContainer.id = 'pipes-container';
            gameBoard.appendChild(pipesContainer);
        }

        // Create squares 1-100 in any order - CSS Grid positioning handles layout
        for (let square = 1; square <= 100; square++) {
            const squareElement = document.createElement('div');
            squareElement.className = 'square';
            squareElement.id = `square-${square}`;

            // Add directional arrow class based on board flow
            const arrowDirection = this.getSquareArrowDirection(square);
            if (arrowDirection) {
                squareElement.classList.add(`arrow-${arrowDirection}`);
            }

            // Create square number element (always in top-left)
            const numberElement = document.createElement('div');
            numberElement.className = 'square-number';
            numberElement.textContent = square;
            squareElement.appendChild(numberElement);

            // Check if this square has a story (cause or effect) or is the winning square
            if (square === 100) {
                // Special handling for the winning square
                const contentElement = document.createElement('div');
                contentElement.className = 'square-content win-square';
                contentElement.textContent = 'WIN';
                contentElement.title = 'Winning square!';
                squareElement.appendChild(contentElement);
                squareElement.classList.add('win-square');
            } else if (this.pipeStories.has(square)) {
                const story = this.pipeStories.get(square);
                
                // Create content element for story text
                const contentElement = document.createElement('div');
                contentElement.className = 'square-content';
                contentElement.textContent = story.text;
                contentElement.title = story.text; // Keep tooltip for consistency
                squareElement.appendChild(contentElement);

                // Add styling based on story type
                if (story.isNegative) {
                    squareElement.classList.add(story.type === 'cause' ? 'negative-cause' : 'negative-effect');
                } else {
                    squareElement.classList.add(story.type === 'cause' ? 'positive-cause' : 'positive-effect');
                }
            }

            gameBoard.appendChild(squareElement);
        }

        // Add pipe indicators using CSS
        this.addPipeIndicators();
    }

    renderEmptyBoard() {
        this.prepareBackgroundBoard();
    }

    renderBoard() {
        this.renderEmptyBoard();
        this.renderPlayerTokens();
        // Ensure pipes are drawn after board is rendered
        setTimeout(() => this.drawPipes(), 50);
    }

    addPipeIndicators() {
        // Add CSS classes to squares that have pipes
        this.pipes.forEach((destination, start) => {
            const startSquare = document.getElementById(`square-${start}`);
            const destSquare = document.getElementById(`square-${destination}`);

            if (startSquare && destSquare) {
                if (destination < start) {
                    // Snake
                    startSquare.classList.add('has-snake');
                    startSquare.dataset.pipeTo = destination;
                    startSquare.title = `Snake: ${start} → ${destination}`;

                    // Highlight destination square
                    destSquare.classList.add('pipe-destination', 'snake');
                } else {
                    // Ladder
                    startSquare.classList.add('has-ladder');
                    startSquare.dataset.pipeTo = destination;
                    startSquare.title = `Ladder: ${start} → ${destination}`;

                    // Highlight destination square
                    destSquare.classList.add('pipe-destination', 'ladder');
                }
            }
        });

        // Draw SVG pipes after adding indicators
        this.drawPipes();
    }

    getSquareCenter(squareNumber) {
        const squareElement = document.getElementById(`square-${squareNumber}`);
        if (!squareElement) {
            console.error(`Square ${squareNumber} not found!`);
            return null;
        }

        const boardElement = document.getElementById('game-board');
        if (!boardElement) {
            console.error('Game board not found!');
            return null;
        }

        const boardRect = boardElement.getBoundingClientRect();
        const squareRect = squareElement.getBoundingClientRect();

        // Calculate center relative to the game board
        const centerX = squareRect.left + squareRect.width / 2 - boardRect.left;
        const centerY = squareRect.top + squareRect.height / 2 - boardRect.top;

        return { x: centerX, y: centerY };
    }
    
    getRandomSquarePosition(squareNumber, margin = 0.3) {
        const squareElement = document.getElementById(`square-${squareNumber}`);
        if (!squareElement) {
            console.error(`Square ${squareNumber} not found!`);
            return null;
        }

        const boardElement = document.getElementById('game-board');
        if (!boardElement) {
            console.error('Game board not found!');
            return null;
        }

        const boardRect = boardElement.getBoundingClientRect();
        const squareRect = squareElement.getBoundingClientRect();

        // Calculate square dimensions
        const squareWidth = squareRect.width;
        const squareHeight = squareRect.height;
        
        // Define the usable area within the square (avoiding edges) - increased margin for pipe safety
        const safeMargin = Math.max(margin, 0.35); // Minimum 35% margin for pipe containment
        const usableWidth = squareWidth * (1 - 2 * safeMargin);
        const usableHeight = squareHeight * (1 - 2 * safeMargin);
        
        // Ensure minimum usable area
        if (usableWidth <= 0 || usableHeight <= 0) {
            // Fallback to center if margins are too large
            const centerX = squareWidth / 2;
            const centerY = squareHeight / 2;
            const posX = squareRect.left + centerX - boardRect.left;
            const posY = squareRect.top + centerY - boardRect.top;
            return { x: posX, y: posY };
        }
        
        // Generate random position within the safe usable area
        const randomX = (Math.random() * usableWidth) + (squareWidth * safeMargin);
        const randomY = (Math.random() * usableHeight) + (squareHeight * safeMargin);
        
        // Calculate position relative to the game board
        const posX = squareRect.left + randomX - boardRect.left;
        const posY = squareRect.top + randomY - boardRect.top;

        return { x: posX, y: posY };
    }
    
    generateAndStorePipePositions(start, destination) {
        // Generate and store consistent random positions for a pipe with larger margins to prevent boundary crossing
        const startPos = this.getRandomSquarePosition(start, 0.4); // 40% margin for better containment
        const destPos = this.getRandomSquarePosition(destination, 0.4); // 40% margin for better containment
        
        if (startPos && destPos) {
            this.pipePositions.set(`${start}-start`, startPos);
            this.pipePositions.set(`${destination}-end`, destPos);
        }
    }
    
    getPipePosition(squareNumber, isStart = true) {
        // Get stored random position for a pipe endpoint, with fallback to center
        const key = `${squareNumber}-${isStart ? 'start' : 'end'}`;
        const storedPos = this.pipePositions.get(key);
        
        if (storedPos) {
            return storedPos;
        }
        
        // Fallback to center position if random position not available
        return this.getSquareCenter(squareNumber);
    }
    
    regeneratePipePositions() {
        // Regenerate all pipe positions for the current board size
        this.pipePositions.clear();
        
        // Regenerate positions for all existing pipes
        this.pipes.forEach((destination, start) => {
            this.generateAndStorePipePositions(start, destination);
        });
    }

    calculatePipePath(start, destination, lane = 0) {
        // Calculate the path rectangles a pipe would occupy (without creating DOM elements)
        const startCenter = this.getPipePosition(start, true);
        const endCenter = this.getPipePosition(destination, false);

        if (!startCenter || !endCenter) return null;

        // Calculate responsive pipe thickness based on board size
        const boardElement = document.getElementById('game-board');
        const boardWidth = boardElement ? boardElement.getBoundingClientRect().width : 800;
        const pipeThickness = Math.max(4, Math.min(12, boardWidth / 100)); // Scale between 4-12px based on board size
        
        const pipeType = destination < start ? 'snake' : 'ladder';
        
        // Calculate responsive lane spacing based on board size, but limit to prevent boundary crossing
        const maxLaneSpacing = Math.min(boardWidth / 200, 10); // Limit max spacing to prevent overflow
        const laneSpacing = Math.max(4, maxLaneSpacing); // Scale between 4-10px based on board size
        const laneOffset = lane * laneSpacing;
        
        // Add vertical offset to prevent overlapping pipes + lane offset, but constrain to stay within square boundaries
        const squareSize = boardWidth / 10; // Approximate square size
        const maxOffset = Math.min(squareSize * 0.2, laneOffset); // Limit offset to 20% of square size
        const baseVerticalOffset = pipeType === 'snake' ? -2 : 2;
        const verticalOffset = baseVerticalOffset + (Math.min(maxOffset, laneOffset) * (pipeType === 'snake' ? -1 : 1));
        
        const useVerticalFirst = (pipeType === 'ladder');

        let cornerX, cornerY;
        if (useVerticalFirst) {
            cornerX = startCenter.x;
            cornerY = endCenter.y;
        } else {
            cornerX = endCenter.x;
            cornerY = startCenter.y;
        }

        // Calculate segment rectangles
        const segments = [];
        if (useVerticalFirst) {
            // Vertical segment
            segments.push({
                left: startCenter.x - pipeThickness / 2,
                top: Math.min(startCenter.y, cornerY + verticalOffset),
                right: startCenter.x + pipeThickness / 2,
                bottom: Math.max(startCenter.y, cornerY + verticalOffset)
            });
            // Horizontal segment  
            segments.push({
                left: Math.min(cornerX, endCenter.x),
                top: cornerY + verticalOffset - pipeThickness / 2,
                right: Math.max(cornerX, endCenter.x),
                bottom: cornerY + verticalOffset + pipeThickness / 2
            });
        } else {
            // Horizontal segment
            segments.push({
                left: Math.min(startCenter.x, cornerX),
                top: startCenter.y + verticalOffset - pipeThickness / 2,
                right: Math.max(startCenter.x, cornerX),
                bottom: startCenter.y + verticalOffset + pipeThickness / 2
            });
            // Vertical segment
            segments.push({
                left: cornerX - pipeThickness / 2,
                top: Math.min(cornerY + verticalOffset, endCenter.y),
                right: cornerX + pipeThickness / 2,
                bottom: Math.max(cornerY + verticalOffset, endCenter.y)
            });
        }

        return segments;
    }

    rectanglesIntersect(rect1, rect2) {
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    }

    pipesWouldIntersect(start1, dest1, start2, dest2) {
        const path1 = this.calculatePipePath(start1, dest1);
        const path2 = this.calculatePipePath(start2, dest2);

        if (!path1 || !path2) return false;

        // Check if any segment from path1 intersects with any segment from path2
        for (const seg1 of path1) {
            for (const seg2 of path2) {
                if (this.rectanglesIntersect(seg1, seg2)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    findPipeIntersections(start1, dest1, start2, dest2) {
        const path1 = this.calculatePipePath(start1, dest1);
        const path2 = this.calculatePipePath(start2, dest2);
        
        if (!path1 || !path2) return [];
        
        const intersections = [];
        for (let i = 0; i < path1.length; i++) {
            for (let j = 0; j < path2.length; j++) {
                if (this.rectanglesIntersect(path1[i], path2[j])) {
                    intersections.push({
                        pipe1Segment: i,
                        pipe2Segment: j,
                        rect1: path1[i],
                        rect2: path2[j],
                        centerX: (Math.max(path1[i].left, path2[j].left) + Math.min(path1[i].right, path2[j].right)) / 2,
                        centerY: (Math.max(path1[i].top, path2[j].top) + Math.min(path1[i].bottom, path2[j].bottom)) / 2
                    });
                }
            }
        }
        return intersections;
    }
    
    assignPipeLanes() {
        // Create a map to store lane assignments for each pipe
        const pipeLanes = new Map();
        const pipes = Array.from(this.pipes.entries());
        
        // Initialize all pipes with lane 0 (center)
        pipes.forEach(([start, dest]) => {
            pipeLanes.set(`${start}-${dest}`, 0);
        });
        
        // Find intersecting pipes and assign them to different lanes
        for (let i = 0; i < pipes.length; i++) {
            for (let j = i + 1; j < pipes.length; j++) {
                const [start1, dest1] = pipes[i];
                const [start2, dest2] = pipes[j];
                
                const intersections = this.findPipeIntersections(start1, dest1, start2, dest2);
                if (intersections.length > 0) {
                    // Pipes intersect - assign them to different lanes
                    const pipe1Key = `${start1}-${dest1}`;
                    const pipe2Key = `${start2}-${dest2}`;
                    
                    const lane1 = pipeLanes.get(pipe1Key);
                    const lane2 = pipeLanes.get(pipe2Key);
                    
                    // If both pipes are in the same lane, move one to a different lane
                    if (lane1 === lane2) {
                        // Move the second pipe to the next available lane
                        let newLane = 1;
                        const usedLanes = new Set(Array.from(pipeLanes.values()));
                        while (usedLanes.has(newLane)) {
                            newLane++;
                        }
                        pipeLanes.set(pipe2Key, newLane);
                    }
                }
            }
        }
        
        return pipeLanes;
    }

    createRightAnglePipe(start, destination, laneAssignments = null) {
        const startCenter = this.getPipePosition(start, true);
        const endCenter = this.getPipePosition(destination, false);

        if (!startCenter || !endCenter) return [];

        // Calculate responsive pipe thickness based on board size
        const boardElement = document.getElementById('game-board');
        const boardWidth = boardElement ? boardElement.getBoundingClientRect().width : 800;
        const pipeThickness = Math.max(4, Math.min(12, boardWidth / 100)); // Scale between 4-12px based on board size
        
        const pipeType = destination < start ? 'snake' : 'ladder';

        // Get lane assignment for this pipe (default to lane 0)
        const pipeKey = `${start}-${destination}`;
        const lane = laneAssignments ? (laneAssignments.get(pipeKey) || 0) : 0;
        
        // Calculate responsive lane spacing based on board size, but limit to prevent boundary crossing
        const maxLaneSpacing = Math.min(boardWidth / 200, 10); // Limit max spacing to prevent overflow
        const laneSpacing = Math.max(4, maxLaneSpacing); // Scale between 4-10px based on board size
        const laneOffset = lane * laneSpacing;
        
        // Add vertical offset to prevent overlapping pipes + lane offset, but constrain to stay within square boundaries
        const squareSize = boardWidth / 10; // Approximate square size
        const maxOffset = Math.min(squareSize * 0.2, laneOffset); // Limit offset to 20% of square size
        const baseVerticalOffset = pipeType === 'snake' ? -2 : 2;
        const verticalOffset = baseVerticalOffset + (Math.min(maxOffset, laneOffset) * (pipeType === 'snake' ? -1 : 1));

        // Different routing patterns to reduce overlaps:
        // Snakes: horizontal-first (go horizontal, then vertical)
        // Ladders: vertical-first (go vertical, then horizontal)
        const useVerticalFirst = (pipeType === 'ladder');

        // Create segments and joint
        const segment1 = document.createElement('div');
        segment1.className = `pipe-segment ${pipeType}` + (lane > 0 ? ` lane-${lane}` : '');
        const segment2 = document.createElement('div');
        segment2.className = `pipe-segment ${pipeType}` + (lane > 0 ? ` lane-${lane}` : '');
        const joint = document.createElement('div');
        joint.className = `pipe-joint ${pipeType}` + (lane > 0 ? ` lane-${lane}` : '');

        let cornerX, cornerY;

        if (useVerticalFirst) {
            // LADDERS: Vertical-first routing (go vertical, then horizontal)
            cornerX = startCenter.x; // Corner aligned with start column
            cornerY = endCenter.y;   // Corner aligned with destination row
        } else {
            // SNAKES: Horizontal-first routing (go horizontal, then vertical)  
            cornerX = endCenter.x;   // Corner aligned with destination column
            cornerY = startCenter.y; // Corner aligned with start row
        }

        if (useVerticalFirst) {
            // LADDERS: Vertical-first routing
            // Segment1: Vertical from start to corner
            const v1Left = startCenter.x - pipeThickness / 2;
            const v1Top = Math.min(startCenter.y, cornerY + verticalOffset);
            const v1Height = Math.abs(cornerY + verticalOffset - startCenter.y);
            segment1.style.left = `${v1Left}px`;
            segment1.style.top = `${v1Top}px`;
            segment1.style.width = `${pipeThickness}px`;
            segment1.style.height = `${v1Height}px`;

            // Segment2: Horizontal from corner to destination
            const h2Left = Math.min(cornerX, endCenter.x);
            const h2Top = cornerY + verticalOffset - pipeThickness / 2;
            const h2Width = Math.abs(endCenter.x - cornerX);
            segment2.style.left = `${h2Left}px`;
            segment2.style.top = `${h2Top}px`;
            segment2.style.width = `${h2Width}px`;
            segment2.style.height = `${pipeThickness}px`;

            // Joint at corner
            const jLeft = cornerX - pipeThickness / 2;
            const jTop = cornerY + verticalOffset - pipeThickness / 2;
            joint.style.left = `${jLeft}px`;
            joint.style.top = `${jTop}px`;

        } else {
            // SNAKES: Horizontal-first routing
            // Segment1: Horizontal from start to corner
            const h1Left = Math.min(startCenter.x, cornerX);
            const h1Top = startCenter.y + verticalOffset - pipeThickness / 2;
            const h1Width = Math.abs(cornerX - startCenter.x);
            segment1.style.left = `${h1Left}px`;
            segment1.style.top = `${h1Top}px`;
            segment1.style.width = `${h1Width}px`;
            segment1.style.height = `${pipeThickness}px`;

            // Segment2: Vertical from corner to destination  
            const v2Left = cornerX - pipeThickness / 2;
            const v2Top = Math.min(cornerY + verticalOffset, endCenter.y);
            const v2Height = Math.abs(endCenter.y - (cornerY + verticalOffset));
            segment2.style.left = `${v2Left}px`;
            segment2.style.top = `${v2Top}px`;
            segment2.style.width = `${pipeThickness}px`;
            segment2.style.height = `${v2Height}px`;

            // Joint at corner
            const jLeft = cornerX - pipeThickness / 2;
            const jTop = cornerY + verticalOffset - pipeThickness / 2;
            joint.style.left = `${jLeft}px`;
            joint.style.top = `${jTop}px`;
        }

        // Common joint styling
        joint.style.width = `${pipeThickness}px`;
        joint.style.height = `${pipeThickness}px`;

        // Create arrowhead at destination
        const arrow = document.createElement('div');
        arrow.className = `pipe-arrow ${pipeType}` + (lane > 0 ? ` lane-${lane}` : '');

        // Position arrow at destination center, adjusted for lane offset
        // Calculate responsive arrow size based on board size
        const arrowWidth = Math.max(8, Math.min(20, boardWidth / 50)); // Scale between 8-20px based on board size
        const arrowHeight = Math.max(6, Math.min(15, boardWidth / 67)); // Scale between 6-15px based on board size
        
        const arrowLeft = endCenter.x - (arrowWidth / 2); // Center the arrow
        let arrowTop = endCenter.y - arrowHeight; // Center the arrow
        
        // Adjust arrow position based on final approach direction and lane offset
        if (useVerticalFirst) {
            // LADDERS: Final segment is horizontal (corner to destination)
            // Arrow should align with the horizontal segment's vertical position
            arrowTop = (cornerY + verticalOffset) - arrowHeight; // Align with horizontal segment
        } else {
            // SNAKES: Final segment is vertical (corner to destination)  
            // Arrow stays at destination center since vertical segment ends there
            arrowTop = endCenter.y - arrowHeight; // Keep at destination center
        }
        
        // Set responsive arrow size using CSS custom properties and border styling
        arrow.style.setProperty('--arrow-width', `${arrowWidth}px`);
        arrow.style.setProperty('--arrow-height', `${arrowHeight}px`);
        
        // Create responsive arrow using borders
        if (pipeType === 'snake') {
            arrow.style.borderLeft = `${arrowWidth}px solid rgba(255, 68, 68, 0.45)`;
            arrow.style.borderTop = `${arrowHeight}px solid transparent`;
            arrow.style.borderBottom = `${arrowHeight}px solid transparent`;
        } else {
            arrow.style.borderLeft = `${arrowWidth}px solid rgba(0, 206, 209, 0.45)`;
            arrow.style.borderTop = `${arrowHeight}px solid transparent`;
            arrow.style.borderBottom = `${arrowHeight}px solid transparent`;
        }
        
        arrow.style.left = `${arrowLeft}px`;
        arrow.style.top = `${arrowTop}px`;

        // Rotate arrow based on the final approach direction
        let rotation = 0;
        if (useVerticalFirst) {
            // LADDERS: Final segment is horizontal (corner to destination)
            rotation = endCenter.x < cornerX ? 180 : 0; // Point left or right
        } else {
            // SNAKES: Final segment is vertical (corner to destination)  
            rotation = endCenter.y < (cornerY + verticalOffset) ? -90 : 90; // Point up or down
        }
        arrow.style.transform = `rotate(${rotation}deg)`;

        return [segment1, segment2, joint, arrow];
    }

    drawPipes() {
        const pipesContainer = document.getElementById('pipes-container');
        if (!pipesContainer) {
            console.error('Pipes container not found!');
            return;
        }

        // Clear existing pipes
        pipesContainer.innerHTML = '';
        
        // Assign lanes to prevent visual overlaps
        const laneAssignments = this.assignPipeLanes();
        
        console.log('Lane assignments:', Array.from(laneAssignments.entries()));

        // Create right-angle pipes for each snake and ladder with lane assignments
        this.pipes.forEach((destination, start) => {
            const pipeSegments = this.createRightAnglePipe(start, destination, laneAssignments);
            pipeSegments.forEach(segment => {
                pipesContainer.appendChild(segment);
            });
        });
    }

    renderPlayerTokens() {
        // Remove existing tokens that don't have data-player (old tokens)
        document.querySelectorAll('.player-token:not([data-player])').forEach(token => token.remove());
        
        // Remove existing current player arrows
        document.querySelectorAll('.current-player-arrow').forEach(arrow => arrow.remove());

        // Determine current leader (highest position)
        const leaderPosition = Math.max(...this.players.map(p => p.position));
        const leaders = this.players.filter(p => p.position === leaderPosition && p.position > 0);
        const isMultipleLeaders = leaders.length > 1;

        this.players.forEach((player, index) => {
            // Only render tokens for players who are on the board (position > 0)
            if (player.position > 0) {
                const squareElement = document.getElementById(`square-${player.position}`);
                if (!squareElement) return;

                // Check if token already exists for this player
                let tokenElement = document.querySelector(`.player-token[data-player="${index}"]`);

                if (!tokenElement) {
                    // Create new token
                    tokenElement = document.createElement('div');
                    tokenElement.className = `player-token player-${index + 1}`;
                    tokenElement.dataset.player = index;
                }
                
                // Reset classes for proper state management
                tokenElement.className = `player-token player-${index + 1}`;
                
                // Add crown to current leader (only if there's a single leader)
                const isLeader = player.position === leaderPosition && !isMultipleLeaders && player.position > 0;
                if (isLeader) {
                    tokenElement.classList.add('leader');
                }
                
                // Set player name text (truncate if too long)
                let displayName = player.name;
                if (displayName.length > 8) {
                    displayName = displayName.substring(0, 7) + '…';
                }
                
                // Add crown symbol for leader
                if (isLeader) {
                    displayName = '👑 ' + displayName;
                }
                
                tokenElement.textContent = displayName;

                // Handle multiple players on same square
                const playersOnSameSquare = this.players.filter(p => p.position === player.position);
                if (playersOnSameSquare.length > 1) {
                    const offset = (index % 2) * 20 - 10;
                    tokenElement.style.left = `calc(50% + ${offset}px)`;
                } else {
                    tokenElement.style.left = '';
                }

                squareElement.appendChild(tokenElement);
            }
        });
        
        // After all tokens are rendered, show arrow for current player
        this.renderCurrentPlayerArrow();
    }

    renderCurrentPlayerArrow() {
        // Only show arrow after the first player has completed their turn AND when not animating
        if (!this.gameActuallyStarted || this.isAnimating) return;
        
        // Only show arrow for players who are on the board (position > 0)
        if (this.players.length === 0) return;
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.position === 0) return;
        
        // Player is on the board
        const targetElement = document.getElementById(`square-${currentPlayer.position}`);
        
        if (targetElement) {
            const arrow = document.createElement('div');
            arrow.className = 'current-player-arrow';
            targetElement.appendChild(arrow);
        }
    }

    updateGameStatus() {
        const currentPlayerElement = document.getElementById('current-player');
        const currentPlayer = this.getCurrentPlayer();

        if (!currentPlayer) {
            currentPlayerElement.textContent = 'Waiting for players...';
            return;
        }

        currentPlayerElement.textContent = `${currentPlayer.name}'s Turn`;
        currentPlayerElement.style.color = this.getPlayerColor(this.currentPlayerIndex);
    }

    getPlayerColor(playerIndex) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726'];
        return colors[playerIndex] || '#FF6B6B';
    }

    handleDiceRoll() {
        const rollButton = document.getElementById('roll-dice');
        const diceDisplay = document.getElementById('dice-display');
        const currentPlayerIndex = this.currentPlayerIndex;
        const oldPosition = this.players[currentPlayerIndex].position;

        // Start animation sequence - hide arrow
        this.isAnimating = true;
        this.renderPlayerTokens(); // Remove arrow immediately

        // Disable roll button during animation
        rollButton.disabled = true;
        rollButton.textContent = 'Rolling...';

        // Start dice rolling animation
        diceDisplay.classList.add('dice-rolling');
        diceDisplay.textContent = '?';

        // Show random numbers during rolling animation for suspense
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            diceDisplay.textContent = Math.floor(Math.random() * 6) + 1;
            rollCount++;
            if (rollCount >= 8) { // Show ~8 random numbers during 800ms
                clearInterval(rollInterval);
            }
        }, 100);

        // After animation completes, show final result
        setTimeout(() => {
            // Remove animation class and show final result
            diceDisplay.classList.remove('dice-rolling');
            const roll = this.rollDice();
            diceDisplay.textContent = roll;

            // Wait 1 second before starting token movement
            setTimeout(() => {
                // Move player in game state (but don't update position yet for animation)
                const newPosition = Math.min(oldPosition + roll, 100);

                // Animate step-by-step movement
                this.animateStepByStep(currentPlayerIndex, oldPosition, roll, () => {
                    // Update player position after animation
                    this.players[currentPlayerIndex].position = newPosition;

                    // After movement animation, check for pipe transport
                    const beforePipePosition = this.players[currentPlayerIndex].position;
                    this.checkPipeTransport(currentPlayerIndex);
                    const afterPipePosition = this.players[currentPlayerIndex].position;

                    if (beforePipePosition !== afterPipePosition) {
                        // Animate pipe transport (instant jump)
                        this.animatePlayerMovement(currentPlayerIndex, beforePipePosition, afterPipePosition, () => {
                            this.completeTurn();
                            this.enableRollButton();
                        });
                    } else {
                        this.completeTurn();
                        this.enableRollButton();
                    }
                });
            }, 1000); // 1 second delay before movement

        }, 800); // Dice animation duration
    }

    enableRollButton() {
        const rollButton = document.getElementById('roll-dice');
        rollButton.disabled = false;
        rollButton.textContent = 'Roll Dice';
        
        // End animation sequence - show arrow again
        this.isAnimating = false;
        this.renderPlayerTokens(); // Show arrow for new current player
    }

    completeTurn() {
        const winner = this.checkWinCondition();
        if (winner) {
            this.showWinScreen(winner);
        } else {
            this.nextTurn(); // Switch to next player first
            // Mark game as actually started after first player completes their turn
            if (!this.gameActuallyStarted) {
                this.gameActuallyStarted = true;
            }
            this.updateGameStatus(); // Update status for new current player
            this.renderPlayerTokens(); // Render tokens and arrow for new current player
        }
    }

    animatePlayerMovement(playerIndex, fromPosition, toPosition, callback) {
        if (fromPosition === toPosition) {
            callback();
            return;
        }

        const toSquare = document.getElementById(`square-${toPosition}`);
        if (!toSquare) {
            callback();
            return;
        }

        // Get or create player token
        let token = document.querySelector(`.player-token[data-player="${playerIndex}"]`);
        if (!token) {
            token = document.createElement('div');
            token.className = `player-token player-${playerIndex + 1}`;
            token.dataset.player = playerIndex;
        }
        
        // Update token classes and content
        this.updateTokenAppearance(token, playerIndex);

        // Move token to target square - CSS transition handles the animation
        toSquare.appendChild(token);

        // Wait for animation to complete before calling callback
        setTimeout(() => {
            callback();
        }, 800);
    }

    animateStepByStep(playerIndex, startPosition, steps, callback) {
        if (steps <= 0) {
            callback();
            return;
        }

        // Get or create player token
        let token = document.querySelector(`.player-token[data-player="${playerIndex}"]`);
        if (!token) {
            token = document.createElement('div');
            token.className = `player-token player-${playerIndex + 1}`;
            token.dataset.player = playerIndex;
        }
        
        // Update token appearance
        this.updateTokenAppearance(token, playerIndex);

        // Set shorter animation duration for step-by-step movement
        token.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';

        let currentStep = 0;
        const animateNextStep = () => {
            currentStep++;
            const currentPosition = startPosition + currentStep;

            // Don't go beyond square 100
            if (currentPosition > 100) {
                // Reset transition duration and call callback
                token.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
                callback();
                return;
            }

            const currentSquare = document.getElementById(`square-${currentPosition}`);
            if (currentSquare) {
                currentSquare.appendChild(token);
            }

            if (currentStep < steps && currentPosition < 100) {
                // Continue to next step
                setTimeout(animateNextStep, 300);
            } else {
                // Animation complete, reset transition duration
                setTimeout(() => {
                    token.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
                    callback();
                }, 300);
            }
        };

        // Start the step-by-step animation
        setTimeout(animateNextStep, 100);
    }

    showWinScreen(winner) {
        this.stopTimer(); // Stop timer when game ends
        const gameTime = this.getGameTimeString();
        document.getElementById('winner-announcement').innerHTML = `🎉 ${winner} Wins! 🎉<br><small>Game Time: ${gameTime}</small>`;
        this.showScreen('win-screen');
    }

    resetGame() {
        // Clear all game state
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameActuallyStarted = false; // Reset game start flag
        this.isAnimating = false; // Reset animation state
        this.stopTimer(); // Stop the timer

        // Clear UI elements
        const diceDisplay = document.getElementById('dice-display');
        if (diceDisplay) diceDisplay.textContent = '';

        // Remove all player tokens
        document.querySelectorAll('.player-token').forEach(token => token.remove());
        
        // Remove all starting areas
        document.querySelectorAll('.starting-area').forEach(area => area.remove());
        
        // Remove all arrows
        document.querySelectorAll('.current-player-arrow').forEach(arrow => arrow.remove());

        // Update status display
        this.updateGameStatus();

        // Show welcome screen overlay
        this.showScreen('welcome-screen');

        // Reset player setup
        this.updatePlayerNameInputs();
    }
    
    startTimer() {
        this.gameStartTime = Date.now();
        this.updateTimer();
        
        // Update timer every second
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        const timerElement = document.getElementById('game-timer');
        if (!timerElement || !this.gameStartTime) return;
        
        const timeString = this.getGameTimeString();
        timerElement.textContent = `Time: ${timeString}`;
    }
    
    getGameTimeString() {
        if (!this.gameStartTime) return '00:00';
        
        const elapsedMs = Date.now() - this.gameStartTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateTokenAppearance(tokenElement, playerIndex) {
        const player = this.players[playerIndex];
        
        // Reset classes
        tokenElement.className = `player-token player-${playerIndex + 1}`;
        
        // Determine current leader (highest position)
        const leaderPosition = Math.max(...this.players.map(p => p.position));
        const leaders = this.players.filter(p => p.position === leaderPosition && p.position > 0);
        const isMultipleLeaders = leaders.length > 1;
        
        // Add crown to current leader (only if there's a single leader)
        const isLeader = player.position === leaderPosition && !isMultipleLeaders && player.position > 0;
        if (isLeader) {
            tokenElement.classList.add('leader');
        }
        
        // Set player name text (truncate if too long)
        let displayName = player.name;
        if (displayName.length > 8) {
            displayName = displayName.substring(0, 7) + '…';
        }
        
        // Add crown symbol for leader
        if (isLeader) {
            displayName = '👑 ' + displayName;
        }
        
        tokenElement.textContent = displayName;
    }
    
    toggleInstructions() {
        const instructionsContent = document.getElementById('instructions-content');
        const toggleButton = document.getElementById('toggle-instructions');
        
        if (!instructionsContent || !toggleButton) return;
        
        const isHidden = instructionsContent.classList.contains('instructions-hidden');
        
        if (isHidden) {
            // Show instructions
            instructionsContent.classList.remove('instructions-hidden');
            toggleButton.textContent = 'Hide Instructions';
            toggleButton.setAttribute('aria-expanded', 'true');
        } else {
            // Hide instructions
            instructionsContent.classList.add('instructions-hidden');
            toggleButton.textContent = 'Show Instructions';
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    }
}

// Create game instance
const game = new SnakesAndLaddersGame();

// Test runner (can be removed in production)
if (typeof runTests === 'function') {
    runTests();
}