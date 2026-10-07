/**
 * Kathan Mehta - Portfolio Interactive Engine
 * Inspired by 21st.dev, uiverse.io micro-interactions, Aceternity UI
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. Audio Synthesizer (Zero asset dependency, Web Audio API)
  // ========================================================================
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playUiTick(freq = 600, duration = 0.04, type = 'sine') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      const icon = soundToggleBtn.querySelector('i');
      if (soundEnabled) {
        icon.className = 'fa-solid fa-volume-high';
        soundToggleBtn.title = 'UI Sound: ON';
        playUiTick(720, 0.06);
        showToast('UI Audio effects enabled');
      } else {
        icon.className = 'fa-solid fa-volume-xmark';
        soundToggleBtn.title = 'UI Sound: OFF';
        showToast('UI Audio effects muted');
      }
    });
  }

  // ========================================================================
  // 2. Custom Magnetic Cursor System
  // ========================================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth lerp animation for the outer ring
    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover expand interactions
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, .spotlight-card, .filter-tab-btn, .term-quick-btn, .algo-btn, .genre-btn'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('cursor-active');
        playUiTick(880, 0.02);
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('cursor-active');
      });
    });
  }

  // ========================================================================
  // 3. 21st.dev Spotlight Card Effect (Mouse position tracker)
  // ========================================================================
  const spotlightCards = document.querySelectorAll('.spotlight-card');

  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ========================================================================
  // 4. Header Scroll Spy & Shrink Effect
  // ========================================================================
  const mainHeader = document.getElementById('mainHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    if (scrollPos > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }

    // Active Section Spy
    let currentId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-nav') === currentId) {
        link.classList.add('active');
      }
    });
  });

  // ========================================================================
  // 5. Mobile Navigation Drawer
  // ========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      mobileDrawer.classList.toggle('open');
      document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
      playUiTick(540, 0.05);
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ========================================================================
  // 6. Skills Category Filter
  // ========================================================================
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const skillItems = document.querySelectorAll('.skill-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      playUiTick(660, 0.03);

      const target = btn.getAttribute('data-filter');

      skillItems.forEach((item) => {
        const itemCat = item.getAttribute('data-category');
        if (target === 'all' || itemCat === target) {
          item.style.display = 'flex';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // ========================================================================
  // 7. Interactive EDA Factor Selector (Student Performance Project)
  // ========================================================================
  const edaFactor = document.getElementById('edaFactor');
  const edaCorr = document.getElementById('edaCorr');
  const edaImpact = document.getElementById('edaImpact');
  const edaSummary = document.getElementById('edaSummary');

  const edaInsights = {
    studyTime: {
      corr: '+0.78',
      impact: '+14.2%',
      summary: 'High positive correlation with examination percentile.'
    },
    attendance: {
      corr: '+0.65',
      impact: '+11.8%',
      summary: 'Consistent lecture presence strongly prevents grade drops.'
    },
    sleep: {
      corr: '+0.42',
      impact: '+6.5%',
      summary: 'Adequate rest (7-8h) stabilizes cognitive retention & test accuracy.'
    }
  };

  if (edaFactor && edaCorr) {
    edaFactor.addEventListener('change', (e) => {
      const val = e.target.value;
      const data = edaInsights[val] || edaInsights.studyTime;
      edaCorr.textContent = data.corr;
      edaImpact.textContent = data.impact;
      edaSummary.textContent = data.summary;
      playUiTick(720, 0.04);
    });
  }

  // ========================================================================
  // 8. IMDB Query Simulator (IMDB Analysis Project)
  // ========================================================================
  const genreBtns = document.querySelectorAll('.genre-btn');
  const activeGenreCode = document.getElementById('activeGenreCode');
  const genreResult = document.getElementById('genreResult');

  const genreMetrics = {
    'Sci-Fi': {
      rating: '8.1 / 10',
      trend: 'High Return on Budget (CGI franchise growth)'
    },
    'Drama': {
      rating: '7.9 / 10',
      trend: 'Highest critical acclaim & award density'
    },
    'Action': {
      rating: '7.4 / 10',
      trend: 'Largest international box-office gross volume'
    },
    'Animation': {
      rating: '8.2 / 10',
      trend: 'Longest viewer retention across multi-generations'
    }
  };

  genreBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      genreBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const genre = btn.getAttribute('data-genre');
      activeGenreCode.textContent = genre;
      const data = genreMetrics[genre];
      genreResult.innerHTML = `
        <span>Avg Rating: <strong>${data.rating}</strong></span>
        <span>Top Trend: <strong>${data.trend}</strong></span>
      `;
      playUiTick(800, 0.03);
    });
  });

  // ========================================================================
  // 9. Interactive DSA Sorting Visualizer (C++ Project)
  // ========================================================================
  const visualizerContainer = document.getElementById('sortingVisualizer');
  const sortBubbleBtn = document.getElementById('sortBubbleBtn');
  const sortQuickBtn = document.getElementById('sortQuickBtn');
  const sortResetBtn = document.getElementById('sortResetBtn');
  const sortingMeta = document.getElementById('sortingMeta');

  let sortData = [45, 80, 25, 95, 60, 35, 75, 50, 20, 90, 40, 70];
  let isSorting = false;

  function renderSortBars(highlightIndices = [], isSorted = false) {
    if (!visualizerContainer) return;
    visualizerContainer.innerHTML = '';
    sortData.forEach((val, idx) => {
      const bar = document.createElement('div');
      bar.className = 'sort-bar';
      bar.style.height = `${val}%`;
      if (highlightIndices.includes(idx)) {
        bar.classList.add('active-compare');
      }
      if (isSorted) {
        bar.classList.add('sorted');
      }
      visualizerContainer.appendChild(bar);
    });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runBubbleSort() {
    if (isSorting) return;
    isSorting = true;
    sortingMeta.innerHTML = '<span>Selected: <strong>Bubble Sort</strong></span><span>Time: <strong>O(n²) Quadratic</strong></span>';

    const arr = [...sortData];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        renderSortBars([j, j + 1]);
        playUiTick(200 + arr[j] * 5, 0.02);
        await sleep(70);
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          sortData = [...arr];
          renderSortBars([j, j + 1]);
          await sleep(50);
        }
      }
    }
    renderSortBars([], true);
    isSorting = false;
  }

  async function runQuickSort() {
    if (isSorting) return;
    isSorting = true;
    sortingMeta.innerHTML = '<span>Selected: <strong>Quick / Merge</strong></span><span>Time: <strong>O(n log n) Divide & Conquer</strong></span>';

    const arr = [...sortData];
    async function quickSortRecursive(low, high) {
      if (low < high) {
        const pi = await partition(low, high);
        await quickSortRecursive(low, pi - 1);
        await quickSortRecursive(pi + 1, high);
      }
    }

    async function partition(low, high) {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        renderSortBars([j, high]);
        playUiTick(300 + arr[j] * 6, 0.02);
        await sleep(60);
        if (arr[j] < pivot) {
          i++;
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          sortData = [...arr];
          renderSortBars([i, j]);
          await sleep(40);
        }
      }
      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      sortData = [...arr];
      renderSortBars([i + 1, high]);
      await sleep(50);
      return i + 1;
    }

    await quickSortRecursive(0, arr.length - 1);
    renderSortBars([], true);
    isSorting = false;
  }

  function resetSortData() {
    if (isSorting) return;
    sortData = [45, 80, 25, 95, 60, 35, 75, 50, 20, 90, 40, 70].sort(() => Math.random() - 0.5);
    renderSortBars();
    sortingMeta.innerHTML = '<span>Array: <strong>Shuffled</strong></span><span>Ready to <strong>Sort</strong></span>';
    playUiTick(500, 0.04);
  }

  if (visualizerContainer) {
    renderSortBars();
    sortBubbleBtn?.addEventListener('click', runBubbleSort);
    sortQuickBtn?.addEventListener('click', runQuickSort);
    sortResetBtn?.addEventListener('click', resetSortData);
  }

  // ========================================================================
  // 10. Developer Console / Terminal CLI Simulator
  // ========================================================================
  const terminalInput = document.getElementById('terminalInput');
  const terminalOutput = document.getElementById('terminalOutput');
  const termQuickBtns = document.querySelectorAll('.term-quick-btn');

  const termCommands = {
    help: () => `
Available commands:
  • <span class="term-cmd-highlight">about</span>          - Short bio & educational credentials
  • <span class="term-cmd-highlight">skills</span>         - Technical languages & data toolstack
  • <span class="term-cmd-highlight">projects</span>       - Summary of engineered case studies
  • <span class="term-cmd-highlight">certifications</span> - Verified credentials
  • <span class="term-cmd-highlight">contact</span>        - Email, phone, LinkedIn & GitHub coordinates
  • <span class="term-cmd-highlight">education</span>      - University & graduation timeline
  • <span class="term-cmd-highlight">clear</span>          - Flush the terminal view
    `,
    about: () => `
Third-year B.Tech Computer Science Engineering student at Indus University, Ahmedabad (Graduation: 2028).
Passionate about Data Science, Machine Learning, and C++ algorithmic systems.
Actively looking for Summer/Fall Internship roles.
    `,
    skills: () => `
• Languages: Python, C++, Java, SQL
• Data Science: Pandas, NumPy, Data Cleaning, EDA
• Tools: VS Code, Jupyter Notebook, Tableau, Git & GitHub
• Core CS: DSA, OOP, DBMS fundamentals, Operating Systems
    `,
    projects: () => `
1. Student Performance Data Analysis [Python, Pandas, EDA]
2. IMDB Movie Dataset Analysis [Python, Pandas, Aggregation]
3. DSA Algorithm Implementations & Benchmarks [C++, STL, Asymptotics]
Type 'git' or check the Featured Work section above for more details.
    `,
    certifications: () => `
• Data Science with AI - Internshala
• AI / Machine Learning Certification
• 2-Month Data Science Training Track
    `,
    contact: () => `
• Email:    kathanmehta926@gmail.com
• Phone:    +91 75730 23020
• LinkedIn: https://www.linkedin.com/in/kathan-mehta-265087259
• GitHub:   https://github.com/kathanmehta926-afk
• Location: Ahmedabad, Gujarat, India
    `,
    education: () => `
Degree: B.Tech in Computer Science Engineering (2024 - 2028)
Institution: Indus University, Ahmedabad
    `,
    clear: () => '__CLEAR__'
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    const commandLine = document.createElement('div');
    commandLine.className = 'term-line';
    commandLine.innerHTML = `<span class="term-prompt">kathan@portfolio:~$</span> <strong>${rawCmd}</strong>`;
    terminalOutput.appendChild(commandLine);

    const outputEntry = document.createElement('div');
    outputEntry.className = 'term-output-entry';

    if (termCommands[cmd]) {
      outputEntry.innerHTML = termCommands[cmd]().trim().replace(/\n/g, '<br>');
    } else {
      outputEntry.innerHTML = `command not found: "${rawCmd}". Type <span class="term-cmd-highlight">help</span> for a list of commands.`;
    }

    terminalOutput.appendChild(outputEntry);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    playUiTick(550, 0.03);
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(terminalInput.value);
        terminalInput.value = '';
      }
    });

    termQuickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        terminalInput.value = cmd;
        executeCommand(cmd);
        terminalInput.value = '';
      });
    });
  }

  // ========================================================================
  // 11. Copy to Clipboard & Toast System
  // ========================================================================
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const copyBtns = document.querySelectorAll('.copy-btn');

  function showToast(msg) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotification.classList.add('show');
    playUiTick(900, 0.05);

    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied ${textToCopy} to clipboard!`);
        }).catch(() => {
          showToast(`Copied to clipboard!`);
        });
      } else {
        showToast(`Copied to clipboard!`);
      }
    });
  });

  // ========================================================================
  // 12. Contact Form Handler (Mailto Direct Integration)
  // ========================================================================
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('senderName').value;
      const email = document.getElementById('senderEmail').value;
      const subject = document.getElementById('messageSubject').value;
      const message = document.getElementById('senderMessage').value;

      // Construct mailto URL
      const mailtoUrl = `mailto:kathanmehta926@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Hi Kathan,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      )}`;

      // Show immediate UI success
      formFeedback.textContent = `Thank you, ${name}! Launching your email client now...`;
      formFeedback.className = 'form-feedback-msg success';
      playUiTick(750, 0.08);

      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 700);

      contactForm.reset();
    });
  }

  // ========================================================================
  // 13. Dynamic Year
  // ========================================================================
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
