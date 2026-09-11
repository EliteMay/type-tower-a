function waitMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function floorMove(direction) {
  const stage = document.querySelector('.game-stage');
  if (!stage) return;

  const className = direction === 'up' ? 'move-up' : 'move-down';
  stage.classList.remove('move-up', 'move-down');
  void stage.offsetWidth;
  stage.classList.add(className);
  await waitMs(340);
  stage.classList.remove(className);
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
