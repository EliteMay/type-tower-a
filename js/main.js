let selectedMode='kanji';

document.querySelectorAll('[data-mode]').forEach(button=>{
  button.addEventListenor('click',()=>{
    startGame(button.dataset.mode);
  });
});

function startGame(mode) {
  selectedMode=mode;
  showScreen('game');
}
