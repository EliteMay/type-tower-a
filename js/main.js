let selectedMode='kanji';

const GAME_BACKGROUNDS={
  kanji:'assets/images/game-kanji.webp',
  eiyaku:'assets/images/game-eiyaku.webp',
  wayaku:'assets/images/game-wayaku.webp'
};

document.querySelectorAll('[data-mode]').forEach(button=>{
  button.addEventListener('click',()=>{
    startGame(button.dataset.mode);
  });
});

async function startGame(mode) {
  selectedMode=mode;

  const gameScreen=document.querySelector('[data-screen="game"]');
  gameScreen.dataset.mode=mode;

  const gameStageBg=document.getElementById('gameStageBg');
  gameStageBg.src=GAME_BACKGROUNDS[mode] || GAME_BACKGROUNDS.kanji;

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
