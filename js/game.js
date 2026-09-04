const DATA_FILES={kanji:'./data/kanji.json'};

let questions=[];
let currentQuestion=null;
let floor=1;

async function prepareGame(){
  floor=1;
  updateFloor();
  const loaded=await loadQuestions();
  if(loaded) showNextQuestion();
}

async function loadQuestions(){
  try{
    const response=await fetch(DATA_FILES.kanji);
    if(!response.ok) throw new Error('HTTP '+response.status);
    questions=await response.json();
    if(!Array.isArray(questions) || questions.length===0) throw new Error('問題データが空です');
    return true;
  }catch(error){
    console.error(error);
    document.getElementById('questionText').textContent='問題を読み込めませんでした';
    return false;
  }
}

function showNextQuestion(){
  const pool=questions;
  currentQuestion=pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('questionText').textContent=currentQuestion.question;
  document.getElementById('answerInput').value='';
  document.getElementById('answerInput').focus();
}

const answerForm=document.getElementById('answerForm');
const answerInput=document.getElementById('answerInput');
const judgeMessage=document.getElementById('judgeMessage');

answerForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!currentQuestion) return;
  const answer=normalizeAnswer(answerInput.value);
  if(!answer) return;
  if(answer===normalizeAnswer(currentQuestion.answer)){
    await handleCorrect();
  }else{
    await handleMiss();
  }
});

function normalizeAnswer(value){
  return value.trim().toLowerCase().replace(/\s+/g,' ');
}

async function handleCorrect(){
  floor+=1;
  updateFloor();
  judgeMessage.textContent='正解！ +1F';
  if(floor>=10){
    showScreen('result');
    return;
  }
  showNextQuestion();
}

async function handleMiss(){
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
