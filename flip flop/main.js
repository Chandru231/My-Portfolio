// --- Game State ---
const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timeEl  = document.getElementById('time');
const bestEl  = document.getElementById('best');
const restartBtn = document.getElementById('restart');
const difficultySel = document.getElementById('difficulty');

const EMOJIS = ['🍎','🍋','🍇','🍉','🍓','🍒','🍍','🥝','🥑','🥥','🫐','🍑','🌶️','🌽','🥕','🍄','🧀','🍔','🍕','🍪','🍰','🍩','🥨','🍗','🍤','🍣','🍜','🍙','☕','🍵','⚽','🏀','🎯','🎲','🎮','🎧','🎹','🎻','🎸','🧩'];

let firstCard = null;
let lock = false;
let moves = 0; 
let matchedPairs = 0;
let timer = null; 
let seconds = 0;

const keyForBest = (size) => `memory-best-${size}`;

function formatTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const r = (s%60).toString().padStart(2,'0');
  return `${m}:${r}`;
}

function startTimer(){
  stopTimer();
  seconds = 0; timeEl.textContent = formatTime(0);
  timer = setInterval(() => { seconds++; timeEl.textContent = formatTime(seconds); }, 1000);
}
function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } }

function setGrid(size){
  const [cols, rows] = size.split('x').map(Number);
  boardEl.style.setProperty('grid-template-columns', `repeat(${cols}, var(--card-size))`);
  const base = (cols*rows >= 30) ? 70 : (cols*rows >= 20 ? 80 : 90);
  document.documentElement.style.setProperty('--card-size', base + 'px');
}

function buildDeck(size){
  const [cols, rows] = size.split('x').map(Number);
  const total = cols * rows;
  const pairs = total / 2;
  const picks = shuffle(EMOJIS).slice(0, pairs);
  const deck = shuffle([...picks, ...picks]);
  matchedPairs = 0; moves = 0; movesEl.textContent = '0';
  boardEl.innerHTML = '';
  deck.forEach((emoji, idx) => boardEl.appendChild(createCard(emoji, idx)));
  updateBest(size);
  setGrid(size);
  startTimer();
}

function updateBest(size){
  const best = localStorage.getItem(keyForBest(size));
  bestEl.textContent = best ? best : '—';
}

function recordBest(size){
  const best = localStorage.getItem(keyForBest(size));
  if(!best){ localStorage.setItem(keyForBest(size), formatTime(seconds)); updateBest(size); return; }
  const toSec = str => { const [m,s]=str.split(':').map(Number); return m*60+s; };
  if(seconds < toSec(best)){
    localStorage.setItem(keyForBest(size), formatTime(seconds));
    updateBest(size);
  }
}

function createCard(symbol, id){
  const card = document.createElement('button');
  card.className = 'card';
  card.setAttribute('role','gridcell');
  card.setAttribute('aria-label','Card');
  card.setAttribute('data-symbol', symbol);
  card.setAttribute('data-id', id);
  card.innerHTML = `
    <div class="inner">
      <div class="face front">🔒</div>
      <div class="face back" aria-hidden="true">${symbol}</div>
    </div>`;

  card.addEventListener('click', () => onFlip(card));
  card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onFlip(card);} });
  card.tabIndex = 0;
  return card;
}

function onFlip(card){
  if(lock || card.classList.contains('matched') || card.classList.contains('flipped')) return;
  card.classList.add('flipped');

  if(!firstCard){ firstCard = card; return; }

  moves++; movesEl.textContent = moves;
  const isMatch = firstCard.dataset.symbol === card.dataset.symbol;
  if(isMatch){
    firstCard.classList.add('matched');
    card.classList.add('matched');
    firstCard = null; matchedPairs++;
    checkWin();
  } else {
    lock = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      card.classList.remove('flipped');
      firstCard.querySelector('.inner').classList.add('shake');
      card.querySelector('.inner').classList.add('shake');
      setTimeout(()=>{
        firstCard?.querySelector('.inner').classList.remove('shake');
        card?.querySelector('.inner').classList.remove('shake');
      }, 350);
      firstCard = null; lock = false;
    }, 700);
  }
}

function checkWin(){
  const size = difficultySel.value;
  const [cols, rows] = size.split('x').map(Number);
  const totalPairs = (cols*rows)/2;
  if(matchedPairs === totalPairs){
    stopTimer();
    recordBest(size);
    setTimeout(()=>{
      alert(`🎉 You win!\\nMoves: ${moves}\\nTime: ${formatTime(seconds)}`);
    }, 200);
  }
}

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Events ---
restartBtn.addEventListener('click', () => buildDeck(difficultySel.value));
difficultySel.addEventListener('change', () => buildDeck(difficultySel.value));

// Init
buildDeck(difficultySel.value);
