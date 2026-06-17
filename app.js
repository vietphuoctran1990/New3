/* Bảng Sao Của Bé — app chấm điểm cho bé 6-7 tuổi
   Dữ liệu lưu offline bằng localStorage. */
(function () {
  "use strict";

  var STORE_KEY = "bang-sao-v1";

  // ---- Dữ liệu mặc định ----
  var DEFAULT = {
    kidName: "Bé Ngoan",
    mascot: "🦄",
    score: 0,
    pin: "1234",
    good: [
      { id: "g1", emoji: "🦷", label: "Đánh răng", pts: 2 },
      { id: "g2", emoji: "🛏️", label: "Dọn giường", pts: 2 },
      { id: "g3", emoji: "📚", label: "Học bài", pts: 3 },
      { id: "g4", emoji: "🍚", label: "Ăn hết suất", pts: 2 },
      { id: "g5", emoji: "🧸", label: "Cất đồ chơi", pts: 2 },
      { id: "g6", emoji: "🤝", label: "Giúp ba mẹ", pts: 3 },
      { id: "g7", emoji: "😴", label: "Ngủ đúng giờ", pts: 2 },
      { id: "g8", emoji: "🚿", label: "Tự tắm rửa", pts: 2 }
    ],
    bad: [
      { id: "b1", emoji: "😤", label: "Cãi lời", pts: 3 },
      { id: "b2", emoji: "😭", label: "Mè nheo", pts: 2 },
      { id: "b3", emoji: "📱", label: "Xem TV quá giờ", pts: 2 },
      { id: "b4", emoji: "🍬", label: "Đòi bánh kẹo", pts: 1 },
      { id: "b5", emoji: "🤥", label: "Nói dối", pts: 4 },
      { id: "b6", emoji: "🧹", label: "Bày bừa", pts: 2 }
    ],
    rewards: [
      { id: "r1", emoji: "🍦", label: "Que kem", pts: 10 },
      { id: "r2", emoji: "🎬", label: "Xem hoạt hình", pts: 15 },
      { id: "r3", emoji: "🎡", label: "Đi công viên", pts: 40 },
      { id: "r4", emoji: "🧸", label: "Đồ chơi nhỏ", pts: 60 },
      { id: "r5", emoji: "🍕", label: "Ăn pizza", pts: 50 }
    ],
    history: [] // {emoji,text,delta,type,ts}
  };

  var state = load();

  // ---- Lưu / Tải ----
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        // bổ sung trường thiếu nếu nâng cấp
        for (var k in DEFAULT) if (!(k in d)) d[k] = DEFAULT[k];
        return d;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---- Tiện ích ----
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function todayStart() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function uid() { return "x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  // ---- Âm thanh vui (Web Audio, không cần file) ----
  var audioCtx = null;
  function beep(up) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var notes = up ? [523, 659, 784] : [392, 311];
      var t = audioCtx.currentTime;
      notes.forEach(function (f, i) {
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.value = f;
        o.connect(g); g.connect(audioCtx.destination);
        var st = t + i * 0.09;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.25, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.18);
        o.start(st); o.stop(st + 0.2);
      });
    } catch (e) {}
  }

  // ---- Pháo hoa ----
  function confetti() {
    var layer = $("#confetti");
    var colors = ["#ffd640", "#7c5cfa", "#ec6dbf", "#36c98a", "#ff7a85", "#4cc9f0"];
    for (var i = 0; i < 30; i++) {
      var p = el("div", "confetti-piece");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.4 + Math.random() * 1.2) + "s";
      p.style.animationDelay = Math.random() * 0.2 + "s";
      layer.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 2800); })(p);
    }
  }

  // ---- Toast ----
  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  // ---- Render ----
  function render() {
    $("#kidName").textContent = state.kidName;
    $("#mascot").textContent = state.mascot;

    var scoreEl = $("#score");
    scoreEl.textContent = state.score;

    renderProgress();
    renderGrid("#goodGrid", state.good, "good");
    renderGrid("#badGrid", state.bad, "bad");
    renderRewards();
    renderHistory();
  }

  function renderProgress() {
    // Tiến độ tới phần thưởng rẻ nhất chưa đạt
    var next = null;
    var sorted = state.rewards.slice().sort(function (a, b) { return a.pts - b.pts; });
    for (var i = 0; i < sorted.length; i++) {
      if (state.score < sorted[i].pts) { next = sorted[i]; break; }
    }
    var fill = $("#progressFill");
    var txt = $("#progressText");
    if (next) {
      var pct = Math.max(0, Math.min(100, (state.score / next.pts) * 100));
      fill.style.width = pct + "%";
      txt.textContent = "Còn " + (next.pts - state.score) + " ⭐ là được " + next.emoji + " " + next.label;
    } else if (sorted.length) {
      fill.style.width = "100%";
      txt.textContent = "🎉 Bé đủ điểm cho mọi phần thưởng!";
    } else {
      fill.style.width = "0%";
      txt.textContent = "Hãy làm việc tốt nhé!";
    }
  }

  function renderGrid(sel, items, type) {
    var grid = $(sel);
    grid.innerHTML = "";
    items.forEach(function (it) {
      var b = el("button", "card-btn " + type);
      b.innerHTML =
        '<span class="emoji">' + it.emoji + "</span>" +
        '<span class="label">' + esc(it.label) + "</span>" +
        '<span class="pts">' + (type === "good" ? "+" : "−") + it.pts + "</span>";
      b.addEventListener("click", function () {
        applyDelta(type === "good" ? it.pts : -it.pts, it.emoji, it.label, type);
      });
      grid.appendChild(b);
    });
  }

  function renderRewards() {
    var grid = $("#rewardGrid");
    grid.innerHTML = "";
    state.rewards.forEach(function (it) {
      var ok = state.score >= it.pts;
      var b = el("button", "card-btn reward" + (ok ? " ready" : " locked"));
      b.innerHTML =
        '<span class="emoji">' + it.emoji + "</span>" +
        '<span class="label">' + esc(it.label) + "</span>" +
        '<span class="pts">' + (ok ? "Đổi " : "") + it.pts + " ⭐</span>";
      b.addEventListener("click", function () { redeem(it); });
      grid.appendChild(b);
    });
  }

  function renderHistory() {
    var list = $("#historyList");
    list.innerHTML = "";
    var today = state.history.filter(function (h) { return h.ts >= todayStart(); });
    if (!today.length) {
      var empty = el("li", "history-empty");
      empty.textContent = "Chưa có hoạt động nào hôm nay 🌟";
      empty.style.boxShadow = "none";
      empty.style.background = "transparent";
      list.appendChild(empty);
    } else {
      today.slice().reverse().slice(0, 12).forEach(function (h) {
        var li = el("li");
        var cls = h.type === "reward" ? "reward" : (h.delta >= 0 ? "plus" : "minus");
        var sign = h.delta > 0 ? "+" : "";
        li.innerHTML =
          '<span class="h-emoji">' + h.emoji + "</span>" +
          '<span class="h-text">' + esc(h.text) + "</span>" +
          '<span class="h-pts ' + cls + '">' + sign + h.delta + " ⭐</span>";
        list.appendChild(li);
      });
    }
    $("#undoBtn").disabled = state.history.length === 0;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- Hành động ----
  function applyDelta(delta, emoji, label, type) {
    state.score += delta;
    if (state.score < 0) state.score = 0;
    state.history.push({ emoji: emoji, text: label, delta: delta, type: type, ts: Date.now() });
    save();

    var s = $("#score");
    s.textContent = state.score;
    s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump");

    if (delta >= 0) { confetti(); beep(true); toast("Giỏi quá! +" + delta + " ⭐"); }
    else { beep(false); toast("Cố gắng hơn nhé " + delta + " ⭐"); }

    renderProgress();
    renderRewards();
    renderHistory();
  }

  function redeem(it) {
    if (state.score < it.pts) {
      toast("Cần thêm " + (it.pts - state.score) + " ⭐ nữa nhé!");
      beep(false);
      return;
    }
    state.score -= it.pts;
    state.history.push({ emoji: it.emoji, text: "Đổi: " + it.label, delta: -it.pts, type: "reward", ts: Date.now() });
    save();
    $("#score").textContent = state.score;
    confetti();
    beep(true);
    toast("🎉 Tuyệt vời! Bé nhận " + it.emoji + " " + it.label);
    renderProgress();
    renderRewards();
    renderHistory();
  }

  function undo() {
    if (!state.history.length) return;
    var last = state.history.pop();
    state.score -= last.delta; // đảo ngược
    if (state.score < 0) state.score = 0;
    save();
    $("#score").textContent = state.score;
    toast("Đã hoàn tác");
    renderProgress();
    renderRewards();
    renderHistory();
  }

  // ---- Tabs ----
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      $("#tab-" + tab.dataset.tab).classList.add("active");
    });
  });

  $("#undoBtn").addEventListener("click", undo);

  // ============ CÀI ĐẶT (khoá PIN) ============
  var settings = $("#settings");
  $("#lockBtn").addEventListener("click", openPin);
  $("#closeSettings").addEventListener("click", function () { settings.classList.add("hidden"); render(); });

  function openPin() {
    settings.classList.remove("hidden");
    var entered = "";
    var body = $("#settingsBody");
    body.innerHTML =
      '<div class="pin-pad">' +
      '<p style="font-weight:800">Nhập mật khẩu của ba mẹ</p>' +
      '<div class="pin-dots" id="pinDots"></div>' +
      '<div class="pin-keys" id="pinKeys"></div>' +
      '<p class="hint">Mặc định là 1234 — có thể đổi trong cài đặt</p>' +
      "</div>";
    var dots = $("#pinDots");
    var keys = $("#pinKeys");
    ["1","2","3","4","5","6","7","8","9","⌫","0","OK"].forEach(function (k) {
      var btn = el("button");
      btn.textContent = k;
      btn.addEventListener("click", function () {
        if (k === "⌫") entered = entered.slice(0, -1);
        else if (k === "OK") {
          if (entered === String(state.pin)) openSettings();
          else { toast("Sai mật khẩu"); entered = ""; }
        } else if (entered.length < 6) entered += k;
        dots.textContent = entered.replace(/./g, "●");
      });
      keys.appendChild(btn);
    });
  }

  function openSettings() {
    var body = $("#settingsBody");
    body.innerHTML = "";

    // Thông tin bé
    var info = el("div", "set-section");
    info.innerHTML = "<h3>👶 Thông tin bé</h3>";
    info.appendChild(field("Tên bé", "kidName", state.kidName, "text"));
    info.appendChild(field("Linh vật (emoji)", "mascot", state.mascot, "text"));
    body.appendChild(info);

    body.appendChild(itemSection("😊 Việc tốt (cộng điểm)", "good"));
    body.appendChild(itemSection("😕 Chưa ngoan (trừ điểm)", "bad"));
    body.appendChild(itemSection("🎁 Phần thưởng", "rewards"));

    // Đổi mật khẩu + reset
    var sec = el("div", "set-section");
    sec.innerHTML = "<h3>🔐 Khác</h3>";
    sec.appendChild(field("Mật khẩu ba mẹ", "pin", state.pin, "text"));
    var reset = el("button", "danger-btn");
    reset.textContent = "🗑️ Xoá hết điểm & lịch sử";
    reset.addEventListener("click", function () {
      if (confirm("Đặt lại điểm về 0 và xoá lịch sử?")) {
        state.score = 0; state.history = []; save(); toast("Đã đặt lại"); openSettings();
      }
    });
    sec.appendChild(reset);

    var restore = el("button", "danger-btn");
    restore.style.background = "#8a80a8";
    restore.textContent = "↺ Khôi phục danh sách mặc định";
    restore.addEventListener("click", function () {
      if (confirm("Khôi phục danh sách việc tốt/chưa ngoan/phần thưởng mặc định? (Điểm được giữ nguyên)")) {
        state.good = JSON.parse(JSON.stringify(DEFAULT.good));
        state.bad = JSON.parse(JSON.stringify(DEFAULT.bad));
        state.rewards = JSON.parse(JSON.stringify(DEFAULT.rewards));
        save(); openSettings();
      }
    });
    sec.appendChild(restore);
    body.appendChild(sec);
  }

  function field(labelText, key, value, type) {
    var f = el("div", "field");
    var lab = el("label"); lab.textContent = labelText;
    var inp = el("input"); inp.type = type; inp.value = value;
    inp.addEventListener("input", function () {
      state[key] = inp.value || DEFAULT[key];
      save();
    });
    f.appendChild(lab); f.appendChild(inp);
    return f;
  }

  function itemSection(title, key) {
    var sec = el("div", "set-section");
    var h = el("h3"); h.textContent = title; sec.appendChild(h);

    state[key].forEach(function (it) {
      sec.appendChild(itemRow(key, it));
    });

    var add = el("button", "add-btn");
    add.textContent = "➕ Thêm mục mới";
    add.addEventListener("click", function () {
      state[key].push({ id: uid(), emoji: "⭐", label: "Mục mới", pts: 1 });
      save();
      sec.insertBefore(itemRow(key, state[key][state[key].length - 1]), add);
    });
    sec.appendChild(add);
    return sec;
  }

  function itemRow(key, it) {
    var row = el("div", "set-row");

    var em = el("input", "i-emoji"); em.value = it.emoji; em.maxLength = 4;
    em.addEventListener("input", function () { it.emoji = em.value; save(); });

    var lb = el("input", "i-label"); lb.value = it.label;
    lb.addEventListener("input", function () { it.label = lb.value; save(); });

    var pt = el("input", "i-pts"); pt.type = "number"; pt.value = it.pts; pt.min = 0;
    pt.addEventListener("input", function () { it.pts = Math.max(0, parseInt(pt.value, 10) || 0); save(); });

    var del = el("button", "del"); del.textContent = "✕";
    del.addEventListener("click", function () {
      var i = state[key].indexOf(it);
      if (i > -1) state[key].splice(i, 1);
      save();
      row.remove();
    });

    row.appendChild(em); row.appendChild(lb); row.appendChild(pt); row.appendChild(del);
    return row;
  }

  // ---- Đăng ký service worker (chạy offline) ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  // Chặn double-tap zoom trên iOS
  var lastTouch = 0;
  document.addEventListener("touchend", function (e) {
    var now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  render();
})();
