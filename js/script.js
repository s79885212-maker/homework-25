const audio = new Audio();

let tracks = [];

let state = {
  category: 'jazz',
  trackId: null,
  isPlaying: false,
  volume: 0.7,
  shuffle: false
};

const categoryNames = {
  jazz: 'Jazz',
  classic: 'Classic',
  blues: 'Blues'
};

const categoryColors = {
  jazz: 'var(--jazz)',
  classic: 'var(--classic)',
  blues: 'var(--blues)'
};

const categoryItems = document.querySelectorAll('.category');
const trackList = document.querySelector('#trackList');
const heroTitle = document.querySelector('#heroTitle');
const heroCover = document.querySelector('#heroCover');
const heroPlayBtn = document.querySelector('#heroPlayBtn');
const playBtn = document.querySelector('#playBtn');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const nowCover = document.querySelector('#nowCover');
const nowTitle = document.querySelector('#nowTitle');
const nowArtist = document.querySelector('#nowArtist');
const progress = document.querySelector('#progress');
const progressFill = document.querySelector('#progressFill');
const currentTimeEl = document.querySelector('#currentTime');
const durationEl = document.querySelector('#duration');
const muteBtn = document.querySelector('#muteBtn');
const volumeRange = document.querySelector('#volumeRange');
const volumeBox = document.querySelector('.volume');
const themeBtn = document.querySelector('#themeBtn');
const shuffleBtns = document.querySelectorAll('.shuffle-btn');

audio.volume = state.volume;

fetch('tracks.json')
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    tracks = data;
    renderCounts();
    renderCategory();
    selectTrack(getCategoryTracks(state.category)[0].id);
  })
  .catch(function (error) {
    console.error('Не удалось загрузить tracks.json', error);
  });

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return min + ':' + String(sec).padStart(2, '0');
}

function getCategoryTracks(category) {
  return tracks.filter(function (track) {
    return track.category === category;
  });
}

function getTrack(id) {
  return tracks.find(function (track) {
    return track.id === id;
  });
}

function renderCounts() {
  categoryItems.forEach(function (item) {
    const count = getCategoryTracks(item.dataset.category).length;
    item.querySelector('.count').textContent = count;
  });
}

function renderCategory() {
  categoryItems.forEach(function (item) {
    item.classList.toggle('active', item.dataset.category === state.category);
  });

  heroTitle.textContent = categoryNames[state.category];
  heroCover.style.background = categoryColors[state.category];

  renderTracks();
}

function renderTracks() {
  const list = getCategoryTracks(state.category);
  trackList.innerHTML = '';

  list.forEach(function (track, index) {
    const li = document.createElement('li');
    li.className = 'track';
    li.dataset.id = track.id;
    li.style.setProperty('--track-color', categoryColors[track.category]);
    li.innerHTML =
      '<div class="track-num">' +
        '<span>' + (index + 1) + '</span>' +
        '<svg class="icon-play-small" viewBox="0 0 24 24"><path d="M6 3v18l15-9z"/></svg>' +
        '<svg class="icon-bars" viewBox="0 0 22 18"><rect x="1" y="8" width="3" height="10" rx="1"/><rect x="7" y="2" width="3" height="16" rx="1"/><rect x="13" y="10" width="3" height="8" rx="1"/><rect x="19" y="5" width="3" height="13" rx="1"/></svg>' +
      '</div>' +
      '<div class="track-cover"></div>' +
      '<div class="track-info">' +
        '<span class="track-title"></span>' +
        '<span class="track-artist"></span>' +
      '</div>' +
      '<span class="track-time">' + formatTime(track.duration) + '</span>';
    li.querySelector('.track-title').textContent = track.title;
    li.querySelector('.track-artist').textContent = track.artist;

    li.addEventListener('click', function () {
      onTrackClick(track.id);
    });

    trackList.appendChild(li);
  });

  highlightActive();
}

function highlightActive() {
  trackList.querySelectorAll('.track').forEach(function (li) {
    li.classList.toggle('active', Number(li.dataset.id) === state.trackId);
  });

  const current = getTrack(state.trackId);
  categoryItems.forEach(function (item) {
    item.classList.toggle('playing', current !== undefined && item.dataset.category === current.category);
  });
}

function selectTrack(id) {
  const track = getTrack(id);
  state.trackId = id;
  audio.src = track.file;

  nowTitle.textContent = track.title;
  nowArtist.textContent = track.artist;
  nowCover.style.background = categoryColors[track.category];
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = formatTime(track.duration);
  progressFill.style.width = '0%';

  highlightActive();
}

function playTrack(id) {
  if (id !== state.trackId) {
    selectTrack(id);
  }
  play();
}

function play() {
  audio.play();
  state.isPlaying = true;
  updatePlayButtons();
}

function pause() {
  audio.pause();
  state.isPlaying = false;
  updatePlayButtons();
}

function togglePlay() {
  if (state.trackId === null) {
    return;
  }
  if (state.isPlaying) {
    pause();
  } else {
    play();
  }
}

function updatePlayButtons() {
  playBtn.classList.toggle('playing', state.isPlaying);

  const current = getTrack(state.trackId);
  const heroPlaying = state.isPlaying && current.category === state.category;
  heroPlayBtn.classList.toggle('playing', heroPlaying);
}

function onTrackClick(id) {
  if (id === state.trackId) {
    togglePlay();
  } else {
    playTrack(id);
  }
}

function playNextTrack() {
  const current = getTrack(state.trackId);
  const list = getCategoryTracks(current.category);
  const index = list.indexOf(current);

  if (state.shuffle && list.length > 1) {
    let randomIndex = index;
    while (randomIndex === index) {
      randomIndex = Math.floor(Math.random() * list.length);
    }
    playTrack(list[randomIndex].id);
    return;
  }

  const next = list[(index + 1) % list.length];
  playTrack(next.id);
}

function playPrevTrack() {
  const current = getTrack(state.trackId);
  const list = getCategoryTracks(current.category);
  const index = list.indexOf(current);
  const prev = list[(index - 1 + list.length) % list.length];
  playTrack(prev.id);
}

categoryItems.forEach(function (item) {
  item.addEventListener('click', function () {
    state.category = item.dataset.category;
    renderCategory();
    updatePlayButtons();
  });
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNextTrack);
prevBtn.addEventListener('click', playPrevTrack);

shuffleBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    state.shuffle = !state.shuffle;
    shuffleBtns.forEach(function (b) {
      b.classList.toggle('active', state.shuffle);
    });
  });
});

heroPlayBtn.addEventListener('click', function () {
  const current = getTrack(state.trackId);
  if (current.category === state.category) {
    togglePlay();
  } else {
    playTrack(getCategoryTracks(state.category)[0].id);
  }
});

audio.addEventListener('loadedmetadata', function () {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', function () {
  if (!audio.duration) {
    return;
  }
  progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', function () {
  playNextTrack();
});

progress.addEventListener('click', function (event) {
  if (!audio.duration) {
    return;
  }
  const rect = progress.getBoundingClientRect();
  const part = (event.clientX - rect.left) / rect.width;
  audio.currentTime = part * audio.duration;
});

function setVolume(value) {
  audio.volume = value / 100;
  volumeRange.value = value;
  volumeRange.style.setProperty('--value', value + '%');
  volumeBox.classList.toggle('muted', Number(value) === 0);
}

volumeRange.addEventListener('input', function () {
  state.volume = volumeRange.value / 100;
  setVolume(volumeRange.value);
});

muteBtn.addEventListener('click', function () {
  if (audio.volume > 0) {
    setVolume(0);
  } else {
    setVolume(state.volume * 100 || 70);
  }
});

themeBtn.addEventListener('click', function () {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});
