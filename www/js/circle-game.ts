/**
 * circle-game.ts
 * Play a little prank on web surfers with this tricky script.
 * 1. Load this module onto a page.
 * 2. Bind an element with the attribute 'circle-game'.
 * 3. ???
 * 4. Hehehe
 */

let circleGamePoints = 0;

((window, document) => {
  function handleClose() {
    const dialog = document.getElementById(
      'circle-game-dialog',
    ) as HTMLDialogElement;
    if (dialog.close) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  function purgeDialog() {
    const dialog = document.getElementById('circle-game-dialog');
    const parent = dialog?.parentElement;
    if (dialog) parent?.removeChild(dialog);
  }

  function setupDialog(target: HTMLElement) {
    purgeDialog();

    const dialog = document.createElement('dialog');
    dialog.id = 'circle-game-dialog';
    dialog.innerText = `👌 psych, harley ${circleGamePoints} - you 0`;
    dialog.addEventListener('click', handleClose);

    const { parentNode } = target;
    if (parentNode) parentNode.insertBefore(dialog, target);
  }

  function gotcha({ currentTarget }: Event) {
    circleGamePoints += 1;

    if (currentTarget) setupDialog(currentTarget as HTMLElement);

    const dialog = document.getElementById(
      'circle-game-dialog',
    ) as HTMLDialogElement;

    if (dialog) {
      dialog.innerText = `👌 psych, harley ${circleGamePoints} - you 0`;
    }

    if (dialog.showModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', 'true');
    }
  }

  function initialise() {
    const baits = document.querySelectorAll('[circle-game]');
    baits.forEach((bait) => {
      bait.addEventListener('click', gotcha, false);
    });
  }

  window.addEventListener('load', initialise, false);
})(window, document);
