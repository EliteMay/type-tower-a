const DATA_FILES = {
  kanji: './data/kanji-levels.json',
  english: './data/english-words.json',
  englishKana: './data/english-kana.json'
};

const MODE_UI = {
  kanji: { prompt: '読みを入力（ひらがな）', result: '漢字の塔 CLEAR' },
  eiyaku: { prompt: '英単語を入力', result: '英訳の塔 CLEAR' },
  wayaku: { prompt: '日本語を入力（漢字・ひらがな）', result: '和訳の塔 CLEAR' }
};

let mondaiList = [];
let nokoriMondai = [];
let imaMondai = null;
let floor = 1;
let seikaiCount = 0;
let missCount = 0;
let timerId = null;
let timeLeft = 90;
let startedAt = 0;
let isJudging = false;
let gameFinished = false;

const answerForm = document.getElementById('answerForm');
const answerInput = document.getElementById('answerInput');
const judgeMessage = document.getElementById('judgeMessage');

async function gameJunbi() {
  floor = 1;
  seikaiCount = 0;
  missCount = 0;
  isJudging = false;
  gameFinished = false;
  imaMondai = null;
  judgeMessage.textContent = '';

  const modeUi = MODE_UI[selectedMode] || MODE_UI.kanji;
  document.querySelector('#questionCard p').textContent = modeUi.prompt;
  document.getElementById('resultTitle').textContent = modeUi.result;

  const endless = gameSettei.mode === 'endless';
  const gameScreen = document.querySelector('[data-screen="game"]');
  gameScreen.classList.toggle('is-endless', endless);
  document.getElementById('endlessEndButton').hidden = !endless;
  document.getElementById('modeText').textContent = endless ? 'ENDLESS' : 'NORMAL';
  document.getElementById('levelText').textContent = 'Lv.' + gameSettei.level;
  floorHyouji();

  const loaded = await mondaiLoad();
  if (!loaded) return;

  mondaiReset();
  startedAt = performance.now();
  timeStart();
  tsugiNoMondai();
}

async function hiraganaLoad() {
  const response = await fetch(DATA_FILES.englishKana, { cache: 'no-store' });
  if (!response.ok) throw new Error('ひらがなデータ HTTP ' + response.status);

  const rawText = await response.text();
  const data = JSON.parse(rawText.replace(/^\uFEFF/, '').replace(/\u3000/g, ' '));
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('ひらがなデータの形式が違います');
  }

  return data;
}

async function mondaiLoad() {
  try {
    const dataFile = selectedMode === 'kanji' ? DATA_FILES.kanji : DATA_FILES.english;
    const response = await fetch(dataFile, { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const rawText = await response.text();
    const data = JSON.parse(rawText.replace(/^\uFEFF/, '').replace(/\u3000/g, ' '));
    if (!Array.isArray(data)) throw new Error('問題データの形式が違います');

    const levelData = data.filter(item => Number(item.level) === Number(gameSettei.level));

    if (selectedMode === 'kanji') {
      mondaiList = levelData.map(item => ({
        question: item.question,
        answer: item.answer
      }));
    } else if (selectedMode === 'eiyaku') {
      mondaiList = levelData.map(item => ({
        question: item.ja,
        answer: item.enAnswers || item.en
      }));
    } else {
      const hiraganaMap = await hiraganaLoad();

      mondaiList = levelData.map(item => {
        const answers = Array.isArray(item.jaAnswers) ? [...item.jaAnswers] : [item.ja];
        const hiraganaAnswer = hiraganaMap[item.en];

        if (typeof hiraganaAnswer !== 'string' || !hiraganaAnswer.trim()) {
          throw new Error('ひらがな回答がありません: ' + item.en);
        }

        answers.push(hiraganaAnswer);

        return {
          question: item.en,
          answer: [...new Set(answers)]
        };
      });
    }

    if (mondaiList.length === 0) throw new Error('このレベルの問題がありません');
    return true;
  } catch (error) {
    console.error(error);
    mondaiList = [];
    nokoriMondai = [];
    imaMondai = null;
    document.getElementById('questionText').textContent = '---';
    judgeMessage.textContent = '問題データの読み込みに失敗しました';
    return false;
  }
}

function mondaiReset() {
  nokoriMondai = [...mondaiList];
}

function tsugiNoMondai() {
  if (nokoriMondai.length === 0) mondaiReset();

  const randomIndex = Math.floor(Math.random() * nokoriMondai.length);
  imaMondai = nokoriMondai[randomIndex];
  nokoriMondai.splice(randomIndex, 1);

  document.getElementById('questionText').textContent = imaMondai.question;
  answerInput.value = '';
  answerInput.focus();
}

answerForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!imaMondai || isJudging || gameFinished) return;

  const rawInput = answerInput.value.trim();
  if (!rawInput) return;

  const inputValue = answerSeiri(rawInput);
  isJudging = true;

  try {
    if (seikaiCheck(inputValue, imaMondai.answer, rawInput)) {
      await seikaiSyori();
    } else {
      await missSyori();
    }
  } finally {
    isJudging = false;
  }
});

function seikaiCheck(userInput, correctAnswer, rawInput = '') {
  // 発表や確認用。0を入れたら正解扱い
  if (userInput === '0' || rawInput === '0' || userInput === '０' || rawInput === '０') {
    return true;
  }

  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(ans => answerSeiri(ans) === userInput);
  }
  return answerSeiri(correctAnswer) === userInput;
}

function answerSeiri(value) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60))
    .replace(/\s+/g, ' ');
}

async function seikaiSyori() {
  seikaiCount += 1;

  if (gameSettei.mode === 'endless') {
    floorHyouji();
    judgeMessage.textContent = '正解！';
    await answerFlash('correct');
    if (gameFinished) return;
    await floorMove('up');
    if (!gameFinished) tsugiNoMondai();
    return;
  }

  if (floor >= 10) {
    judgeMessage.textContent = '10F CLEAR！';
    await answerFlash('correct');
    gameEnd('clear');
    return;
  }

  floor += 1;
  floorHyouji();
  judgeMessage.textContent = '正解！ +1F';
  await answerFlash('correct');
  if (gameFinished) return;
  await floorMove('up');
  if (!gameFinished) tsugiNoMondai();
}

async function missSyori() {
  missCount += 1;

  if (gameSettei.mode === 'endless') {
    judgeMessage.textContent = 'MISS';
    await answerFlash('miss');
    if (!gameFinished) tsugiNoMondai();
    return;
  }

  const movedDown = floor > 1;
  floor = Math.max(1, floor - 1);
  floorHyouji();
  judgeMessage.textContent = movedDown ? 'MISS -1F' : 'MISS 1F';
  await answerFlash('miss');
  if (gameFinished) return;

  if (movedDown) {
    await floorMove('down');
  } else {
    await floorBlocked('down');
  }

  if (!gameFinished) tsugiNoMondai();
}

function floorHyouji() {
  const floorText = document.getElementById('floorText');

  if (gameSettei.mode === 'endless') {
    floorText.textContent = '正解 ' + seikaiCount;
    document.querySelectorAll('[data-floor]').forEach(item => item.classList.remove('is-current'));
    return;
  }

  floorText.textContent = floor + 'F';
  document.querySelectorAll('[data-floor]').forEach(item => {
    item.classList.toggle('is-current', Number(item.dataset.floor) === floor);
  });
}

function gameCancel() {
  gameFinished = true;
  timerStop();
  isJudging = false;
}

function gameEnd(reason = 'clear') {
  if (gameFinished) return;
  gameFinished = true;
  timerStop();

  const elapsed = startedAt ? (performance.now() - startedAt) / 1000 : 0;
  const answered = seikaiCount + missCount;
  const accuracy = answered === 0 ? 0 : Math.round(seikaiCount / answered * 100);
  const modeUi = MODE_UI[selectedMode] || MODE_UI.kanji;

  if (reason === 'timeup') {
    document.getElementById('resultTitle').textContent = 'TIME UP';
  } else if (reason === 'manual') {
    document.getElementById('resultTitle').textContent = modeUi.result.replace(' CLEAR', '') + ' ENDLESS';
  } else {
    document.getElementById('resultTitle').textContent = modeUi.result;
  }

  const modeName = gameSettei.mode === 'endless' ? 'ENDLESS' : '通常';
  const timeName = gameSettei.time === null ? '無制限' : gameSettei.time + '秒';
  document.getElementById('resultSettingText').textContent = modeName + ' / Lv.' + gameSettei.level + ' / ' + timeName;
  document.getElementById('resultCorrect').textContent = seikaiCount;
  document.getElementById('resultMiss').textContent = missCount;
  document.getElementById('resultAccuracy').textContent = accuracy + '%';
  document.getElementById('resultTime').textContent = elapsed.toFixed(1) + 's';

  screenKirikae('result');
}

function timeStart() {
  timerStop();

  if (gameSettei.time === null) {
    timeLeft = null;
    timeHyouji();
    return;
  }

  timeLeft = gameSettei.time;
  timeHyouji();

  timerId = setInterval(() => {
    timeLeft -= 1;
    timeHyouji();

    if (timeLeft <= 0) {
      timerStop();
      gameEnd('timeup');
    }
  }, 1000);
}

function timerStop() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
}

function timeHyouji() {
  const timeEl = document.getElementById('timeText');
  if (timeEl) timeEl.textContent = timeLeft === null ? '∞' : timeLeft;
}
