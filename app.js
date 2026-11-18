const $ = (selector) => document.querySelector(selector);

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function phoneHref(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function displayPhone(phone, label = "") {
  const href = phoneHref(phone);
  if (!href || href.replace(/\D/g, "").length < 7) {
    return `<span class="placeholder">${safeText(phone || "Номер будет добавлен")}</span>`;
  }
  return `<a href="tel:${safeText(href)}">${safeText(phone)}</a>${label ? `<small class="phone-label">${safeText(label)}</small>` : ""}`;
}

function renderDirections() {
  const list = $("#direction-list");

  list.innerHTML = SCHOOL_DATA.directions.map((item, index) => `
    <button class="direction-card" type="button" data-direction="${index}"
      aria-label="Подробнее о направлении ${safeText(item.title)}">
      <img src="${safeText(item.image)}" alt="${safeText(item.title)}">
      <div class="image-shade"></div>
      <div class="direction-copy">
        <span class="number">0${index + 1}</span>
        <h2>${safeText(item.title)}</h2>
        <p>Нажмите, чтобы узнать о наборе</p>
        <div class="phone">${displayPhone(item.phone)}</div>
      </div>
      <span class="card-arrow" aria-hidden="true">↗</span>
    </button>
  `).join("");

  list.querySelectorAll("[data-direction]").forEach(card => {
    card.addEventListener("click", () => openDirection(Number(card.dataset.direction)));
  });
}

function openDirection(index) {
  const item = SCHOOL_DATA.directions[index];
  if (!item) return;

  $("#panel-title").textContent = item.title;

  const coachesHTML = (item.coaches || []).map(coach => `
    <div class="coach-item">
      <span class="coach-age">${safeText(coach.age)}</span>
      <strong>${safeText(coach.name)}</strong>
    </div>
  `).join("");

  $("#panel-content").innerHTML = `
    <div class="sport-details">
      <div class="sport-image">
        <img src="${safeText(item.image)}" alt="${safeText(item.title)}">
      </div>

      <p class="sport-description">${safeText(item.description || "")}</p>

      <div class="sport-block">
        <span class="sport-label">Возраст набора</span>
        <strong class="sport-age">${safeText(item.age || "Уточняйте у школы")}</strong>
      </div>

      <div class="sport-block">
        <span class="sport-label">Тренеры и возрастные группы</span>
        <div class="coach-list">${coachesHTML}</div>
      </div>

      <div class="sport-block">
        <span class="sport-label">${safeText(item.phoneLabel || "Телефон главного тренера")}</span>
        <strong class="sport-phone">${displayPhone(item.phone)}</strong>
      </div>

      <div class="sport-note">
        По вопросам записи, расписания и набора в группы обращайтесь по указанному телефону.
      </div>
    </div>
  `;

  showPanel();
}

function renderPaid(data) {
  const cards = (data.services || []).map(service => {
    let details = "";
    const schedule = service.schedule ? `
      <div class="paid-schedule">
        <div class="paid-schedule-label">📅 Расписание</div>
        <strong>${safeText(service.schedule[0])}</strong>
        <div class="paid-schedule-times">${service.schedule.slice(1).map(time => `<span>${safeText(time)}</span>`).join("")}</div>
      </div>
    ` : "";

    if (service.groups) {
      details = service.groups.map(group => `
        <div class="paid-group">
          <div class="paid-group-title">${safeText(group.title)}</div>
          ${group.prices.map(p => `
            <div class="paid-price-row">
              <span>${safeText(p.name)}</span>
              <strong>${safeText(p.price)}</strong>
            </div>
          `).join("")}
        </div>
      `).join("");
    } else if (service.prices) {
      details = `
        <div class="paid-price-list">
          ${service.prices.map(p => `
            <div class="paid-price-row">
              <span>${safeText(p.name)}</span>
              <strong>${safeText(p.price)}</strong>
            </div>
          `).join("")}
        </div>
      `;
    } else {
      details = `
        ${service.description ? `<p class="paid-description">${safeText(service.description)}</p>` : ""}
        <div class="paid-single-price">${safeText(service.price || "")}</div>
      `;
    }

    return `<article class="paid-service-card"><h3>${safeText(service.title)}</h3>${schedule}${details}</article>`;
  }).join("");

  const discounts = (data.discounts || []).map(d => `
    <div class="paid-discount-row">
      <strong>${safeText(d.percent)}</strong>
      <span>${safeText(d.text)}</span>
    </div>
  `).join("");

  return `
    <div class="paid-content">
      <p class="paid-intro">${safeText(data.intro || "")}</p>
      <div class="paid-services">${cards}</div>
      <section class="paid-discounts">
        <h3>Скидки от стоимости услуг</h3>
        ${discounts}
      </section>
      <div class="paid-contact">
        <span>Уточнить информацию</span>
        <strong>${displayPhone(data.phone)}</strong>
      </div>
    </div>
  `;
}

function showPanel() {
  $("#overlay").classList.add("visible");
  $("#overlay").setAttribute("aria-hidden", "false");
}

function openPanel(kind) {
  const data = SCHOOL_DATA[kind];
  if (!data) return;

  $("#panel-title").textContent = data.title;

  if (kind === "paid") {
    $("#panel-content").innerHTML = renderPaid(data);
  } else {
    $("#panel-content").innerHTML = `
      <div class="contact-row">
        <span>Адрес</span>
        <strong>${safeText(data.address)}</strong>
      </div>
      <div class="contact-row">
        <span>Телефон</span>
        <strong>${displayPhone(data.phone)}</strong>
      </div>
      <div class="contact-row">
        <span>Электронная почта</span>
        <strong>${safeText(data.email)}</strong>
      </div>
      ${data.vk ? `<a class="vk-link" href="${safeText(data.vk)}" target="_blank" rel="noopener">Мы ВКонтакте ↗</a>` : ""}
    `;
  }

  showPanel();
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

$("#overlay").addEventListener("click", event => {
  if (event.target === $("#overlay")) closePanel();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanel();
});

const maxUser = window.WebApp?.initDataUnsafe?.user;
if (maxUser?.first_name) {
  $("#user-name").textContent = `, ${maxUser.first_name}`;
}
