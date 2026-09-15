let selectedMode = 'kanji';
let isGameLoading = false;

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

const LOADING_STEP_COUNT = 3;
const MIN_LOADING_DURATION_MS = 5000;

function loadingReset() {
  const panel = document.getElementById('loadingPanel');
  const backButton = document.getElementById('loadingBackButton');

  panel.classList.remove('is-error');
  backButton.hidden = true;
  loadingProgressSet(0, '空と塔を読み込んでいます');
}

function loadingProgressSet(value, statusText) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const progress = document.getElementById('loadingProgress');
  const progressBar = document.getElementById('loadingProgressBar');
  const percent = document.getElementById('loadingPercent');
  const status = document.getElementById('loadingStatus');

  progress.setAttribute('aria-valuenow', String(safeValue));
  progressBar.style.width = safeValue + '%';
  percent.textContent = safeValue + '%';
  if (statusText) status.textContent = statusText;
}

function loadingFailure(message) {
  const panel = document.getElementById('loadingPanel');
  const backButton = document.getElementById('loadingBackButton');

  panel.classList.add('is-error');
  document.getElementById('loadingStatus').textContent = message;
  backButton.hidden = false;
}

function preloadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

function loadingStepComplete(completedSteps, statusText) {
  const value = completedSteps / LOADING_STEP_COUNT * 100;
  loadingProgressSet(value, statusText);
}

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
  if (isGameLoading) return;
  isGameLoading = true;
  selectedMode = mode;

  const gameScreen = document.querySelector('[data-screen="game"]');
  const backgroundSrc = GAME_BACKGROUNDS[mode] || GAME_BACKGROUNDS.kanji;
  gameScreen.dataset.mode = mode;

  loadingReset();
  screenKirikae('loading');

  // ロードが速い環境でも画面を確認できるよう、最低5秒は表示する。
  // ゲーム本体のタイマーはこの待機後に開始するため、制限時間は減らない。
  const minimumLoadingTime = new Promise(resolve => {
    setTimeout(resolve, MIN_LOADING_DURATION_MS);
  });

  let completedSteps = 0;
  const completeStep = statusText => {
    completedSteps += 1;
    loadingStepComplete(completedSteps, statusText);
  };

  try {
    const [skyReady, towerReady] = await Promise.all([
      preloadImage('assets/images/sky.jpg').then(result => {
        completeStep('塔の景色を読み込んでいます');
        return result;
      }),
      preloadImage(backgroundSrc).then(result => {
        completeStep('塔の景色を読み込んでいます');
        return result;
      })
    ]);

    // 画像が取得できなくても、従来どおり問題部分は遊べるように続行する。
    if (!skyReady || !towerReady) {
      console.warn('一部の背景画像を読み込めませんでした');
    }

    loadingProgressSet(completedSteps / LOADING_STEP_COUNT * 100, 'ゲーム開始を準備しています');
    await minimumLoadingTime;

    loadingProgressSet(completedSteps / LOADING_STEP_COUNT * 100, '問題データを読み込んでいます');
    await gameJunbi();
    completeStep('準備完了');

    if (!imaMondai) {
      gameCancel();
      loadingFailure('問題データを読み込めませんでした');
      return;
    }

    document.querySelectorAll('.game-stage-bg').forEach(gameStageBg => {
      gameStageBg.onerror = () => {
        gameStageBg.onerror = null;
        gameStageBg.removeAttribute('src');
      };
      gameStageBg.src = backgroundSrc;
    });

    screenKirikae('game');
    requestAnimationFrame(() => {
      document.getElementById('answerInput').focus();
    });
  } catch (error) {
    console.error(error);
    gameCancel();
    loadingFailure('読み込み中にエラーが発生しました');
  } finally {
    isGameLoading = false;
  }
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

document.getElementById('loadingBackButton').addEventListener('click', () => {
  gameCancel();
  isGameLoading = false;
  screenKirikae('settings');
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
