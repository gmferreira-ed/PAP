function Redirect(Page) {
    window.location.href = Page;
}
  
function ShowLoader() {

      const overlay = document.createElement('div');
      overlay.className = 'loader-overlay';

      const loadercontainer = document.createElement('div');
      loadercontainer.className = 'loader-container';

      overlay.appendChild(loadercontainer);

      const loader = document.createElement('div');
      loader.className = 'loader';

      loadercontainer.appendChild(loader);

      document.body.appendChild(overlay);
}

function HideLoader() {
      const overlay = document.querySelector('.loader-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
}

function ConfirmPrompt(message, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';

    const promptBox = document.createElement('div');
    promptBox.className = 'prompt-box';

    const promptMessage = document.createElement('div');
    promptMessage.className = 'prompt-message';
    promptMessage.textContent = message;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'prompt-buttons';

    const yesButton = document.createElement('button');
    yesButton.className = 'prompt-button yes';
    yesButton.textContent = 'Yes';
    yesButton.onclick = () => {
      callback(true); 
      document.body.removeChild(overlay); 
    };

    // No button
    const noButton = document.createElement('button');
    noButton.className = 'prompt-button no';
    noButton.textContent = 'No';
    noButton.onclick = () => {
      callback(false); 
      document.body.removeChild(overlay); 
    };

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);

    promptBox.appendChild(promptMessage);
    promptBox.appendChild(buttonContainer);

    overlay.appendChild(promptBox);

    document.body.appendChild(overlay);
}

