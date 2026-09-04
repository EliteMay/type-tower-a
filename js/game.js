const DATA_FILES={kanji:'./data/kanji.json'};

let questions=[];
let currentQuestion=null;

async function prepareGame(){
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
}
