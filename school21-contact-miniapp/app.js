const $ = (selector) => document.querySelector(selector);

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function displayPhone(phone) {
  const cleaned = String(phone || "").replace(/[^+\d]/g, "");
  if (cleaned.length >= 7) {
    return `<a href="tel:${cleaned}">${safeText(phone)}</a>`;
  }
  return `<span class="placeholder">${safeText(phone || "Номер будет добавлен")}</span>`;
}

function renderDirections() {
  $("#direction-list").innerHTML = SCHOOL_DATA.directions.map((item, index) => `
    <article class="direction-card">
      <img src="${safeText(item.image)}" alt="${safeText(item.title)}">
      <div class="image-shade"></div>
      <div class="direction-copy">
        <span class="number">0${index + 1}</span>
        <h2>${safeText(item.title)}</h2>
        <p>Для уточнения информации</p>
        <div class="phone">${displayPhone(item.phone)}</div>
      </div>
    </article>
  `).join("");
}

function openPanel(kind) {
  const data = SCHOOL_DATA[kind];
  if (!data) return;
  $("#panel-title").textContent = data.title;
  if (kind === "paid") {
    $("#panel-content").innerHTML = `<p>${safeText(data.text)}</p><div class="contact-row"><span>Телефон</span><strong>${displayPhone(data.phone)}</strong></div>`;
  } else {
    $("#panel-content").innerHTML = `
      <div class="contact-row"><span>Адрес</span><strong>${safeText(data.address)}</strong></div>
      <div class="contact-row"><span>Телефон</span><strong>${displayPhone(data.phone)}</strong></div>
      <div class="contact-row"><span>Электронная почта</span><strong>${safeText(data.email)}</strong></div>
      ${data.vk ? `<a class="vk-link" href="${safeText(data.vk)}" target="_blank" rel="noopener">Мы ВКонтакте ↗</a>` : ""}
    `;
  }
  $("#overlay").classList.add("visible");
  $("#overlay").setAttribute("aria-hidden", "false");
}

function closePanel() {
  $("#overlay").classList.remove("visible");
  $("#overlay").setAttribute("aria-hidden", "true");
}

renderDirections();
document.querySelectorAll("[data-panel]").forEach(button => {
  button.addEventListener("click", () => openPanel(button.dataset.panel));
});
$("#close-panel").addEventListener("click", closePanel);
$("#overlay").addEventListener("click", (event) => {
  if (event.target === $("#overlay")) closePanel();
});

// Имя передается MAX Bridge. В обычном браузере останется нейтральное приветствие.
const maxUser = window.WebApp?.initDataUnsafe?.user;
if (maxUser?.first_name) {
  $("#user-name").textContent = `, ${maxUser.first_name}`;
}
