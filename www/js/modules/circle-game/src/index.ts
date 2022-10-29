let circleGamePoints = 0;

(() => {
  function handleClose() {
    const dialog = document.getElementById(
      "circle-game-dialog"
    ) as HTMLDialogElement;
    if (dialog.close) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function gotcha() {
    circleGamePoints += 1;

    const dialog = document.getElementById(
      "circle-game-dialog"
    ) as HTMLDialogElement;

    if (dialog) {
      dialog.innerHTML = `👌 psych, harley ${circleGamePoints} - you 0`;
    }

    if (dialog.showModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "true");
    }
  }

  function initialise() {
    const dialog = document.createElement("dialog");
    dialog.id = "circle-game-dialog";
    dialog.innerHTML = `👌 psych, harley ${circleGamePoints} - you 0`;
    dialog.addEventListener("click", handleClose);
    document.body.prepend(dialog);

    const baits = document.querySelectorAll("[circle-game]");
    baits.forEach((bait) => {
      bait.addEventListener("click", gotcha, false);
    });
  }
  window.addEventListener("load", initialise, false);
})();
