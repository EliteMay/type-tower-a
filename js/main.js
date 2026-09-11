let selectedMode = 'kanji';

// 設定はここだけ見れば分かるようにする
let gameSettei = {
  mode: 'normal',
  level: 2,
  time: 90
};

const GAME_BACKGROUNDS = {
  kanji: 'assets/images/black.png',
  eiyaku: 'assets/images/white.png',
  wayaku: 'assets/images/blue.png'
};

const MODE_INFO = {
  kanji: {
    title: '漢字の塔',
    hint: '日本語を学ぶ人向け・漢字の読みを練習'
  },
  eiyaku: {
    title: '英訳の塔',
    hint: '日本人向け・日本語から英単語を答える'
  },
  wayaku: {
    title: '和訳の塔',
    hint: '日本人向け・英単語から日本語を答える'
  }
};

document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    setteiOpen(button.dataset.mode);
  });
});

function setteiOpen(mode) {
  selectedMode = mode;
  const info = MODE_INFO[mode] || MODE_INFO.kanji;
  document.getElementById('settingsTitle').textContent = info.title;
  document.getElementById('settingsHint').textContent = info.hint;
  screenKirikae('settings');
}

function choiceSelect(selector, currentButton) {
  document.querySelectorAll(selector).forEach(button => {
    const selected = button === currentButton;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

document.querySelectorAll('[data-game-mode]').forEach(button => {
  button.addEventListener('click', () => {
    gameSettei.mode = button.dataset.gameMode;
    choiceSelect('[data-game-mode]', button);
  });
});

document.querySelectorAll('[data-level]').forEach(button => {
  button.addEventListener('click', () => {
    gameSettei.level = Number(button.dataset.level);
    choiceSelect('[data-level]', button);
  });
});

document.querySelectorAll('[data-time]').forEach(button => {
  button.addEventListener('click', () => {
    gameSettei.time = button.dataset.time === 'none' ? null : Number(button.dataset.time);
    choiceSelect('[data-time]', button);
  });
});

async function gameStart(mode) {
  selectedMode = mode;

  const gameScreen = document.querySelector('[data-screen="game"]');
  gameScreen.dataset.mode = mode;

  const gameStageBg = document.getElementById('gameStageBg');
  gameStageBg.onerror = () => {
    gameStageBg.onerror = null;
    gameStageBg.removeAttribute('src');
  };
  gameStageBg.src = GAME_BACKGROUNDS[mode] || GAME_BACKGROUNDS.kanji;

  screenKirikae('game');
  await gameJunbi();
}

function screenKirikae(screenName) {
  document.querySelectorAll('[data-screen]').forEach(section => {
    section.hidden = section.dataset.screen !== screenName;
  });
}

document.getElementById('startButton').addEventListener('click', () => {
  screenKirikae('select');
});

document.getElementById('settingsBackButton').addEventListener('click', () => {
  screenKirikae('select');
});

document.getElementById('playButton').addEventListener('click', () => {
  gameStart(selectedMode);
});

document.getElementById('gameBackButton').addEventListener('click', () => {
  gameCancel();
  screenKirikae('settings');
});

document.getElementById('endlessEndButton').addEventListener('click', () => {
  gameEnd('manual');
});

document.getElementById('retryButton').addEventListener('click', () => {
  gameStart(selectedMode);
});

document.getElementById('resultBackButton').addEventListener('click', () => {
  screenKirikae('select');
});

screenKirikae('home');
