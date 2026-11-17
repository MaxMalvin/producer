(() => {
  const NAV = [
    ['index.html', 'Главная'],
    ['about.html', 'Обо мне'],
    ['portfolio.html', 'Портфолио'],
    ['services.html', 'Услуги'],
    ['education.html', 'Обучение'],
    ['materials.html', 'Материалы'],
    ['artist.html', 'Артист'],
    ['price.html', 'Цены'],
    ['links.html', 'Links'],
  ];
  const page = location.pathname.split('/').pop() || 'index.html';
  const cur = (h) => (h === page ? ' aria-current="page"' : '');

  const closeIcon = '<span></span><span></span><span></span>';

  // Общая шапка + меню (одна точка правды для всех страниц)
  if (!document.querySelector('.site-header')) {
    document.body.insertAdjacentHTML('afterbegin', `
<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="index.html">MAX MALVIN</a>
    <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu">${closeIcon}</button>
  </div>
</header>
<div class="menu-overlay" data-menu-close></div>
<nav class="menu" id="menu" aria-label="Основное меню" aria-hidden="true">
  <ul class="menu__list">
    ${NAV.map(([h, t]) => `<li><a class="menu__link" href="${h}"${cur(h)}>${t}</a></li>`).join('')}
  </ul>
</nav>`);
  }

  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  const body = document.body;

  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.setAttribute('aria-hidden', !open);
    if (open) menu.querySelector('a').focus({ preventScroll: true });
  };

  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-close]') || e.target.closest('.menu__link')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
  });
  matchMedia('(min-width:1px)').addEventListener?.('change', () => {});

  // Нижний аудиоплеер: один на все треки. API: window.MMPlayer.play({src,title,artist,cover})
  const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>',
  };
  let player, audio, els;
  const showPlayer = () => { body.classList.add('has-player'); player.classList.add('is-visible'); };
  const hidePlayer = () => { body.classList.remove('has-player'); player.classList.remove('is-visible'); };

  const build = () => {
    body.insertAdjacentHTML('beforeend', `
<div class="player" role="region" aria-label="Аудиоплеер">
  <input class="player__seek" type="range" min="0" max="1000" step="1" value="0" aria-label="Перемотка">
  <div class="player__inner">
    <img class="player__cover" alt="" src="">
    <div class="player__info"><span class="player__title"></span><span class="player__artist"></span></div>
    <span class="player__time"></span>
    <button class="player__play" type="button" aria-label="Играть">${ICON.play}</button>
  </div>
</div>`);
    player = body.querySelector('.player');
    audio = new Audio();
    audio.preload = 'metadata';
    els = {
      cover: player.querySelector('.player__cover'),
      title: player.querySelector('.player__title'),
      artist: player.querySelector('.player__artist'),
      time: player.querySelector('.player__time'),
      play: player.querySelector('.player__play'),
      seek: player.querySelector('.player__seek'),
    };
    let seeking = false, hideTimer;
    const paint = () => {
      if (!seeking) els.seek.value = audio.duration ? Math.round((audio.currentTime / audio.duration) * 1000) : 0;
      els.seek.style.setProperty('--p', els.seek.value / 10 + '%');
      els.time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    };
    // Скрывать плеер через 7 с после паузы, если нет взаимодействия
    const armHide = () => {
      clearTimeout(hideTimer);
      if (audio.paused && !seeking) hideTimer = setTimeout(() => { if (audio.paused) hidePlayer(); }, 7000);
    };
    els.play.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
    audio.addEventListener('play', () => {
      els.play.innerHTML = ICON.pause; els.play.setAttribute('aria-label', 'Пауза');
      clearTimeout(hideTimer); showPlayer();
    });
    audio.addEventListener('pause', () => {
      els.play.innerHTML = ICON.play; els.play.setAttribute('aria-label', 'Играть');
      armHide();
    });
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('loadedmetadata', paint);
    els.seek.addEventListener('pointerdown', () => { seeking = true; clearTimeout(hideTimer); });
    els.seek.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (els.seek.value / 1000) * audio.duration;
      paint();
    });
    const endSeek = () => { seeking = false; armHide(); };
    ['pointerup', 'pointercancel', 'change'].forEach((ev) => els.seek.addEventListener(ev, endSeek));
    player.addEventListener('pointerdown', armHide);
    player.addEventListener('keydown', armHide);
    audio.addEventListener('ended', () => document.dispatchEvent(new CustomEvent('mmplayer:ended')));
    ['play', 'pause', 'ended'].forEach((ev) => audio.addEventListener(ev, () => document.dispatchEvent(new CustomEvent('mmplayer:state'))));
  };

  window.MMPlayer = {
    play({ src, title = '', artist = '', cover = '' }) {
      if (!player) build();
      if (audio.dataset.src !== src) {
        audio.pause();
        audio.src = encodeURI(src);
        audio.dataset.src = src;
        els.title.textContent = title;
        els.artist.textContent = artist;
        els.cover.src = cover ? encodeURI(cover) : '';
        els.cover.hidden = !cover;
      }
      body.classList.add('has-player');
      player.classList.add('is-visible');
      audio.play().catch(() => {});
    },
    toggle() { audio && (audio.paused ? audio.play() : audio.pause()); },
    get current() { return audio?.dataset.src || null; },
  };

  // Обложки с [data-track]: клик запускает/переключает трек в едином плеере
  const syncCovers = () => {
    const cur = window.MMPlayer.current;
    const playing = !!audio && !audio.paused;
    document.querySelectorAll('[data-track]').forEach((el) => {
      const on = el.dataset.src === cur;
      el.classList.toggle('is-active', on);
      el.classList.toggle('is-playing', on && playing);
      el.setAttribute('aria-pressed', on && playing);
    });
  };
  document.addEventListener('mmplayer:state', syncCovers);
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (!el) return;
    const d = el.dataset;
    if (d.src === window.MMPlayer.current) window.MMPlayer.toggle();
    else window.MMPlayer.play({ src: d.src, title: d.title, artist: d.artist, cover: d.cover });
  });
})();
