(() => {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = 'span[data-type="url"] { pointer-events: none; }';

  let controlPressed = false;

  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'control' && !controlPressed) {
      controlPressed = true;
      style.remove();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key.toLowerCase() === 'control' && controlPressed) {
      controlPressed = false;
      document.body.appendChild(style);
    }
  });

  document.body.appendChild(style);
})();
