const $ = (selector) => document.querySelector(selector);

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function displayPhone(phone) {
  const cleaned = String(phone || "").replace(/[^+\d]/g, "");
  if (cleaned.length >= 7) return `<a href="tel:${cleaned}">${safeText(phone)}</a>`;
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
function renderPaid(data) {
  const cards = (data.services || []).map(service => {
    let details = "";
    if (service.groups) {
      details = service.groups.map(group => `
        <div class="paid-group">
          <div class="paid-group-title">${safeText(group.title)}</div>
          ${group.prices.map(p => `<div class="paid-price-row"><span>${safeText(p.name)}</span><strong>${safeText(p.price)}</strong></div>`).join("")}
        </div>`).join("");
    } else if (service.prices) {
      details = `<div class="paid-price-list">${service.prices.map(p => `<div class="paid-price-row"><span>${safeText(p.name)}</span><strong>${safeText(p.price)}</strong></div>`).join("")}</div>`;
    } else {
      details = `${service.description ? `<p class="paid-description">${safeText(service.description)}</p>` : ""}<div class="paid-single-price">${safeText(service.price || "")}</div>`;
    }
    return `<article class="paid-service-card"><h3>${safeText(service.title)}</h3>${details}</article>`;
  }).join("");

  const discounts = (data.discounts || []).map(d =>
    `<div class="paid-discount-row"><strong>${safeText(d.percent)}</strong><span>${safeText(d.text)}</span></div>`
  ).join("");

  return `<div class="paid-content">
    <p class="paid-intro">${safeText(data.intro || "")}</p>
    <div class="paid-services">${cards}</div>
    <section class="paid-discounts"><h3>Скидки от стоимости услуг</h3>${discounts}</section>
    <div class="paid-contact"><span>Уточнить информацию</span><strong>${displayPhone(data.phone)}</strong></div>
  </div>`;
}
function openPanel(kind) {
  const data = SCHOOL_DATA[kind];
  if (!data) return;
  $("#panel-title").textContent = data.title;
  if (kind === "paid") {
    $("#panel-content").innerHTML = renderPaid(data);
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
document.querySelectorAll("[data-panel]").forEach(button => button.addEventListener("click", () => openPanel(button.dataset.panel)));
$("#close-panel").addEventListener("click", closePanel);
$("#overlay").addEventListener("click", event => { if (event.target === $("#overlay")) closePanel(); });
const maxUser = window.WebApp?.initDataUnsafe?.user;
if (maxUser?.first_name) $("#user-name").textContent = `, ${maxUser.first_name}`;
