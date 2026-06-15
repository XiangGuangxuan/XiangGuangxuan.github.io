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
