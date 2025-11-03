// This file relies on 'codeSnippets', 'TypingMetrics', and 'GameUI' from window.

class TypingChallenge {
    #codeSnippets;
    #metrics; 
    #ui; 

    #isRunning = false;
    #isPaused = false; 
    #currentCodeIndex = 0;
    #timeLimit = 60; 
    #timeRemaining = 0;
    #timerInterval = null;
    #currentCode = '';
    #startTime = null; 
    #pauseTime = null; 

    #currentCodeTotalTyped = 0;
    #currentCodeCorrectTyped = 0;

    constructor(snippets, MetricsClass, UIClass) {
        this.#codeSnippets = snippets;
        this.#metrics = new MetricsClass(); 
        this.#ui = new UIClass(); 

        this.#timeLimit = parseInt(this.#ui.timeLimitInput.value) || 60;
        this.#shuffleArray(this.#codeSnippets);
    }

    // --- Private Utility Methods ---
    #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    #countdown() {
        if(this.#isPaused) return; 
        this.#timeRemaining--;
        this.#ui.updateTimer(this.#timeRemaining); 
        this.#updateLiveMetrics(); 

        if (this.#timeRemaining <= 0) {
            this.endGame(false); 
        }
    }

    #loadNextCode() {
        if (this.#currentCodeIndex >= this.#codeSnippets.length) {
            this.#shuffleArray(this.#codeSnippets);
            this.#currentCodeIndex = 0;
        }
        
        this.#currentCodeTotalTyped = 0;
        this.#currentCodeCorrectTyped = 0;

        this.#currentCode = this.#codeSnippets[this.#currentCodeIndex].trimEnd();
        this.#ui.typingInput.value = '';
        
        this.#ui.renderCode(this.#currentCode, this.#ui.typingInput.value); 
    }

    #updateLiveMetrics() {
        if (!this.#isRunning || this.#isPaused) return; 
        
        const currentInput = this.#ui.typingInput.value;
        const targetCode = this.#currentCode;
        let liveCorrectChars = 0;
        
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] === targetCode[i]) {
                liveCorrectChars++;
            }
        }
        
        this.#currentCodeTotalTyped = currentInput.length;
        this.#currentCodeCorrectTyped = liveCorrectChars;

        const { accuracy } = this.#metrics.getLiveMetrics(
            this.#currentCodeCorrectTyped, 
            this.#currentCodeTotalTyped
        );

        this.#ui.updateLiveAccuracy(accuracy);
    }
    
    // --- Public Interface Methods ---

    startGame() {
        if (this.#isRunning) return;

        this.#timeLimit = parseInt(this.#ui.timeLimitInput.value) || 0;
        this.#timeRemaining = this.#timeLimit;
        const isTimed = this.#timeLimit > 0;

        this.#currentCodeIndex = 0;
        this.#isRunning = true;
        this.#isPaused = false;
        this.#startTime = new Date(); 
        this.#metrics.reset(); 
        
        this.#ui.setGameRunningState(true, isTimed);
        this.#ui.updateTimer(isTimed ? this.#timeRemaining : '--');

        this.#shuffleArray(this.#codeSnippets);
        this.#loadNextCode();
        
        if (isTimed) {
            this.#timerInterval = setInterval(this.#countdown.bind(this), 1000);
        }
    }
    
    togglePause() {
        if (!this.#isRunning) return;
        
        this.#isPaused = !this.#isPaused;

        if (this.#isPaused) {
            this.#pauseTime = new Date(); 
        } else if (this.#timeLimit > 0 && this.#pauseTime) {
            const pauseDuration = new Date() - this.#pauseTime;
            this.#startTime = new Date(this.#startTime.getTime() + pauseDuration);
        }
        
        this.#ui.setPauseState(this.#isPaused);
    }


    /**
     * Records metrics for the current code and prepares to load the next one.
     * @param {boolean} isSkipped - True if the user manually skipped.
     */
    advanceCode(isSkipped) {
        // Record the current statistics (even if the game is over)
        this.#metrics.addCodeStats(
            isSkipped ? 0 : this.#currentCodeCorrectTyped, 
            this.#currentCodeTotalTyped
        ); 
        
        // Only proceed to load the next code if the game is still running
        if (this.#isRunning) {
            this.#currentCodeIndex++;
            this.#loadNextCode();
        }
    }

    skipCode() {
        if (!this.#isRunning || this.#isPaused) return; 
        this.advanceCode(true); 
    }

    handleInput() {
        if (!this.#isRunning || this.#isPaused) return;

        const input = this.#ui.typingInput.value;
        const target = this.#currentCode;
        
        if (input.length > target.length) {
            this.#ui.typingInput.value = input.substring(0, target.length);
            return;
        }
        
        this.#updateLiveMetrics();
        this.#ui.renderCode(this.#currentCode, input);
        
        // Check for code completion
        if (input.length === target.length) {
            this.endGame(true); 
            return;
        }
    }

    endGame(isCompleted) {
        clearInterval(this.#timerInterval);
        
        // 🔥 CRITICAL FIX: Ensure the final stats are recorded before results are tallied.
        if (isCompleted) {
            // AdvanceCode records the metrics for the just-completed snippet.
            // Passing false here prevents it from trying to load a NEW code after the game is over.
            this.advanceCode(false); 
        }
        
        this.#isRunning = false;
        this.#isPaused = false; 
        
        const finalElapsedTimeSeconds = (new Date() - this.#startTime) / 1000;
        
        // Final calculation 
        const results = this.#metrics.getFinalResults();
        
        this.#ui.showResultsModal(
            isCompleted, 
            results.accuracy, 
            finalElapsedTimeSeconds, 
            this.#timeLimit > 0
        );
        
        this.#ui.setGameRunningState(false, this.#timeLimit > 0);
    }

    initListeners() {
        // --- Game Control Listeners (Call methods on the Challenge class) ---
        this.#ui.startButton.addEventListener('click', this.startGame.bind(this));
        this.#ui.skipButton.addEventListener('click', this.skipCode.bind(this)); 
        this.#ui.pauseButton.addEventListener('click', this.togglePause.bind(this)); 
        this.#ui.typingInput.addEventListener('input', this.handleInput.bind(this)); 
        
        // Prevent Tab key from moving focus out of the textarea
        this.#ui.typingInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.#isRunning && !this.#isPaused) {
                e.preventDefault();
            }
        });

        // --- UI Control Listeners (Call methods on the UI class or reset game) ---
        this.#ui.restartButton.addEventListener('click', () => {
            this.#ui.hideResultsModal();
            this.#ui.updateTimer(this.#ui.timeLimitInput.value > 0 ? this.#ui.timeLimitInput.value : '--');
        });
        
        this.#ui.timeLimitInput.addEventListener('input', () => {
            let val = parseInt(this.#ui.timeLimitInput.value);
            if (val < 0) val = 0;
            if (val > 300) val = 300;
            this.#ui.timeLimitInput.value = val;
            
            this.#ui.setGameRunningState(false, val > 0);
            this.#ui.updateTimer(val > 0 ? val : '--');
        });
    }
}

function init() {
    const snippets = window.codeSnippets;
    const MetricsClass = window.TypingMetrics; 
    const UIClass = window.GameUI; 

    const game = new TypingChallenge(snippets, MetricsClass, UIClass);
    game.initListeners();
}

window.onload = init;