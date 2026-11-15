/* =====================================================
   НАСТРОЙКИ САЙТА — всё, что нужно менять, находится здесь
   ===================================================== */
var SITE = {
  // Ссылки (в кавычках). Если ссылка пустая, кнопка с ней на сайте не показывается.
  links: {
    tg: "https://t.me/MusicMaks",                  // личный Telegram
    channel: "https://t.me/+HkLnCbRnTKdjMWIy",     // Telegram-канал
    youtube: "",                                   // YouTube-канал (пока нет — кнопка скрыта)
    email: "musicmaks@mail.ru"                     // почта
  },

  // Данные для подвала. Пустые поля в подвале не показываются.
  person: {
    status: "Самозанятый",
    name: "Малышев Максим Александрович",
    inn: "025700470116",
    region: "Москва",
    activity: "Артист, музыкант, певец"
  },

  // Страница «Портфолио». Добавляй работы в этот список, по одной в фигурных скобках через запятую:
  // { title: "Название трека", artist: "Артист", roles: ["Аранжировка", "Сведение"],
  //   audio: "assets/audio/track.mp3",      // файл рядом с сайтом (необязательно)
  //   link: "https://..." }                 // ссылка на релиз или клип (необязательно)
  works: [],

  // Страница «Полезное». Бесплатные гайды и PDF:
  // { title: "Название", text: "Короткое описание", file: "assets/files/guide.pdf" }
  materials: []
};

/* ===================================================== */

(function () {
  var NAV = [
    ["index.html", "Главная"],
    ["about.html", "Обо мне"],
    ["portfolio.html", "Портфолио"],
    ["courses.html", "Курсы и тренинги"],
    ["useful.html", "Полезное"],
    ["contacts.html", "Контакты"]
  ];

  var current = location.pathname.split("/").pop() || "index.html";

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* ---------- Шапка и меню ---------- */
  var logo = '<svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">' +
    '<rect x="0" y="4" width="3" height="8" rx="1.5"/><rect x="7.5" y="0" width="3" height="16" rx="1.5"/>' +
    '<rect x="15" y="5" width="3" height="6" rx="1.5"/></svg>';

  var menuLinks = NAV.map(function (n) {
    return '<a class="menu__link" href="' + n[0] + '"' + (n[0] === current ? ' aria-current="page"' : "") + ">" + n[1] + "</a>";
  }).join("");

  var header =
    '<header class="site-header" id="header"><div class="site-header__in">' +
    '<a class="logo" href="index.html" aria-label="Max Malvin, на главную">' + logo + "<span>Max Malvin</span></a>" +
    '<button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="menu" aria-label="Открыть меню"><span></span><span></span></button>' +
    "</div></header>" +
    '<div class="menu" id="menu" aria-hidden="true"><div class="menu__in"><nav aria-label="Меню">' + menuLinks + "</nav>" +
    '<div class="menu__foot"><a class="btn btn--solid" data-link="tg" href="#" target="_blank" rel="noopener">Написать лично в Telegram</a></div></div></div>';

  document.body.insertAdjacentHTML("afterbegin", header);

  /* ---------- Подвал ---------- */
  var p = SITE.person;
  var reqs = '<li>' + esc((p.status + " " + p.name).trim()) + "</li>" +
    (p.inn ? "<li>ИНН " + esc(p.inn) + "</li>" : "") +
    (p.region ? "<li>Регион: " + esc(p.region) + "</li>" : "") +
    (p.activity ? "<li>Сфера деятельности: " + esc(p.activity) + "</li>" : "") +
    (SITE.links.email ? '<li><a href="mailto:' + esc(SITE.links.email) + '">' + esc(SITE.links.email) + "</a></li>" : "") +
    (SITE.links.tg ? '<li><a href="' + esc(SITE.links.tg) + '" target="_blank" rel="noopener">Telegram: @' + esc(SITE.links.tg.split("/").pop()) + "</a></li>" : "");

  var footNav = NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + "</a>"; }).join("");

  var footer =
    '<footer class="site-footer"><div class="site-footer__in">' +
    '<div><p class="brand">Max <span>Malvin</span></p><p>Музыкальный продюсер и звукорежиссёр</p></div>' +
    '<nav aria-label="Разделы сайта">' + footNav + "</nav>" +
    '<ul class="reqs">' + reqs + "</ul>" +
    '<div class="legal"><a href="privacy.html">Политика конфиденциальности</a><a href="offer.html">Публичная оферта</a></div>' +
    '<p class="copy">© ' + new Date().getFullYear() + " Макс Малвин</p>" +
    "</div></footer>";

  var fSlot = document.getElementById("footer");
  if (fSlot) fSlot.outerHTML = footer; else document.body.insertAdjacentHTML("beforeend", footer);

  /* ---------- Закреплённая кнопка ---------- */
  document.body.insertAdjacentHTML("beforeend",
    '<div class="dock is-hidden" id="dock"><a class="btn btn--solid" data-link="tg" href="#" target="_blank" rel="noopener">Написать лично в Telegram</a></div>');

  /* ---------- Список работ и материалов ---------- */
  function node(html) { var t = document.createElement("div"); t.innerHTML = html; return t.firstChild; }

  var worksEl = document.getElementById("works");
  if (worksEl) {
    if (!SITE.works.length) {
      worksEl.innerHTML = '<div class="card"><h3>Примеры работ скоро появятся</h3><p>Пока смотрите и слушайте мои проекты на канале.</p>' +
        '<a class="btn btn--ghost" data-link="channel" href="#" target="_blank" rel="noopener">Канал в Telegram</a></div>';
    } else {
      SITE.works.forEach(function (w) {
        var meta = [w.artist, (w.roles || []).join(", ")].filter(Boolean).join(" · ");
        worksEl.appendChild(node('<article class="item"><h3>' + esc(w.title) + "</h3>" + (meta ? '<p class="meta">' + esc(meta) + "</p>" : "") +
          (w.audio ? '<audio controls preload="none" src="' + esc(w.audio) + '"></audio>' : "") +
          (w.link ? '<a class="btn btn--ghost" href="' + esc(w.link) + '" target="_blank" rel="noopener">Открыть</a>' : "") + "</article>"));
      });
    }
  }

  var matEl = document.getElementById("materials");
  if (matEl) {
    if (!SITE.materials.length) {
      matEl.innerHTML = '<div class="card"><h3>Материалы появятся здесь</h3><p>Короткие гайды и PDF по работе с музыкой и DAW. Новое выходит в канале.</p>' +
        '<a class="btn btn--ghost" data-link="channel" href="#" target="_blank" rel="noopener">Канал в Telegram</a></div>';
    } else {
      SITE.materials.forEach(function (m) {
        matEl.appendChild(node('<article class="item"><h3>' + esc(m.title) + "</h3>" +
          (m.text ? '<p class="text">' + esc(m.text) + "</p>" : "") +
          '<a class="btn btn--ghost" href="' + esc(m.file) + '" download>Скачать</a></article>'));
      });
    }
  }

  /* ---------- Подстановка ссылок (пустая ссылка — кнопка скрыта) ---------- */
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var key = el.getAttribute("data-link");
    var v = SITE.links[key];
    if (!v) { el.hidden = true; return; }
    if (key === "email") { el.href = "mailto:" + v; if (el.hasAttribute("data-show")) el.textContent = v; }
    else { el.href = v; }
  });

  /* ---------- Меню ---------- */
  var btn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  var head = document.getElementById("header");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    menu.setAttribute("aria-hidden", !open);
    document.body.classList.toggle("no-scroll", open);
    head.classList.toggle("is-solid", open || window.scrollY > 24);
  }
  btn.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Прокрутка: шапка и закреплённая кнопка ---------- */
  var dock = document.getElementById("dock");
  function onScroll() {
    var y = window.scrollY;
    if (!menu.classList.contains("is-open")) head.classList.toggle("is-solid", y > 24);
    dock.classList.toggle("is-hidden", y < window.innerHeight * 0.6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Эквалайзер на главной ---------- */
  var wave = document.getElementById("wave");
  if (wave) {
    for (var i = 0; i < 56; i++) {
      var h = .16 + .84 * Math.abs(Math.sin(i * .52) * Math.sin(i * .17 + 1.1));
      var s = document.createElement("span");
      s.style.height = Math.round(h * 100) + "%";
      s.style.setProperty("--i", i);
      wave.appendChild(s);
    }
  }

  /* ---------- Вкладки (курсы) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t, idx) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var next = tabs[(idx + 1) % tabs.length];
        select(next); next.focus();
      }
    });
  });
})();
