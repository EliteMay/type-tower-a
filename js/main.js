function showScreen(name) {
  document.querySelectorAll('[data-screen]').forEach(screen => {
    screen.hidden = screen.dataset.screen !== name;
  });
}

document.getElementById('startButton').addEventListener('click', () => {
  showScreen('select');
});
