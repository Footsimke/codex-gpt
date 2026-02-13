const i18n = {
  en: {
    title: "Last Summer Promise",
    subtitle: "A 2D anime-style visual novel",
    language: "Language",
    menuTitle: "Main Menu",
    menuDescription:
      "Yamada Isey has returned to the city for one final summer. Can he reconnect with his lost friends—and find love?",
    start: "Start Story",
    help: "How to Play",
    helpText:
      "Read the story text and choose your path. Your decisions change friendships, romance, and endings.",
    continue: "Continue",
    musicOn: "♪ Music: On",
    musicOff: "♪ Music: Off"
  },
  es: {
    title: "Promesa del Último Verano",
    subtitle: "Una novela visual 2D estilo anime",
    language: "Idioma",
    menuTitle: "Menú Principal",
    menuDescription:
      "Yamada Isey regresó a la ciudad para su último verano. ¿Podrá reencontrarse con sus amigos y enamorarse?",
    start: "Comenzar historia",
    help: "Cómo jugar",
    helpText:
      "Lee la historia y elige un camino. Tus decisiones cambian amistades, romance y finales.",
    continue: "Continuar",
    musicOn: "♪ Música: Encendida",
    musicOff: "♪ Música: Apagada"
  },
  pt: {
    title: "Promessa do Último Verão",
    subtitle: "Uma visual novel 2D estilo anime",
    language: "Idioma",
    menuTitle: "Menu Principal",
    menuDescription:
      "Yamada Isey voltou para a cidade em seu último verão. Ele conseguirá reencontrar os amigos e se apaixonar?",
    start: "Iniciar história",
    help: "Como jogar",
    helpText:
      "Leia a história e escolha caminhos. Suas decisões mudam amizades, romance e finais.",
    continue: "Continuar",
    musicOn: "♪ Música: Ligada",
    musicOff: "♪ Música: Desligada"
  },
  ja: {
    title: "最後の夏の約束",
    subtitle: "2Dアニメ風ビジュアルノベル",
    language: "言語",
    menuTitle: "メインメニュー",
    menuDescription:
      "山田イセイは最後の夏に街へ戻った。離れた友だちとの再会、そして恋は始まるのか？",
    start: "物語を始める",
    help: "遊び方",
    helpText:
      "物語を読み、選択肢を選んでください。選択で友情・恋愛・エンディングが変化します。",
    continue: "続ける",
    musicOn: "♪ 音楽: オン",
    musicOff: "♪ 音楽: オフ"
  }
};

const story = {
  intro: {
    scene: "room",
    speaker: "Yamada Isey",
    mood: "Nostalgic",
    text:
      "I'm 16 now... but when I was 15, my family moved away. Before that, my playground friends and I promised we'd never separate.",
    next: "return"
  },
  return: {
    scene: "room",
    speaker: "Yamada Isey",
    mood: "Reflective",
    text:
      "Now I've returned to this city. It's my last summer before life changes forever. I stayed in my room tonight and fell asleep, thinking about tomorrow's class.",
    next: "schoolMorning"
  },
  schoolMorning: {
    scene: "school",
    speaker: "Yamada Isey",
    mood: "Determined",
    text:
      "Morning arrived. After class, my feet carried me to our old park. My heart pounded—would I find anyone there?",
    next: "parkMeet"
  },
  parkMeet: {
    scene: "park",
    speaker: "Sora",
    mood: "Surprised",
    text:
      "A familiar voice called my name. Sora, the cheerful friend from our old group, stood by the swings. Behind Sora, two more silhouettes appeared.",
    choices: [
      { text: "Run to greet everyone with a smile.", next: "warmReunion" },
      { text: "Stay calm and ask why they disappeared.", next: "tenseReunion" }
    ]
  },
  warmReunion: {
    scene: "park",
    speaker: "Yamada Isey",
    mood: "Happy",
    text:
      "I laughed and hugged them. The years melted away, and we talked until sunset. Yet one feeling grew stronger: this might be my chance to fall in love.",
    choices: [
      { text: "Spend the evening with Sora.", next: "soraRoute" },
      { text: "Spend the evening with Ren.", next: "renRoute" }
    ]
  },
  tenseReunion: {
    scene: "sunset",
    speaker: "Ren",
    mood: "Guilty",
    text:
      "Ren looked down. 'We were scared after you moved... it felt easier to disappear than to keep the promise.' The words hurt, but the sunset was gentle.",
    choices: [
      { text: "Forgive them and start over.", next: "forgivePath" },
      { text: "Walk alone and think about your future.", next: "soloPath" }
    ]
  },
  soraRoute: {
    scene: "festival",
    speaker: "Sora",
    mood: "Romantic",
    text:
      "At the summer festival, Sora slipped a heart charm into my hand. 'I waited for you, Isey.' Under fireworks, I realized this last summer could become our first love story.",
    ending: "Love Ending: Promise Rewritten"
  },
  renRoute: {
    scene: "festival",
    speaker: "Ren",
    mood: "Soft",
    text:
      "Ren and I watched lanterns rise over the night sky. We talked about regrets, then dreams. A quiet hand-hold turned into something honest and new.",
    ending: "Love Ending: Lantern Hearts"
  },
  forgivePath: {
    scene: "park",
    speaker: "Yamada Isey",
    mood: "Peaceful",
    text:
      "I chose forgiveness. The group rebuilt the promise together, older but sincere. Maybe love can wait; this reunion itself was a miracle.",
    ending: "Friendship Ending: Summer Circle"
  },
  soloPath: {
    scene: "sunset",
    speaker: "Yamada Isey",
    mood: "Hopeful",
    text:
      "I walked home alone, but not broken. This last summer became the beginning of my own path, where new people and new love might still find me.",
    ending: "Independence Ending: New Horizon"
  }
};

let currentLang = "en";
let currentNode = "intro";
let audioCtx;
let melodyInterval;
let musicOn = false;

const el = {
  title: document.getElementById("game-title"),
  subtitle: document.getElementById("game-subtitle"),
  languageLabel: document.getElementById("language-label"),
  menuTitle: document.getElementById("menu-title"),
  menuDescription: document.getElementById("menu-description"),
  startBtn: document.getElementById("start-btn"),
  helpBtn: document.getElementById("help-btn"),
  helpText: document.getElementById("help-text"),
  languageSelect: document.getElementById("language-select"),
  musicToggle: document.getElementById("music-toggle"),
  mainMenu: document.getElementById("main-menu"),
  vnScreen: document.getElementById("vn-screen"),
  sceneBackdrop: document.getElementById("scene-backdrop"),
  sceneTitle: document.getElementById("scene-title"),
  sceneText: document.getElementById("scene-text"),
  characterCard: document.getElementById("character-card"),
  characterName: document.getElementById("character-name"),
  characterMood: document.getElementById("character-mood"),
  choices: document.getElementById("choices"),
  nextBtn: document.getElementById("next-btn")
};

function applyLanguage() {
  const t = i18n[currentLang];
  el.title.textContent = t.title;
  el.subtitle.textContent = t.subtitle;
  el.languageLabel.textContent = t.language;
  el.menuTitle.textContent = t.menuTitle;
  el.menuDescription.textContent = t.menuDescription;
  el.startBtn.textContent = t.start;
  el.helpBtn.textContent = t.help;
  el.helpText.textContent = t.helpText;
  el.nextBtn.textContent = t.continue;
  el.musicToggle.textContent = musicOn ? t.musicOn : t.musicOff;
}

function renderNode(nodeId) {
  const node = story[nodeId];
  currentNode = nodeId;
  el.sceneBackdrop.className = `scene-backdrop ${node.scene}`;
  el.sceneTitle.textContent = node.speaker;
  el.sceneText.textContent = node.ending ? `${node.text}\n\n${node.ending}` : node.text;
  el.characterCard.classList.remove("hidden");
  el.characterName.textContent = node.speaker;
  el.characterMood.textContent = node.mood;
  el.choices.innerHTML = "";

  if (node.choices) {
    el.nextBtn.classList.add("hidden");
    node.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.text;
      btn.addEventListener("click", () => renderNode(choice.next));
      el.choices.appendChild(btn);
    });
  } else if (node.next) {
    el.nextBtn.classList.remove("hidden");
  } else {
    el.nextBtn.classList.add("hidden");
    const restartBtn = document.createElement("button");
    restartBtn.className = "btn primary";
    restartBtn.textContent = i18n[currentLang].start;
    restartBtn.addEventListener("click", () => renderNode("intro"));
    el.choices.appendChild(restartBtn);
  }
}

function beep(freq = 440, duration = 0.2) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function startMusic() {
  const notes = [392, 440, 523, 494, 440, 392];
  let i = 0;
  beep(notes[0], 0.3);
  melodyInterval = setInterval(() => {
    beep(notes[i % notes.length], 0.25);
    i += 1;
  }, 400);
}

function stopMusic() {
  clearInterval(melodyInterval);
}

el.startBtn.addEventListener("click", () => {
  el.mainMenu.classList.add("hidden");
  el.vnScreen.classList.remove("hidden");
  renderNode("intro");
});

el.helpBtn.addEventListener("click", () => {
  el.helpText.classList.toggle("hidden");
});

el.nextBtn.addEventListener("click", () => {
  const next = story[currentNode].next;
  if (next) renderNode(next);
});

el.languageSelect.addEventListener("change", (event) => {
  currentLang = event.target.value;
  applyLanguage();
});

el.musicToggle.addEventListener("click", () => {
  musicOn = !musicOn;
  if (musicOn) {
    startMusic();
  } else {
    stopMusic();
  }
  applyLanguage();
});

applyLanguage();
