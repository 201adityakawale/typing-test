
const passages = [
    "Learning a new skill requires patience, practice, and consistency. Every small step brings you closer to your goal. Keep working hard and never stop improving yourself.",

    "Technology has changed the way people communicate, learn, and work. Computers and the internet help us solve problems and connect with people around the world.",

    "Success does not happen overnight. It comes from building good habits, learning from mistakes, and making progress every day. Believe in yourself and keep moving forward.",

    "Programming teaches us how to think logically and solve problems. With practice and curiosity, anyone can learn to build useful websites and amazing applications."
];

const passageElement = document.getElementById("passage");
const input = document.getElementById("typing-input");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const bestElement = document.getElementById("best");
const progressElement = document.getElementById("progress");
const messageElement = document.getElementById("message");
const resultElement = document.getElementById("result");

const restartButton = document.getElementById("restart");
const newTextButton = document.getElementById("new-text");
const tryAgainButton = document.getElementById("try-again");

let currentText = "";
let timeLeft = 60;
let timer = null;
let started = false;
let finished = false;
let startTime = 0;

let bestScore = Number(localStorage.getItem("typingBest")) || 0;
bestElement.textContent = bestScore;

function choosePassage() {
    const previousText = currentText;
    let nextText;

    do {
        nextText = passages[Math.floor(Math.random() * passages.length)];
    } while (nextText === previousText && passages.length > 1);

    currentText = nextText;
}

function displayPassage() {
    passageElement.innerHTML = "";

    currentText.split("").forEach((character, index) => {
        const span = document.createElement("span");
        span.textContent = character;

        if (index === 0) {
            span.classList.add("current");
        }

        passageElement.appendChild(span);
    });
}

function resetTest(changeText = false) {
    clearInterval(timer);

    timer = null;
    timeLeft = 60;
    started = false;
    finished = false;
    startTime = 0;

    if (changeText || !currentText) {
        choosePassage();
    }

    timerElement.textContent = "60s";
    wpmElement.textContent = "0";
    accuracyElement.textContent = "100%";
    progressElement.style.width = "0%";
    messageElement.textContent = "Start typing to begin the test.";

    input.value = "";
    input.disabled = false;

    resultElement.classList.add("hidden");

    displayPassage();
    input.focus();
}

function startTimer() {
    started = true;
    startTime = Date.now();

    messageElement.textContent = "Keep typing! You are doing great.";

    timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeLeft = Math.max(0, 60 - elapsed);

        timerElement.textContent = timeLeft + "s";

        updateStats();

        if (timeLeft <= 0) {
            finishTest();
        }
    }, 200);
}

function updateStats() {
    const typedText = input.value;
    const spans = passageElement.querySelectorAll("span");

    let correctCharacters = 0;
    let incorrectCharacters = 0;

    spans.forEach((span, index) => {
        span.classList.remove("correct", "incorrect", "current");

        if (index < typedText.length) {
            if (typedText[index] === currentText[index]) {
                span.classList.add("correct");
                correctCharacters++;
            } else {
                span.classList.add("incorrect");
                incorrectCharacters++;
            }
        }

        if (index === typedText.length && !finished) {
            span.classList.add("current");
        }
    });

    // Count extra typed characters as incorrect too.
    if (typedText.length > currentText.length) {
        incorrectCharacters += typedText.length - currentText.length;
    }

    const totalTyped = typedText.length;
    const accuracy = totalTyped === 0
        ? 100
        : Math.round((correctCharacters / totalTyped) * 100);

    const elapsedMinutes = started
        ? Math.max((Date.now() - startTime) / 60000, 1 / 60)
        : 0;

    const wpm = elapsedMinutes > 0
        ? Math.round((correctCharacters / 5) / elapsedMinutes)
        : 0;

    wpmElement.textContent = wpm;
    accuracyElement.textContent = accuracy + "%";

    const progress = Math.min(
        (typedText.length / currentText.length) * 100,
        100
    );

    progressElement.style.width = progress + "%";

    return {
        wpm,
        accuracy,
        correctCharacters,
        incorrectCharacters
    };
}

function finishTest() {
    if (finished) return;

    finished = true;
    clearInterval(timer);
    timer = null;

    input.disabled = true;
    timeLeft = Math.max(0, 60 - Math.floor((Date.now() - startTime) / 1000));
    timerElement.textContent = timeLeft + "s";

    const stats = updateStats();

    // Save the highest WPM reached.
    if (stats.wpm > bestScore) {
        bestScore = stats.wpm;
        localStorage.setItem("typingBest", bestScore);
        bestElement.textContent = bestScore;
    }

    document.getElementById("final-wpm").textContent = stats.wpm;
    document.getElementById("final-accuracy").textContent =
        stats.accuracy + "%";
    document.getElementById("final-correct").textContent =
        stats.correctCharacters;

    messageElement.textContent = "Test completed!";
    resultElement.classList.remove("hidden");

    resultElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

input.addEventListener("input", () => {
    if (finished) return;

    if (!started && input.value.length > 0) {
        startTimer();
    }

    const stats = updateStats();

    if (input.value.length >= currentText.length) {
        finishTest();
    } else if (input.value.length > 0) {
        messageElement.textContent =
            "Correct characters: " + stats.correctCharacters;
    }
});

restartButton.addEventListener("click", () => {
    resetTest(false);
});

newTextButton.addEventListener("click", () => {
    resetTest(true);
});

tryAgainButton.addEventListener("click", () => {
    resetTest(true);
});

resetTest(true);
