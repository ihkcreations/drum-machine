const sounds = [
  { name: 'Kick', freq: 120, type: 'sine' },
  { name: 'Snare', freq: 250, type: 'triangle' },
  { name: 'Hi-Hat', freq: 600, type: 'square' },  
  { name: 'Clap', freq: 400, type: 'sawtooth' }
];
const stepsCount = 8;
let audioCtx = null;
let isPlaying = false;
let currentStep = 0;
let timerId = null;  
let tempo = 120;
const gridData = sounds.map(() => Array(stepsCount).fill(false));
const gridEl = document.getElementById('grid');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const tempoInput = document.getElementById('tempo');  
const tempoVal = document.getElementById('tempo-val');

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}  

function playSound(sound) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = sound.type;
  osc.frequency.setValueAtTime(sound.freq, audioCtx.currentTime);  
  if (sound.name === 'Kick') {
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  } else {
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);  
  }
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function renderGrid() {
  gridEl.innerHTML = '';
  sounds.forEach((sound, rIndex) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    const labelEl = document.createElement('span');
    labelEl.className = 'row-label';  
    labelEl.textContent = sound.name;
    rowEl.appendChild(labelEl);
    for (let sIndex = 0; sIndex < stepsCount; sIndex++) {
      const stepEl = document.createElement('button');
      stepEl.type = 'button';
      stepEl.className = 'step';
      if (gridData[rIndex][sIndex]) {  
        stepEl.classList.add('active');
      }
      if (isPlaying && currentStep === sIndex) {
        stepEl.classList.add('playing');
      }
      stepEl.addEventListener('click', () => {
        gridData[rIndex][sIndex] = !gridData[rIndex][sIndex];  
        renderGrid();
        if (gridData[rIndex][sIndex]) {
          playSound(sound);
        }
      });
      rowEl.appendChild(stepEl);
    }  
    gridEl.appendChild(rowEl);
  });
}

function stepSequence() {
  currentStep = (currentStep + 1) % stepsCount;
  gridData.forEach((row, rIndex) => {  
    if (row[currentStep]) {
      playSound(sounds[rIndex]);
    }
  });
  renderGrid();
}

function startPlayback() {
  if (isPlaying) return;
  initAudio();
  isPlaying = true;
  const interval = (60 / tempo / 2) * 1000;
  timerId = setInterval(stepSequence, interval);
}  

function stopPlayback() {
  isPlaying = false;
  clearInterval(timerId);
  currentStep = 0;
  renderGrid();
}  

playBtn.addEventListener('click', () => {
  startPlayback();
});

stopBtn.addEventListener('click', () => {
  stopPlayback();  
});

clearBtn.addEventListener('click', () => {
  gridData.forEach(row => row.fill(false));
  renderGrid();
});

tempoInput.addEventListener('input', (e) => {
  tempo = parseInt(e.target.value, 10);
  tempoVal.textContent = tempo;
  if (isPlaying) {
    clearInterval(timerId);
    const interval = (60 / tempo / 2) * 1000;
    timerId = setInterval(interval);  
  }
});

renderGrid();


