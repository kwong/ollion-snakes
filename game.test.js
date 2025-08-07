function runTests() {
    const results = [];
    
    function test(description, testFn) {
        try {
            testFn();
            results.push({ description, status: 'PASS' });
            console.log(`✓ ${description}`);
        } catch (error) {
            results.push({ description, status: 'FAIL', error: error.message });
            console.log(`✗ ${description}: ${error.message}`);
        }
    }
    
    function expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, but got ${actual}`);
                }
            },
            toBeGreaterThanOrEqual: (expected) => {
                if (actual < expected) {
                    throw new Error(`Expected ${actual} to be >= ${expected}`);
                }
            },
            toBeLessThanOrEqual: (expected) => {
                if (actual > expected) {
                    throw new Error(`Expected ${actual} to be <= ${expected}`);
                }
            }
        };
    }

    console.log('Running Snakes and Ladders Tests...\n');
    
    test('should create a 10x10 board with 100 squares', () => {
        const game = new SnakesAndLaddersGame();
        expect(game.boardSize).toBe(100);
    });
    
    test('should calculate correct position for square number', () => {
        const game = new SnakesAndLaddersGame();
        // Bottom row (1-10): left to right
        const pos1 = game.getSquarePosition(1);
        expect(pos1).toEqual({ row: 9, col: 0 });
        
        const pos10 = game.getSquarePosition(10);
        expect(pos10).toEqual({ row: 9, col: 9 });
        
        // Next row (11-20): right to left  
        const pos11 = game.getSquarePosition(11);
        expect(pos11).toEqual({ row: 8, col: 9 });
        
        const pos20 = game.getSquarePosition(20);
        expect(pos20).toEqual({ row: 8, col: 0 });
        
        // Next row (21-30): left to right
        const pos21 = game.getSquarePosition(21);
        expect(pos21).toEqual({ row: 7, col: 0 });
        
        const pos30 = game.getSquarePosition(30);
        expect(pos30).toEqual({ row: 7, col: 9 });
        
        // Top row (91-100): right to left
        const pos91 = game.getSquarePosition(91);
        expect(pos91).toEqual({ row: 0, col: 9 });
        
        const pos100 = game.getSquarePosition(100);
        expect(pos100).toEqual({ row: 0, col: 0 });
    });
    
    test('should generate dice roll between 1 and 6', () => {
        const game = new SnakesAndLaddersGame();
        for (let i = 0; i < 100; i++) {
            const roll = game.rollDice();
            expect(roll).toBeGreaterThanOrEqual(1);
            expect(roll).toBeLessThanOrEqual(6);
        }
    });
    
    test('should create players with names', () => {
        const game = new SnakesAndLaddersGame();
        game.setupPlayers(['Alice', 'Bob']);
        expect(game.players.length).toBe(2);
        expect(game.players[0].name).toBe('Alice');
        expect(game.players[0].position).toBe(0);
    });
    
    test('should move player based on dice roll', () => {
        const game = new SnakesAndLaddersGame();
        game.setupPlayers(['Alice']);
        const initialPosition = game.players[0].position;
        const roll = 4;
        game.movePlayer(0, roll);
        expect(game.players[0].position).toBe(initialPosition + roll);
    });
    
    test('should have pipes (snakes and ladders) from game sample', () => {
        const game = new SnakesAndLaddersGame();
        expect(game.pipes.size).toBeGreaterThanOrEqual(10);
        
        // Test some visible snakes from the image
        expect(game.pipes.get(99)).toBe(78); // Snake from 99 to 78
        expect(game.pipes.get(95)).toBe(75); // Snake from 95 to 75
        expect(game.pipes.get(92)).toBe(73); // Snake from 92 to 73
        expect(game.pipes.get(87)).toBe(24); // Snake from 87 to 24
        
        // Test some visible ladders from the image  
        expect(game.pipes.get(1)).toBe(38); // Ladder from 1 to 38
        expect(game.pipes.get(4)).toBe(14); // Ladder from 4 to 14
        expect(game.pipes.get(9)).toBe(31); // Ladder from 9 to 31
        expect(game.pipes.get(21)).toBe(42); // Ladder from 21 to 42
    });
    
    test('should transport player when landing on pipe entrance', () => {
        const game = new SnakesAndLaddersGame();
        game.setupPlayers(['Alice']);
        
        // Test ladder transport
        game.players[0].position = 1;
        game.checkPipeTransport(0);
        expect(game.players[0].position).toBe(38);
        
        // Test snake transport  
        game.players[0].position = 99;
        game.checkPipeTransport(0);
        expect(game.players[0].position).toBe(78);
    });
    
    test('should manage turn sequence correctly', () => {
        const game = new SnakesAndLaddersGame();
        game.setupPlayers(['Alice', 'Bob', 'Carol']);
        
        expect(game.getCurrentPlayer().name).toBe('Alice');
        
        game.nextTurn();
        expect(game.getCurrentPlayer().name).toBe('Bob');
        
        game.nextTurn();
        expect(game.getCurrentPlayer().name).toBe('Carol');
        
        game.nextTurn();
        expect(game.getCurrentPlayer().name).toBe('Alice');
    });
    
    test('should detect win condition', () => {
        const game = new SnakesAndLaddersGame();
        game.setupPlayers(['Alice', 'Bob']);
        
        expect(game.checkWinCondition()).toBeFalsy();
        
        game.players[0].position = 100;
        expect(game.checkWinCondition()).toBe('Alice');
        
        game.players[1].position = 100;
        expect(game.checkWinCondition()).toBe('Alice'); // First to reach wins
    });
    
    test('should not move beyond square 100', () => {
        const game = new SnakesAndLaddersGame();
        game.setupPlayers(['Alice']);
        
        game.players[0].position = 98;
        game.movePlayer(0, 5); // Would go to 103
        expect(game.players[0].position).toBe(98); // Should stay at 98
        
        game.movePlayer(0, 2); // Exact landing on 100
        expect(game.players[0].position).toBe(100);
    });
    
    console.log(`\nTest Results: ${results.filter(r => r.status === 'PASS').length}/${results.length} passed`);
    return results;
}