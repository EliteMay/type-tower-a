const DATA_FILES = { kanji: './data/kanji.json' };

let questions = [];
let remainingQuestions = [];
let currentQuestion = null;
let floor = 1;
let correctCount = 0;
let missCount = 0;
const GAME_TIME=90;
let timerId=null;
let timeLeft=GAME_TIME;

async function prepareGame() {
  floor = 1;
  updateFloor();
  correctCount = 0;
  missCount = 0;
  const loaded = await loadQuestions();
  if (loaded) {
    resetQuestionPool();
    document.getElementById('resultTitle').textContent='漢字の塔 CLEAR';
startGameTimer();
    showNextQuestion();
  }
}

async function loadQuestions() {
  try {
    const response = await fetch(DATA_FILES.kanji);
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

const answerForm=document.getElementById('answerForm');
const answerInput=document.getElementById('answerInput');
const judgeMessage=document.getElementById('judgeMessage');

answerForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentQuestion) return;

  const userInputValue = normalizeAnswer(answerInput.value);
  if (!userInputValue) return;

  const isCorrect = isAnswerCorrect(userInputValue, currentQuestion.answer);

  if (isCorrect) {
    await handleCorrect();
  } else {
    await handleMiss();
  }
});

unction isAnswerCorrect(userInput, correctAnswer, rawInput = '') {
  if (userInput === '0' || rawInput === '0' || userInput === '０' || rawInput === '０') {
    return true;
  }

  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(ans => normalizeAnswer(ans) === userInput);
  }
  return normalizeAnswer(correctAnswer) === userInput;
}


function normalizeAnswer(value){
  return value.trim().toLowerCase().replace(/\s+/g,' ');
}

async function handleCorrect(){
  correctCount+=1;
  floor+=1;
  updateFloor();
  judgeMessage.textContent='正解！ +1F';
  if(floor>=10){
    finishGame();
    return;
  }
  showNextQuestion();
}

async function handleMiss(){
  missCount+=1;
  floor=Math.max(1,floor-1);
  updateFloor();
  judgeMessage.textContent='MISS -1F';
  showNextQuestion();
}

function updateFloor(){
  document.getElementById('floorText').textContent=floor+'F';
  document.querySelectorAll('[data-floor]').forEach(item=>{
    item.classList.toggle('is-current',Number(item.dataset.floor)===floor);
  });
}
function updateFloor(){
  document.getElementById('floorText').textContent=floor+'F';

  document.querySelectorAll('[data-floor]').forEach(item=>{
    item.classList.toggle(
      'is-current',
      Number(item.dataset.floor)===floor
    );
  });
}

function finishGame(){
  clearInterval(timerId);

  document.getElementById('resultCorrect').textContent=correctCount;
  document.getElementById('resultMiss').textContent=missCount;

  showScreen('result');
}

function startGameTimer(){
  clearInterval(timerId);

  timeLeft=GAME_TIME;
  updateTimer();

  timerId=setInterval(()=>{
    timeLeft-=1;
    updateTimer();

    if(timeLeft<=0){
      clearInterval(timerId);
      document.getElementById('resultTitle').textContent='TIME UP';
      finishGame();
    }
  },1000);
}

function updateTimer(){
  document.getElementById('timeText').textContent=timeLeft;
}
