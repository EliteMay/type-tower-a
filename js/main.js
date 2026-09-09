let selectedMode='kanji';

document.querySelectorAll('[data-mode]').forEach(button=>{
  button.addEventListener('click',()=>{
    startGame(button.dataset.mode);
  });
});

async function startGame(mode) {
  selectedMode=mode;

  const gameScreen=document.querySelector('[data-screen="game"]');
  gameScreen.dataset.mode=mode;

  showScreen('game');
  await prepareGame();
}

function showScreen(screenName) {
  document.querySelectorAll('[data-screen]').forEach(section => {
    section.hidden = (section.dataset.screen !== screenName);
  });
}

const startButton=document.getElementById('startButton');
startButton.addEventListener('click',()=>{
  showScreen('select');
});

const gameBackButton=document.getElementById('gameBackButton');
gameBackButton.addEventListener('click',()=>{
  showScreen('select');
});

showScreen('home');

document.getElementById('retryButton').addEventListener('click',()=>{
  startGame(selectedMode);
});

document.getElementById('resultBackButton').addEventListener('click',()=>{
  showScreen('select');
});
