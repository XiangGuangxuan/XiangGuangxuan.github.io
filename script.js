const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll(".interest-slide"));
  const count = carousel.querySelector("[data-carousel-count]");
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  let activeIndex = 0;

  const render = () => {
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    count.textContent = `${activeIndex + 1} / ${slides.length}`;
  };

  previousButton.addEventListener("click", () => {
    activeIndex = (activeIndex - 1 + slides.length) % slides.length;
    render();
  });

  nextButton.addEventListener("click", () => {
    activeIndex = (activeIndex + 1) % slides.length;
    render();
  });

  render();
});

const musicPlayer = document.querySelector("[data-music-player]");

if (musicPlayer) {
  const tracks = [
    {
      title: "晨间旋律",
      style: "清亮 / 轻快",
      wave: "sine",
      notes: [262, 330, 392, 523, 392, 330, 294, 349],
      duration: 0.28
    },
    {
      title: "夜色节拍",
      style: "低频 / 放松",
      wave: "triangle",
      notes: [220, 277, 330, 277, 247, 294, 370, 294],
      duration: 0.32
    },
    {
      title: "游戏片段",
      style: "电子 / 明亮",
      wave: "square",
      notes: [330, 392, 494, 659, 587, 494, 392, 330],
      duration: 0.22
    }
  ];

  const titleElement = musicPlayer.querySelector("[data-music-title]");
  const styleElement = musicPlayer.querySelector("[data-music-style]");
  const progressElement = musicPlayer.querySelector("[data-music-progress]");
  const previousButton = musicPlayer.querySelector("[data-music-prev]");
  const playButton = musicPlayer.querySelector("[data-music-play]");
  const nextButton = musicPlayer.querySelector("[data-music-next]");
  let audioContext;
  let currentTrack = 0;
  let progressTimer;
  let endTimer;
  let isPlaying = false;

  const stopTrack = () => {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    window.clearInterval(progressTimer);
    window.clearTimeout(endTimer);
    isPlaying = false;
    musicPlayer.classList.remove("is-playing");
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "播放音乐");
  };

  const renderTrack = () => {
    const track = tracks[currentTrack];
    titleElement.textContent = track.title;
    styleElement.textContent = track.style;
    progressElement.style.width = "0%";
  };

  const playTrack = () => {
    stopTrack();

    const track = tracks[currentTrack];
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    const startTime = audioContext.currentTime + 0.05;
    let noteTime = 0;

    track.notes.forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = startTime + noteTime;
      const noteEnd = noteStart + track.duration;

      oscillator.type = track.wave;
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.02);
      gain.gain.linearRampToValueAtTime(0, noteEnd - 0.02);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
      noteTime += track.duration;
    });

    isPlaying = true;
    musicPlayer.classList.add("is-playing");
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "暂停音乐");

    const totalDuration = track.notes.length * track.duration * 1000;
    const startedAt = Date.now();
    progressTimer = window.setInterval(() => {
      const progress = Math.min(((Date.now() - startedAt) / totalDuration) * 100, 100);
      progressElement.style.width = `${progress}%`;
    }, 80);

    endTimer = window.setTimeout(() => {
      stopTrack();
      progressElement.style.width = "100%";
    }, totalDuration + 120);
  };

  const moveTrack = (direction) => {
    stopTrack();
    currentTrack = (currentTrack + direction + tracks.length) % tracks.length;
    renderTrack();
  };

  previousButton.addEventListener("click", () => moveTrack(-1));
  nextButton.addEventListener("click", () => moveTrack(1));
  playButton.addEventListener("click", () => {
    if (isPlaying) {
      stopTrack();
      return;
    }

    playTrack();
  });

  renderTrack();
}

const quickLog = document.querySelector("[data-quick-log]");

if (quickLog) {
  const storageKey = "personal-site-quick-log";
  const form = quickLog.querySelector("[data-quick-log-form]");
  const typeField = quickLog.querySelector("[data-quick-log-type]");
  const textField = quickLog.querySelector("[data-quick-log-text]");
  const list = quickLog.querySelector("[data-quick-log-list]");
  const count = quickLog.querySelector("[data-quick-log-count]");
  const filters = Array.from(quickLog.querySelectorAll("[data-quick-filter]"));
  const starterLogs = [
    { id: "starter-1", type: "报告", text: "整理本周网页修改：兴趣轮播、音乐播放器、文章模板。", date: "06-15" },
    { id: "starter-2", type: "日记", text: "今天把个人主页一点点搭起来了，开始有自己的空间了。", date: "06-15" },
    { id: "starter-3", type: "吐槽", text: "缓存真的会让页面看起来像没改过，版本号很有用。", date: "06-15" }
  ];
  let activeFilter = "全部";
  let logs;

  try {
    logs = JSON.parse(window.localStorage.getItem(storageKey) || "null") || starterLogs;
  } catch {
    logs = starterLogs;
  }

  const escapeHtml = (value) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const saveLogs = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(logs));
  };

  const renderLogs = () => {
    const visibleLogs = activeFilter === "全部"
      ? logs
      : logs.filter((item) => item.type === activeFilter);

    list.innerHTML = visibleLogs.map((item) => `
      <li class="quick-log-item">
        <div class="quick-log-item-head">
          <span class="quick-log-tag">${escapeHtml(item.type)}</span>
          <span class="quick-log-date">${escapeHtml(item.date)}</span>
        </div>
        <p>${escapeHtml(item.text)}</p>
        <button class="quick-log-delete" type="button" data-log-id="${item.id}">删除</button>
      </li>
    `).join("");

    count.textContent = `${logs.length} 条`;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = textField.value.trim();

    if (!text) {
      textField.focus();
      return;
    }

    const now = new Date();
    logs = [{
      id: `${now.getTime()}`,
      type: typeField.value,
      text,
      date: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    }, ...logs];
    textField.value = "";
    saveLogs();
    renderLogs();
  });

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.quickFilter;
      filters.forEach((item) => item.classList.toggle("is-active", item === button));
      renderLogs();
    });
  });

  list.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-log-id]");

    if (!deleteButton) {
      return;
    }

    logs = logs.filter((item) => item.id !== deleteButton.dataset.logId);
    saveLogs();
    renderLogs();
  });

  renderLogs();
}
