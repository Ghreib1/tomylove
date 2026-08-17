const HER_NAME = new URLSearchParams(location.search).get('name') || '';

const pleas = [
  { text: 'Wait... are you sure?', emoji: '🥺' },
  { text: 'Think about it again!!', emoji: '😿' },
  { text: 'Pretty please??', emoji: '💔' },
  { text: "My heart can't take this...", emoji: '😭' },
  { text: 'The NO button is getting scared', emoji: '🫣' },
  { text: 'You know you want to say YES', emoji: '💕' },
];

const gifts = [
  {
    tag: 'PRESS PLAY',
    emoji: '🎬',
    title: 'A Little Video',
    teaser: 'Just watch...',
  },
  {
    tag: 'MEMORIES',
    emoji: '📸',
    title: 'Gallery',
    teaser: 'A few of my favorites',
  },
  {
    tag: 'FROM THE HEART',
    emoji: '💌',
    title: 'The Letter',
    teaser: 'Something I wrote for you',
  },
];

const questionScreen = document.getElementById('questionScreen');
const giftScreen = document.getElementById('giftScreen');
const videoScreen = document.getElementById('videoScreen');
const galleryScreen = document.getElementById('galleryScreen');
const letterScreen = document.getElementById('letterScreen');
const questionText = document.getElementById('questionText');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const catBox = document.getElementById('catBox');
const heartsBox = document.getElementById('floatingHearts');
const giftButtons = document.querySelectorAll('.gift');
const giftHint = document.getElementById('giftHint');
const progressDots = document.querySelectorAll('#progressDots .dot');

const screens = {
  ask: questionScreen,
  gifts: giftScreen,
  'gift-0': videoScreen,
  'gift-1': galleryScreen,
  'gift-2': letterScreen,
};

const faces = {
  happy: document.getElementById('faceHappy'),
  pleading: document.getElementById('facePleading'),
  crying: document.getElementById('faceCrying'),
};

function setHeading(el, text, heartEmoji) {
  el.textContent = text + ' ';
  const span = document.createElement('span');
  span.className = 'heart-emoji';
  span.textContent = heartEmoji;
  el.appendChild(span);
}

setHeading(questionText, HER_NAME ? HER_NAME + ', do you love me?' : 'Do you love me?', '❤️');
if (HER_NAME) {
  setHeading(document.getElementById('yesTitle'), "I knew you'd say yes, " + HER_NAME, '💘');
  document.title = HER_NAME + ', do you love me? 💗';
}

giftButtons.forEach((btn) => {
  const gift = gifts[Number(btn.dataset.gift)];
  btn.querySelector('.gift-tag').textContent = gift.tag;
  btn.querySelector('.gift-emoji').textContent = gift.emoji;
  btn.querySelector('.gift-label').textContent = gift.title.toUpperCase();
  btn.querySelector('.gift-teaser').textContent = gift.teaser;
});

let noClicks = 0;
let answered = false;
let noBtnOrigin = null;

function setFace(name) {
  Object.values(faces).forEach((f) => f.classList.add('hidden'));
  faces[name].classList.remove('hidden');
}

const NO_CLICK_LIMIT = 3;

function reactToNo() {
  noClicks++;

  const plea = pleas[Math.min(noClicks - 1, pleas.length - 1)];
  setHeading(questionText, plea.text, plea.emoji);

  if (noClicks >= NO_CLICK_LIMIT) setFace('crying');
  else if (noClicks >= 2) setFace('pleading');
  catBox.classList.remove('shake');
  void catBox.offsetWidth;
  catBox.classList.add('shake');

  const yesScale = Math.min(1 + noClicks * 0.32, 2.6);
  yesBtn.style.fontSize = 1.35 * yesScale + 'rem';
  yesBtn.style.padding = 0.9 * yesScale + 'rem ' + 2.6 * yesScale + 'rem';

  const noScale = Math.max(1 - noClicks * 0.16, 0.3);
  noBtn.style.fontSize = 1.35 * noScale + 'rem';
  noBtn.style.padding = 0.9 * noScale + 'rem ' + 2.6 * noScale + 'rem';

  playSound('sad');
  dodge();

  if (noClicks >= NO_CLICK_LIMIT) {
    noBtn.style.opacity = '0';
    noBtn.style.pointerEvents = 'none';
    setHeading(questionText, 'Looks like YES is the only option now', '😌💕');
  }
}

function dodge() {
  if (!noBtnOrigin) {
    noBtn.style.transform = 'translate(0, 0)';
    const r = noBtn.getBoundingClientRect();
    noBtnOrigin = { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  const margin = 16;
  const maxX = Math.max(window.innerWidth - noBtnOrigin.w - margin * 2, 0);
  const maxY = Math.max(window.innerHeight - noBtnOrigin.h - margin * 2, 0);
  const targetX = margin + Math.random() * maxX;
  const targetY = margin + Math.random() * maxY;

  noBtn.style.transform =
    'translate(' + (targetX - noBtnOrigin.x) + 'px, ' + (targetY - noBtnOrigin.y) + 'px)';
}

noBtn.addEventListener('click', reactToNo);

function navigate(page) {
  const hash = '#' + page;
  if (location.hash === hash) render();
  else location.hash = hash;
}

function render() {
  let page = (location.hash || '#ask').slice(1);

  if (!screens[page]) page = 'ask';
  if (page !== 'ask' && !answered) page = 'ask';

  const canonicalHash = '#' + page;
  if (location.hash !== canonicalHash) {
    history.replaceState(null, '', canonicalHash);
  }

  const target = screens[page] || questionScreen;

  if (page.indexOf('gift-') === 0) {
    const btn = giftButtons[Number(page.slice(5))];
    if (btn) btn.classList.add('opened');
  }

  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.add('hidden');
    s.classList.remove('page-enter');
  });
  target.classList.remove('hidden');
  void target.offsetWidth;
  target.classList.add('page-enter');

  updateProgressDots(page);
  window.scrollTo(0, 0);
}

function updateProgressDots(page) {
  const step = page === 'ask' ? 0 : 1;
  progressDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === step);
    dot.classList.toggle('done', i < step);
  });
}

window.addEventListener('hashchange', render);

yesBtn.addEventListener('click', () => {
  answered = true;
  navigate('gifts');
  playSound('yay');
  heartBurst(50);
});

giftButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    navigate('gift-' + btn.dataset.gift);
  });
});

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => navigate('gifts'));
});

const HEARTS = ['💗', '💖', '💕', '💞', '🩷', '❤️', '💓', '✨'];

function spawnEmoji(pool) {
  const heart = document.createElement('span');
  heart.textContent = pool[Math.floor(Math.random() * pool.length)];
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = 0.9 + Math.random() * 1.7 + 'rem';
  heart.style.animationDuration = 5 + Math.random() * 6 + 's';
  heartsBox.appendChild(heart);
  setTimeout(() => heart.remove(), 12000);
}

function heartBurst(count) {
  for (let i = 0; i < count; i++) setTimeout(() => spawnEmoji(HEARTS), i * 50);
}

setInterval(() => spawnEmoji(HEARTS), 900);
heartBurst(8);

if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
  const SPARKLE_TRAIL = ['✨', '💗'];
  let lastSparkleAt = 0;

  document.addEventListener('pointermove', (e) => {
    const now = Date.now();
    if (now - lastSparkleAt < 110) return;
    lastSparkleAt = now;

    const el = document.createElement('span');
    el.className = 'cursor-sparkle';
    el.textContent = SPARKLE_TRAIL[Math.floor(Math.random() * SPARKLE_TRAIL.length)];
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  });
}

let audioCtx;

function playSound(kind) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = {
      pop: [523.25],
      sad: [392, 329.63],
      yay: [523.25, 659.25, 783.99, 1046.5],
    }[kind];

    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = audioCtx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {
  }
}

history.replaceState(null, '', '#ask');
render();
