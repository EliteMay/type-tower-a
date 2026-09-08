const DATA_FILES = {
  kanji: './data/kanji.json',
  eiyaku: './data/ja-en.json',
  wayaku: './data/en-ja.json'
};

const MODE_UI = {
  kanji: { prompt: '読みを入力（ひらがな）', result: '漢字の塔 CLEAR' },
  eiyaku: { prompt: '英語を入力', result: '英訳の塔 CLEAR' },
  wayaku: { prompt: '日本語を入力', result: '和訳の塔 CLEAR' }
};

let questions = [];
let remainingQuestions = [];
let currentQuestion = null;
let floor = 1;
let correctCount = 0;
let missCount = 0;
const GAME_TIME = 90;
let timerId = null;
let timeLeft = GAME_TIME;
let startedAt = 0;

const answerForm = document.getElementById('answerForm');
const answerInput = document.getElementById('answerInput');
const judgeMessage = document.getElementById('judgeMessage');

answerInput.addEventListener('input', () => {
  let val = answerInput.value;

  if (typeof selectedMode !== 'undefined' && selectedMode === 'kanji') {
    val = val.replace(/[\u30a1-\u30f6]/g, match =>
      String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
    answerInput.value = val.replace(/[^ぁ-ん0-９0-9]/g, '');
  } else if (typeof selectedMode !== 'undefined' && selectedMode === 'eiyaku') {
    answerInput.value = val.replace(/[^a-zA-Z0-9\s'-]/g, '');
  }
});

async function prepareGame() {
  floor = 1;
  updateFloor();
  correctCount = 0;
  missCount = 0;

  const modeUi = MODE_UI[selectedMode] || MODE_UI.kanji;
  document.querySelector('#questionCard p').textContent = modeUi.prompt;
  document.getElementById('resultTitle').textContent = modeUi.result;

  const loaded = await loadQuestions();
  if (loaded) {
    resetQuestionPool();
    startGameTimer();
    showNextQuestion();
  }
}

async function loadQuestions() {
  try {
    const dataFile = DATA_FILES[selectedMode];
    if (!dataFile) throw new Error('未対応のモードです: ' + selectedMode);

    const response = await fetch(dataFile);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    questions = await response.json();
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('問題データが空です');
    return true;
  } catch (error) {
    console.error(error);
    document.getElementById('questionText').textContent = '問題を読み込めませんでした';
    return false;
  }
}

function resetQuestionPool() {
  remainingQuestions = [...questions];
}

function showNextQuestion() {
  if (remainingQuestions.length === 0) {
    resetQuestionPool();
  }

  const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions[randomIndex];

  remainingQuestions.splice(randomIndex, 1);

  document.getElementById('questionText').textContent = currentQuestion.question;
  document.getElementById('answerInput').value = '';
  document.getElementById('answerInput').focus();
}

answerForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentQuestion) return;

  const rawInput = answerInput.value.trim();
  const userInputValue = normalizeAnswer(rawInput);

  if (!rawInput) return;

  const isCorrect = isAnswerCorrect(userInputValue, currentQuestion.answer, rawInput);

  if (isCorrect) {
    await handleCorrect();
  } else {
    await handleMiss();
  }
});

function isAnswerCorrect(userInput, correctAnswer, rawInput = '') {
  if (userInput === '0' || rawInput === '0' || userInput === '０' || rawInput === '０') {
    return true;
  }

  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(ans => normalizeAnswer(ans) === userInput);
  }
  return normalizeAnswer(correctAnswer) === userInput;
}

function normalizeAnswer(value) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60))
    .replace(/\s+/g, ' ');
}

async function handleCorrect() {
  correctCount += 1;
  floor += 1;
  updateFloor();
  judgeMessage.textContent = '正解！ +1F';
  if (floor >= 10) {
    finishGame();
    return;
  }
  showNextQuestion();
}

async function handleMiss() {
  missCount += 1;
  floor = Math.max(1, floor - 1);
  updateFloor();
  judgeMessage.textContent = 'MISS -1F';
  showNextQuestion();
}

function updateFloor() {
  document.getElementById('floorText').textContent = floor + 'F';
  document.querySelectorAll('[data-floor]').forEach(item => {
    item.classList.toggle('is-current', Number(item.dataset.floor) === floor);
  });
}

function finishGame() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  document.getElementById('resultCorrect').textContent = correctCount;
  document.getElementById('resultMiss').textContent = missCount;

  showScreen('result');
}

function startGameTimer() {
  if (timerId) clearInterval(timerId);

  timeLeft = GAME_TIME;
  updateTimer();

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      if (timerId) clearInterval(timerId);
      document.getElementById('resultTitle').textContent = 'TIME UP';
      finishGame();
    }
  }, 1000);
}

function updateTimer() {
  const timeEl = document.getElementById('timeText');
  if (timeEl) {
    timeEl.textContent = timeLeft;
  }
}
