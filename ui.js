// This class handles all DOM querying, rendering, and UI updates.
class GameUI {
    
    // Public properties to be accessed by the main TypingChallenge class
    timeLimitInput;
    startButton;
    skipButton;
    pauseButton; 
    typingInput;
    codeDisplay;
    timerDisplay;
    resultsArea;
    restartButton;
    accuracyDisplay;
    modalTitle;
    codeContainer; 
    timerLabel;
    timeTakenResult;
    timeTakenValue;
    challengeMotto;

    constructor() {
        this.#getDomElements(); 
        this.accuracyDisplay.textContent = '0%'; // Initial state
        this.timerDisplay.textContent = this.timeLimitInput.value; // Initial time
    }

    // --- Private DOM Element Retrieval ---
    #getDomElements() {
        this.timeLimitInput = document.getElementById('time-limit');
        this.startButton = document.getElementById('start-button');
        this.skipButton = document.getElementById('skip-button');
        this.pauseButton = document.getElementById('pause-button'); 
        this.typingInput = document.getElementById('typing-input');
        this.codeDisplay = document.getElementById('code-display');
        this.timerDisplay = document.getElementById('timer');
        this.resultsArea = document.getElementById('results-area');
        this.restartButton = document.getElementById('restart-button');
        this.accuracyDisplay = document.getElementById('live-accuracy');
        this.modalTitle = document.getElementById('modal-title');
        this.codeContainer = document.getElementById('code-container');
        this.timerLabel = document.getElementById('timer-label');
        this.timeTakenResult = document.getElementById('time-taken-result');
        this.timeTakenValue = document.getElementById('time-taken-value');
        this.challengeMotto = document.getElementById('challenge-motto');
    }

    // --- Public UI Update Methods ---

    /**
     * Renders the code to the screen with color-coding and cursor.
     * @param {string} codeToDisplay - The full code snippet string.
     * @param {string} typedInput - The current input from the user.
     */
    renderCode(codeToDisplay, typedInput) {
        let html = '';
        codeToDisplay = codeToDisplay.trimEnd();

        for (let i = 0; i < codeToDisplay.length; i++) {
            const char = codeToDisplay[i];
            let classes = 'whitespace-pre-wrap';

            if (i < typedInput.length) {
                classes += typedInput[i] === char ? ' correct' : ' incorrect';
            } 
            
            if (i === typedInput.length) {
                classes += ' cursor';
            }

            let displayChar = char;
            if (char === ' ') {
                displayChar = '&nbsp;';
            } else if (char === '\n') {
                if (i === codeToDisplay.length - 1 || codeToDisplay[i+1] !== '\n') {
                     displayChar = '<br>';
                } else {
                     displayChar = '<br>';
                }
            }
            
            html += `<span class="${classes}">${displayChar}</span>`;
        }
        this.codeDisplay.innerHTML = html;
        this.#scrollCursorIntoView();
    }

    #scrollCursorIntoView() {
        if (document.activeElement === this.typingInput) {
            const cursorSpan = this.codeDisplay.querySelector('.cursor');
            if (cursorSpan) {
                const containerRect = this.codeContainer.getBoundingClientRect();
                const cursorRect = cursorSpan.getBoundingClientRect();
                
                // Logic to vertically center the cursor as it moves
                if (cursorRect.bottom > containerRect.bottom || cursorRect.top < containerRect.top) {
                    this.codeContainer.scrollTop += (cursorRect.top - containerRect.top) - (containerRect.height / 3);
                }
            }
        }
    }

    updateTimer(timeRemaining) {
        this.timerDisplay.textContent = timeRemaining;
    }

    updateLiveAccuracy(accuracy) {
        this.accuracyDisplay.textContent = accuracy + '%';
    }

    // --- State and Button Management ---

    setGameRunningState(isRunning, isTimed) {
        this.typingInput.disabled = !isRunning;
        this.typingInput.classList.toggle('disabled:bg-gray-900', !isRunning);
        this.startButton.textContent = isRunning ? 'Typing...' : 'Start Challenge';
        this.startButton.disabled = isRunning;
        this.skipButton.disabled = !isRunning; 
        this.pauseButton.disabled = !isRunning;
        this.timeLimitInput.disabled = isRunning;

        if (isRunning) {
            this.typingInput.focus();
            this.updateLiveAccuracy(100); 
        }

        if (isTimed) {
            this.timerLabel.textContent = 'Time Left';
            this.challengeMotto.textContent = 'Successfully type the code before the time runs out!';
        } else {
            this.timerLabel.textContent = 'Unlimited Time';
            this.timerDisplay.textContent = '--';
            this.challengeMotto.textContent = 'Type the code to check your accuracy!';
        }
    }

    setPauseState(isPaused) {
        this.typingInput.disabled = isPaused;
        this.skipButton.disabled = isPaused; 

        if (isPaused) {
            this.pauseButton.textContent = 'Resume';
            this.pauseButton.classList.replace('bg-blue-600', 'bg-green-600');
            this.typingInput.blur();
            this.timerLabel.textContent = 'PAUSED';
        } else {
            this.pauseButton.textContent = 'Pause';
            this.pauseButton.classList.replace('bg-green-600', 'bg-blue-600');
            this.typingInput.focus();
            this.timerLabel.textContent = 'Time Left';
        }
    }
    
    showResultsModal(isCompleted, accuracy, finalElapsedTime, isTimed) {
        if (isCompleted) {
            this.modalTitle.textContent = '🥳 Challenge Completed!';
            this.modalTitle.className = 'text-3xl font-extrabold text-green-400 mb-4';
        } else {
            this.modalTitle.textContent = '⏱️ Time Expired. Try Again!';
            this.modalTitle.className = 'text-3xl font-extrabold text-red-400 mb-4';
        }
        
        if (isCompleted || isTimed) {
               this.timeTakenResult.classList.remove('hidden');
               this.timeTakenValue.textContent = finalElapsedTime.toFixed(2);
        } else {
               this.timeTakenResult.classList.add('hidden');
        }

        document.getElementById('accuracy-result').textContent = accuracy;
        this.resultsArea.classList.remove('hidden');
    }

    hideResultsModal() {
        this.resultsArea.classList.add('hidden');
        this.codeDisplay.innerHTML = '<span class="text-xl text-gray-500">Press "Start Challenge" to begin!</span>';
        this.updateLiveAccuracy(0);
        this.typingInput.focus();
    }
}

// Attach to window so game.js can access it
window.GameUI = GameUI;