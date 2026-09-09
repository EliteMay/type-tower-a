function wait(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

async function playFloorMove(direction){
  const stage=document.querySelector('.game-stage');
  if(!stage) return;

  const className=direction==='up' ? 'move-up' : 'move-down';
  stage.classList.remove('move-up','move-down');
  void stage.offsetWidth;
  stage.classList.add(className);
  await wait(340);
  stage.classList.remove(className);
}

async function flashAnswer(type){
  const card=document.getElementById('questionCard');
  if(!card) return;

  const className=type==='correct' ? 'is-correct' : 'is-miss';
  card.classList.remove('is-correct','is-miss');
  void card.offsetWidth;
  card.classList.add(className);
  await wait(250);
  card.classList.remove(className);
}
