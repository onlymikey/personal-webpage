function initPollWidget() {
  const pollForm = document.querySelector('form[action*="poll.pollcode.com"]');
  if (!pollForm) return;

  pollForm.classList.add("poll");

  // eliminar estilos inline
  pollForm.querySelectorAll("[style]").forEach(el => {
    el.removeAttribute("style");
  });

  // obtener pregunta
  const strong = pollForm.querySelector("strong");
  if (strong) {
    const question = document.createElement("p");
    question.className = "poll__question";
    question.textContent = strong.textContent;
    pollForm.prepend(question);
    strong.remove();
  }

  // envolver radios en poll__options
  const optionsWrapper = document.createElement("div");
  optionsWrapper.className = "poll__options";

  const radios = pollForm.querySelectorAll('input[type="radio"]');

  radios.forEach(radio => {
    const label = pollForm.querySelector(`label[for="${radio.id}"]`);
    if (!label) return;

    const optionLabel = document.createElement("label");
    optionLabel.className = "poll__option";

    optionLabel.appendChild(radio);
    optionLabel.appendChild(document.createTextNode(label.textContent));

    optionsWrapper.appendChild(optionLabel);
    label.remove();
  });

  pollForm.appendChild(optionsWrapper);

  // convertir botones submit
  const submits = pollForm.querySelectorAll('input[type="submit"]');
  const actions = document.createElement("div");
  actions.className = "poll__actions";

  submits.forEach(btn => {
    const button = document.createElement("button");
    button.type = btn.name === "view" ? "submit" : "submit";
    if (btn.name === "view") button.name = "view";
    button.value = btn.value;
    button.className = "poll__btn";
    button.textContent = btn.value.trim().toLowerCase();
    actions.appendChild(button);
    btn.remove();
  });

  pollForm.appendChild(actions);

  // eliminar restos de divs vacíos
  pollForm.querySelectorAll("div").forEach(div => {
    if (!div.className && !div.textContent.trim()) {
      div.remove();
    }
  });

  // eliminar footer pollcode
  const footerLink = pollForm.querySelector('a[href*="pollcode.com"]');
  if (footerLink) {
    footerLink.closest("div")?.remove();
  }
}

document.addEventListener("DOMContentLoaded", initPollWidget);
