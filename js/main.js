let selectedMode='kanji';

document.querySelectorAll('[data-mode]').forEach(button=>{
  button.addEventListener('click',()=>{
    startGame(button.dataset.mode);
  });
});

function startGame(mode) {
  selectedMode=mode;
  showScreen('game');
}
