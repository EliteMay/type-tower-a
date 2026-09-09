function wait(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

async function playFloorMove(direction){
  const scene=document.getElementById('towerScene');
  const className=direction==='up' ? 'move-up' : 'move-down';
  scene.classList.remove('move-up','move-down');
  void scene.offsetWidth;
  scene.classList.add(className);
  await wait(340);
  scene.classList.remove(className);
}

async function flashAnswer(type){
  const card=document.getElementById('questionCard');
  const className=type==='correct' ? 'is-correct' : 'is-miss';
  card.classList.remove('is-correct','is-miss');
  void card.offsetWidth;
  card.classList.add(className);
  await wait(250);
  card.classList.remove(className);
}
