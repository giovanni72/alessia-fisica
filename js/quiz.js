/* ============================================================
   Motore interattivo Quiz + Timer Simulazione + Progressi
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initQuizzes();
  initTimer();
  initDashboardProgress();
});

function initQuizzes() {
  const cards = document.querySelectorAll(".quiz-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    const type = card.dataset.type || "mc";
    if (type === "mc") {
      const opts = card.querySelectorAll(".quiz-opt");
      opts.forEach((opt) => {
        opt.addEventListener("click", () => {
          if (card.classList.contains("locked")) return;
          opts.forEach((o) => o.classList.remove("selected"));
          opt.classList.add("selected");
        });
      });
    }
  });

  const btnCheck = document.getElementById("btn-check-quiz");
  const btnReveal = document.getElementById("btn-reveal-quiz");
  const btnReset = document.getElementById("btn-reset-quiz");
  const banner = document.getElementById("score-banner");
  const isSim = document.body.dataset.sim === "true";

  if (btnCheck) {
    btnCheck.addEventListener("click", () => {
      let correct = 0;
      let wrong = 0;
      let omitted = 0;

      cards.forEach((card) => {
        const type = card.dataset.type || "mc";
        const exp = card.querySelector(".quiz-exp");
        if (exp) exp.classList.add("show");

        if (type === "mc") {
          const ans = card.dataset.answer;
          const opts = card.querySelectorAll(".quiz-opt");
          let selectedOpt = null;
          opts.forEach((o) => {
            o.classList.remove("correct", "wrong");
            if (o.classList.contains("selected")) selectedOpt = o;
            if (o.dataset.val === ans) o.classList.add("correct");
          });
          if (!selectedOpt) {
            omitted++;
          } else if (selectedOpt.dataset.val === ans) {
            correct++;
          } else {
            selectedOpt.classList.add("wrong");
            wrong++;
          }
        } else if (type === "fill") {
          const input = card.querySelector("input");
          const accepted = (card.dataset.answer || "")
            .split("|")
            .map((s) => normalizeStr(s));
          const val = normalizeStr(input ? input.value : "");
          if (!val) {
            omitted++;
            if (input) input.style.borderColor = "#94a3b8";
          } else if (accepted.includes(val)) {
            correct++;
            if (input) {
              input.style.borderColor = "#15803d";
              input.style.background = "#dcfce7";
            }
          } else {
            wrong++;
            if (input) {
              input.style.borderColor = "#b91c1c";
              input.style.background = "#fee2e2";
            }
          }
        }
      });

      const total = cards.length;
      if (banner) {
        if (isSim) {
          const murScore = (correct * 1 - wrong * 0.25).toFixed(2);
          const pct = Math.round((correct / total) * 100);
          banner.innerHTML =
            `Risultato Simulazione: <strong>${correct}/${total}</strong> corrette (${pct}%), ` +
            `<strong>${wrong}</strong> errate, <strong>${omitted}</strong> omesse — ` +
            `Punteggio stile MUR (+1 / −0,25): <strong>${murScore} / ${total}</strong>`;
        } else {
          const pct = Math.round((correct / total) * 100);
          banner.innerHTML =
            `Punteggio: <strong>${correct} su ${total}</strong> (${pct}%) — ` +
            `Errate: ${wrong} | Omesse: ${omitted}. Controlla le spiegazioni qui sopra!`;
        }
        banner.classList.add("show");
        banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  if (btnReveal) {
    btnReveal.addEventListener("click", () => {
      cards.forEach((card) => {
        const exp = card.querySelector(".quiz-exp");
        if (exp) exp.classList.toggle("show");
      });
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      cards.forEach((card) => {
        card.classList.remove("locked");
        card.querySelectorAll(".quiz-opt").forEach((o) => {
          o.classList.remove("selected", "correct", "wrong");
        });
        const input = card.querySelector("input");
        if (input) {
          input.value = "";
          input.style.borderColor = "";
          input.style.background = "";
        }
        const exp = card.querySelector(".quiz-exp");
        if (exp) exp.classList.remove("show");
      });
      if (banner) banner.classList.remove("show");
    });
  }
}

function normalizeStr(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/\s+/g, " ");
}

function initTimer() {
  const display = document.getElementById("sim-timer");
  const btnStart = document.getElementById("btn-start-timer");
  const btnPause = document.getElementById("btn-pause-timer");
  const btnResetTimer = document.getElementById("btn-reset-timer");
  if (!display) return;

  let seconds = 50 * 60;
  let interval = null;

  const render = () => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    display.textContent = `${m}:${s}`;
    if (seconds <= 300) display.style.color = "#b91c1c";
    else display.style.color = "#16324f";
  };

  render();

  if (btnStart) {
    btnStart.addEventListener("click", () => {
      if (interval) return;
      interval = setInterval(() => {
        if (seconds > 0) {
          seconds--;
          render();
        } else {
          clearInterval(interval);
          interval = null;
          alert("Tempo scaduto (50 minuti)! Clicca su 'Verifica risposte' per vedere il punteggio.");
        }
      }, 1000);
    });
  }

  if (btnPause) {
    btnPause.addEventListener("click", () => {
      clearInterval(interval);
      interval = null;
    });
  }

  if (btnResetTimer) {
    btnResetTimer.addEventListener("click", () => {
      clearInterval(interval);
      interval = null;
      seconds = 50 * 60;
      render();
    });
  }
}

function initDashboardProgress() {
  const checks = document.querySelectorAll(".day-check");
  if (!checks.length) return;

  const key = "fisica_semestre_filtro_progress";
  const saved = JSON.parse(localStorage.getItem(key) || "{}");

  const updateUI = () => {
    let doneCount = 0;
    checks.forEach((chk) => {
      const id = chk.dataset.day;
      chk.checked = Boolean(saved[id]);
      const card = chk.closest(".day-card");
      if (card) card.classList.toggle("done", chk.checked);
      if (chk.checked) doneCount++;
    });
    const pct = Math.round((doneCount / checks.length) * 100);
    const bar = document.getElementById("progress-bar");
    const txt = document.getElementById("progress-text");
    if (bar) bar.style.width = `${pct}%`;
    if (txt) txt.textContent = `${doneCount} di ${checks.length} giorni completati (${pct}%)`;
  };

  checks.forEach((chk) => {
    chk.addEventListener("change", () => {
      saved[chk.dataset.day] = chk.checked;
      localStorage.setItem(key, JSON.stringify(saved));
      updateUI();
    });
  });

  updateUI();
}
