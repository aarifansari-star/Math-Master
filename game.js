let coins = Number(localStorage.getItem("mathCoins")) || 0;

let selectedMode = "addition";
let currentLevel = 1;
let questionNumber = 1;

const TOTAL_QUESTIONS = 5;

let currentQuestion = null;
let correct = false;


/* =========================
   SOUND SYSTEM
========================= */

let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext =
            new (window.AudioContext ||
            window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}


function playTone(
    frequency,
    duration = 0.15,
    type = "sine",
    volume = 0.12
) {
    try {
        const ctx = getAudioContext();

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(
            volume,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();

        oscillator.stop(
            ctx.currentTime + duration
        );

    } catch (e) {
        console.log("Sound error:", e);
    }
}


/* Correct answer sound */

function correctSound() {

    playTone(523, 0.12, "sine", 0.14);

    setTimeout(() => {
        playTone(659, 0.12, "sine", 0.14);
    }, 100);

    setTimeout(() => {
        playTone(784, 0.18, "sine", 0.16);
    }, 200);
}


/* Wrong answer sound */

function wrongSound() {

    playTone(180, 0.18, "square", 0.10);

    setTimeout(() => {
        playTone(130, 0.22, "square", 0.08);
    }, 120);
}


/* Level complete sound */

function levelCompleteSound() {

    playTone(523, 0.12, "sine", 0.15);

    setTimeout(() => {
        playTone(659, 0.12, "sine", 0.15);
    }, 100);

    setTimeout(() => {
        playTone(784, 0.12, "sine", 0.15);
    }, 200);

    setTimeout(() => {
        playTone(1047, 0.30, "sine", 0.18);
    }, 320);

}


/* =========================
   ELEMENTS
========================= */

const screens = {
    home: document.getElementById("homeScreen"),
    mode: document.getElementById("modeScreen"),
    levels: document.getElementById("levelsScreen"),
    game: document.getElementById("gameScreen")
};


/* =========================
   STORAGE
========================= */

function unlockedLevel(mode) {

    return Number(
        localStorage.getItem(
            "unlocked_" + mode
        )
    ) || 1;

}


function completedLevels(mode) {

    return JSON.parse(
        localStorage.getItem(
            "completed_" + mode
        ) || "[]"
    );

}


function saveCoins() {

    localStorage.setItem(
        "mathCoins",
        coins
    );

}


function saveProgress(mode, level) {

    localStorage.setItem(
        "unlocked_" + mode,
        level
    );

}


/* =========================
   SCREEN
========================= */

function showScreen(screen) {

    Object.values(screens).forEach(
        s => s.classList.remove("active")
    );

    screen.classList.add("active");

}


/* =========================
   COINS
========================= */

function updateCoins() {

    document.getElementById(
        "homeCoins"
    ).textContent = coins;

    document.getElementById(
        "modeCoins"
    ).textContent = coins;

    document.getElementById(
        "levelCoins"
    ).textContent = coins;

    document.getElementById(
        "gameCoins"
    ).textContent = coins;

}


/* =========================
   MODE NAME
========================= */

function modeName(mode) {

    const names = {
        addition: "Addition",
        subtraction: "Subtraction",
        multiplication: "Multiplication",
        division: "Division"
    };

    return names[mode];

}


/* =========================
   HOME
========================= */

document
    .getElementById("playButton")
    .addEventListener("click", () => {

        getAudioContext();

        showScreen(screens.mode);

        updateCoins();

    });


document
    .getElementById("modeBack")
    .addEventListener("click", () => {

        showScreen(screens.home);

    });


/* =========================
   SELECT MODE
========================= */

document
    .querySelectorAll(".mode-card")
    .forEach(button => {

        button.addEventListener("click", () => {

            selectedMode =
                button.dataset.mode;

            showLevels();

        });

    });


/* =========================
   LEVEL SCREEN
========================= */

function showLevels() {

    showScreen(screens.levels);

    document
        .getElementById("levelsTitle")
        .textContent =
        modeName(selectedMode) +
        " Levels";

    document
        .getElementById("levelModeSmall")
        .textContent =
        modeName(selectedMode).toUpperCase();

    createLevels();

    updateCoins();

}


document
    .getElementById("levelsBack")
    .addEventListener("click", () => {

        showScreen(screens.mode);

    });


/* =========================
   500 LEVELS
========================= */

function createLevels() {

    const grid =
        document.getElementById(
            "levelsGrid"
        );

    grid.innerHTML = "";

    const unlocked =
        unlockedLevel(selectedMode);

    const completed =
        completedLevels(selectedMode);


    for (
        let i = 1;
        i <= 500;
        i++
    ) {

        const button =
            document.createElement("button");

        button.className = "level";


        if (completed.includes(i)) {

            button.classList.add(
                "completed"
            );

            button.innerHTML =
                "✓<br>" + i;

        }

        else if (i <= unlocked) {

            button.classList.add(
                "unlocked"
            );

            button.textContent = i;

        }

        else {

            button.classList.add(
                "locked"
            );

            button.textContent = "🔒";

        }


        if (i <= unlocked) {

            button.addEventListener(
                "click",
                () => startLevel(i)
            );

        }


        grid.appendChild(button);

    }


    const percentage =
        ((unlocked - 1) / 499) * 100;


    document
        .getElementById("progressText")
        .textContent =
        `${unlocked} / 500`;


    document
        .getElementById("progressFill")
        .style.width =
        Math.max(0, percentage) + "%";

}


/* =========================
   START LEVEL
========================= */

function startLevel(level) {

    currentLevel = level;

    questionNumber = 1;

    correct = false;

    showScreen(screens.game);

    document
        .getElementById("currentLevel")
        .textContent = level;

    document
        .getElementById("gameModeName")
        .textContent =
        modeName(selectedMode)
        .toUpperCase();

    document
        .getElementById("questionNumber")
        .textContent = 1;

    document
        .getElementById("answerInput")
        .value = "";

    document
        .getElementById("message")
        .textContent = "";

    document
        .getElementById("nextQuestionButton")
        .classList.add("hidden");

    updateCoins();

    generateQuestion();

}


/* =========================
   GAME BACK
========================= */

document
    .getElementById("gameBack")
    .addEventListener("click", () => {

        showLevels();

    });


/* =========================
   RANDOM
========================= */

function random(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


/* =========================
   DIFFICULTY
========================= */

function difficulty(level) {

    if (level <= 25)
        return 10;

    if (level <= 75)
        return 20;

    if (level <= 150)
        return 50;

    if (level <= 250)
        return 100;

    if (level <= 350)
        return 250;

    return 500;

}


/* =========================
   QUESTION
========================= */

function generateQuestion() {

    const max =
        difficulty(currentLevel);

    let a;
    let b;
    let answer;


    if (selectedMode === "addition") {

        a = random(1, max);
        b = random(1, max);

        answer = a + b;

        currentQuestion = {
            text: `${a} + ${b} = ?`,
            answer: answer,
            explanation:
                `${a} + ${b} = ${answer}`
        };

    }


    if (selectedMode === "subtraction") {

        a = random(1, max);
        b = random(1, max);

        if (b > a) {
            [a, b] = [b, a];
        }

        answer = a - b;

        currentQuestion = {
            text: `${a} − ${b} = ?`,
            answer: answer,
            explanation:
                `${a} − ${b} = ${answer}`
        };

    }


    if (selectedMode === "multiplication") {

        let m;

        if (currentLevel <= 50)
            m = 5;
        else if (currentLevel <= 150)
            m = 10;
        else if (currentLevel <= 250)
            m = 15;
        else if (currentLevel <= 350)
            m = 20;
        else
            m = 30;


        a = random(1, m);
        b = random(1, m);

        answer = a * b;

        currentQuestion = {
            text: `${a} × ${b} = ?`,
            answer: answer,
            explanation:
                `${a} × ${b} = ${answer}`
        };

    }


    if (selectedMode === "division") {

        let divisorMax;

        if (currentLevel <= 50)
            divisorMax = 5;
        else if (currentLevel <= 150)
            divisorMax = 10;
        else if (currentLevel <= 300)
            divisorMax = 20;
        else
            divisorMax = 30;


        const divisor =
            random(1, divisorMax);

        answer =
            random(1, max);

        const dividend =
            divisor * answer;


        currentQuestion = {
            text:
                `${dividend} ÷ ${divisor} = ?`,
            answer: answer,
            explanation:
                `${dividend} ÷ ${divisor} = ${answer}`
        };

    }


    document
        .getElementById("question")
        .textContent =
        currentQuestion.text;

}


/* =========================
   CHECK ANSWER
========================= */

document
    .getElementById("checkButton")
    .addEventListener(
        "click",
        checkAnswer
    );


document
    .getElementById("answerInput")
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                checkAnswer();
            }

        }
    );


function checkAnswer() {

    const input =
        document
            .getElementById("answerInput")
            .value
            .trim();

    const message =
        document.getElementById(
            "message"
        );


    if (input === "") {

        message.className =
            "message error";

        message.textContent =
            "Please enter your answer.";

        return;

    }


    if (
        Number(input) ===
        currentQuestion.answer
    ) {

        correct = true;

        correctSound();

        showSmallCelebration();


        message.className =
            "message success";

        message.textContent =
            "✓ CORRECT! 🎉";


        document
            .getElementById(
                "nextQuestionButton"
            )
            .classList.remove(
                "hidden"
            );


        document
            .getElementById(
                "checkButton"
            )
            .disabled = true;

    }

    else {

        correct = false;

        wrongSound();

        message.className =
            "message error";

        message.textContent =
            "✗ Wrong answer. Try again.";

    }

}


/* =========================
   NEXT QUESTION
========================= */

document
    .getElementById(
        "nextQuestionButton"
    )
    .addEventListener(
        "click",
        nextQuestion
    );


function nextQuestion() {

    if (!correct)
        return;


    document
        .getElementById(
            "checkButton"
        )
        .disabled = false;


    if (
        questionNumber <
        TOTAL_QUESTIONS
    ) {

        questionNumber++;

        correct = false;

        document
            .getElementById(
                "questionNumber"
            )
            .textContent =
            questionNumber;

        document
            .getElementById(
                "answerInput"
            )
            .value = "";

        document
            .getElementById(
                "message"
            )
            .textContent = "";

        document
            .getElementById(
                "message"
            )
            .className =
            "message";

        document
            .getElementById(
                "nextQuestionButton"
            )
            .classList.add(
                "hidden"
            );

        generateQuestion();

    }

    else {

        completeLevel();

    }

}


/* =========================
   COIN REWARD
========================= */

function getReward(level) {

    if (level <= 50)
        return 10;

    if (level <= 150)
        return 15;

    if (level <= 250)
        return 20;

    if (level <= 350)
        return 30;

    if (level <= 450)
        return 40;

    return 50;

}


/* =========================
   COMPLETE LEVEL
========================= */

function completeLevel() {

    let completed =
        completedLevels(
            selectedMode
        );


    let reward = 0;


    if (!completed.includes(currentLevel)) {

        completed.push(currentLevel);


        localStorage.setItem(
            "completed_" +
            selectedMode,

            JSON.stringify(completed)
        );


        reward =
            getReward(currentLevel);


        /* ADD COINS */

        coins += reward;

        saveCoins();

        updateCoins();


        /* UNLOCK NEXT LEVEL */

        let unlocked =
            unlockedLevel(
                selectedMode
            );


        if (
            currentLevel >= unlocked &&
            unlocked < 500
        ) {

            saveProgress(
                selectedMode,
                unlocked + 1
            );

        }

    }


    /* CELEBRATION SOUND */

    levelCompleteSound();

    showBigCelebration();


    document
        .getElementById(
            "rewardCoins"
        )
        .textContent =
        reward;


    document
        .getElementById(
            "completeCoins"
        )
        .textContent =
        coins;


    setTimeout(() => {

        document
            .getElementById(
                "completePopup"
            )
            .classList.remove(
                "hidden"
            );

    }, 700);

}


/* =========================
   NEXT LEVEL
========================= */

document
    .getElementById(
        "nextLevelButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "completePopup"
                )
                .classList.add(
                    "hidden"
                );


            if (currentLevel < 500) {

                startLevel(
                    currentLevel + 1
                );

            }

            else {

                showLevels();

            }

        }
    );


/* =========================
   LEVELS BUTTON
========================= */

document
    .getElementById(
        "backToLevelsButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "completePopup"
                )
                .classList.add(
                    "hidden"
                );

            showLevels();

        }
    );


/* =========================
   HINT
========================= */

document
    .getElementById(
        "hintButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "hintPopup"
                )
                .classList.remove(
                    "hidden"
                );

        }
    );


document
    .getElementById(
        "cancelHintButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "hintPopup"
                )
                .classList.add(
                    "hidden"
                );

        }
    );


/* =========================
   HINT AD
========================= */

document
    .getElementById(
        "playAdButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "hintPopup"
                )
                .classList.add(
                    "hidden"
                );


            document
                .getElementById(
                    "adPopup"
                )
                .classList.remove(
                    "hidden"
                );


            setTimeout(() => {

                document
                    .getElementById(
                        "adPopup"
                    )
                    .classList.add(
                        "hidden"
                    );


                document
                    .getElementById(
                        "message"
                    )
                    .className =
                    "message success";


                document
                    .getElementById(
                        "message"
                    )
                    .textContent =
                    "💡 Answer: " +
                    currentQuestion.answer +
                    "\n" +
                    currentQuestion.explanation;


            }, 2000);

        }
    );


/* =========================
   REMOVE ADS
========================= */

document
    .getElementById(
        "removeAdButton"
    )
    .addEventListener(
        "click",
        () => {

            alert(
                "Remove Ads purchase will be connected later."
            );

        }
    );


/* =========================
   SMALL CELEBRATION
========================= */

function showSmallCelebration() {

    const box =
        document.createElement(
            "div"
        );

    box.className =
        "correct-celebration";

    box.innerHTML =
        "🎉 CORRECT! 🎉";

    document.body.appendChild(box);


    setTimeout(() => {

        box.classList.add(
            "celebration-hide"
        );

    }, 800);


    setTimeout(() => {

        box.remove();

    }, 1200);

}


/* =========================
   BIG CELEBRATION
========================= */

function showBigCelebration() {

    const container =
        document.createElement(
            "div"
        );

    container.className =
        "confetti-container";


    const emojis = [
        "🎉",
        "🎊",
        "⭐",
        "✨",
        "🪙",
        "🏆"
    ];


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );

        piece.className =
            "confetti";

        piece.textContent =
            emojis[
                random(
                    0,
                    emojis.length - 1
                )
            ];


        piece.style.left =
            random(5, 95) + "%";


        piece.style.animationDelay =
            (Math.random() * 0.5) + "s";


        piece.style.fontSize =
            random(18, 32) + "px";


        container.appendChild(
            piece
        );

    }


    document.body.appendChild(
        container
    );


    setTimeout(() => {

        container.remove();

    }, 3000);

}


/* =========================
   START
========================= */

updateCoins();