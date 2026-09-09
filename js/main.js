let selectedMode='kanji';

const GAME_BACKGROUND_DATA={
  kanji:'assets/images/game-kanji.b64',
  eiyaku:'assets/images/game-eiyaku.b64',
  wayaku:'assets/images/game-wayaku.b64'
};

const gameBackgroundCache={};

async function loadGameBackground(mode) {
  const key=GAME_BACKGROUND_DATA[mode] ? mode : 'kanji';

  if (!gameBackgroundCache[key]) {
    const response=await fetch(GAME_BACKGROUND_DATA[key]);
    if (!response.ok) throw new Error('背景を読み込めませんでした: HTTP ' + response.status);

    const base64=(await response.text()).trim();
    gameBackgroundCache[key]='data:image/jpeg;base64,' + base64;
  }

  return gameBackgroundCache[key];
}

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
  try {
    gameStageBg.src=await loadGameBackground(mode);
  } catch (error) {
    console.error(error);
    gameStageBg.removeAttribute('src');
  }

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
