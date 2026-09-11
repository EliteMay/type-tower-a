function waitMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function motionWait(normalDuration) {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : normalDuration;
}

async function floorMove(direction) {
  const stage = document.querySelector('.game-stage');
  if (!stage) return;

  const className = direction === 'up' ? 'move-up' : 'move-down';
  stage.classList.remove('move-up', 'move-down', 'floor-blocked-down');
  void stage.offsetWidth;
  stage.classList.add(className);
  await waitMs(motionWait(720));
  stage.classList.remove(className);
}

async function floorBlocked() {
  const stage = document.querySelector('.game-stage');
  if (!stage) return;

  stage.classList.remove('move-up', 'move-down', 'floor-blocked-down');
  void stage.offsetWidth;
  stage.classList.add('floor-blocked-down');
  await waitMs(motionWait(300));
  stage.classList.remove('floor-blocked-down');
}

async function answerFlash(type) {
  const card = document.getElementById('questionCard');
  if (!card) return;

  const className = type === 'correct' ? 'is-correct' : 'is-miss';
  card.classList.remove('is-correct', 'is-miss');
  void card.offsetWidth;
  card.classList.add(className);
  await waitMs(250);
  card.classList.remove(className);
}
