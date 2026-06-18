/* Bảng Sao Của Bé — chấm điểm cho bé, hỗ trợ nhiều hồ sơ + avatar ảnh.
   Dữ liệu lưu offline bằng localStorage. */
(function () {
  "use strict";

  var STORE_KEY = "bang-sao-v2";
  var OLD_KEY = "bang-sao-v1";

  // ---- Mẫu việc / thưởng mặc định ----
  var DEF_GOOD = [
    { id: "g1", emoji: "🦷", label: "Đánh răng", pts: 2 },
    { id: "g2", emoji: "🛏️", label: "Dọn giường", pts: 2 },
    { id: "g3", emoji: "📚", label: "Học bài", pts: 3 },
    { id: "g4", emoji: "🍚", label: "Ăn hết suất", pts: 2 },
    { id: "g5", emoji: "🧸", label: "Cất đồ chơi", pts: 2 },
    { id: "g6", emoji: "🤝", label: "Giúp ba mẹ", pts: 3 },
    { id: "g7", emoji: "😴", label: "Ngủ đúng giờ", pts: 2 },
    { id: "g8", emoji: "🚿", label: "Tự tắm rửa", pts: 2 }
  ];
  var DEF_BAD = [
    { id: "b1", emoji: "😤", label: "Cãi lời", pts: 3 },
    { id: "b2", emoji: "😭", label: "Mè nheo", pts: 2 },
    { id: "b3", emoji: "📱", label: "Xem TV quá giờ", pts: 2 },
    { id: "b4", emoji: "🍬", label: "Đòi bánh kẹo", pts: 1 },
    { id: "b5", emoji: "🤥", label: "Nói dối", pts: 4 },
    { id: "b6", emoji: "🧹", label: "Bày bừa", pts: 2 }
  ];
  var DEF_REWARDS = [
    { id: "r1", emoji: "🍦", label: "Que kem", pts: 10 },
    { id: "r2", emoji: "🎬", label: "Xem hoạt hình", pts: 15 },
    { id: "r3", emoji: "🎡", label: "Đi công viên", pts: 40 },
    { id: "r4", emoji: "🧸", label: "Đồ chơi nhỏ", pts: 60 },
    { id: "r5", emoji: "🍕", label: "Ăn pizza", pts: 50 }
  ];

  var AVATAR_EMOJIS = ["🦄","🐱","🐶","🐰","🦊","🐼","🐯","🦁","🐸","🐵","🐧","🦖","🐢","🦋","🌟","🚀","👦","👧","🧒","👸","🦸","🐬"];

  var LEVELS = [
    "Ngôi sao nhí", "Bé chăm ngoan", "Siêu nhân nhỏ", "Nhà vô địch",
    "Anh hùng tí hon", "Phù thủy điểm số", "Huyền thoại nhí"
  ];
  var STARS_PER_LEVEL = 20;

  function defaultState() {
    return {
      activeId: "p1",
      profiles: [makeProfile("p1", "Bé Ngoan", "🦄")],
      pin: "1234",
      good: clone(DEF_GOOD),
      bad: clone(DEF_BAD),
      rewards: clone(DEF_REWARDS)
    };
  }
  function makeProfile(id, name, emoji) {
    return { id: id, name: name, avatar: { type: "emoji", value: emoji || "🦄" }, score: 0, history: [] };
  }

  var state = load();

  // ---- Lưu / Tải ----
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        var def = defaultState();
        for (var k in def) if (!(k in d)) d[k] = def[k];
        if (!d.profiles || !d.profiles.length) d.profiles = [makeProfile("p1", "Bé Ngoan", "🦄")];
        if (!findProfile(d, d.activeId)) d.activeId = d.profiles[0].id;
        return d;
      }
      // Nâng cấp từ phiên bản cũ (1 bé)
      var old = localStorage.getItem(OLD_KEY);
      if (old) {
        var o = JSON.parse(old);
        var s = defaultState();
        s.pin = o.pin || "1234";
        s.good = o.good || s.good;
        s.bad = o.bad || s.bad;
        s.rewards = o.rewards || s.rewards;
        s.profiles = [{
          id: "p1", name: o.kidName || "Bé Ngoan",
          avatar: { type: "emoji", value: o.mascot || "🦄" },
          score: o.score || 0, history: o.history || []
        }];
        s.activeId = "p1";
        return s;
      }
    } catch (e) {}
    return defaultState();
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
  function findProfile(s, id) { for (var i = 0; i < s.profiles.length; i++) if (s.profiles[i].id === id) return s.profiles[i]; return null; }
  function active() { return findProfile(state, state.activeId) || state.profiles[0]; }

  // ---- Tiện ích ----
  function $(s) { return document.querySelector(s); }
  function el(t, c) { var e = document.createElement(t); if (c) e.className = c; return e; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function todayStart() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function uid(p) { return (p || "x") + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function levelOf(score) { return Math.floor(Math.max(0, score) / STARS_PER_LEVEL) + 1; }
  function levelTitle(lv) { return LEVELS[Math.min(lv - 1, LEVELS.length - 1)]; }

  // ---- Avatar render dùng chung ----
  function avatarHTML(av) {
    if (av && av.type === "photo" && av.value) return '<img src="' + av.value + '" alt="" />';
    return (av && av.value) || "🙂";
  }

  // ---- Âm thanh ----
  var audioCtx = null;
  function tones(seq) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var t = audioCtx.currentTime;
      seq.forEach(function (f, i) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "triangle"; o.frequency.value = f; o.connect(g); g.connect(audioCtx.destination);
        var st = t + i * 0.09;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.25, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.2);
        o.start(st); o.stop(st + 0.22);
      });
    } catch (e) {}
  }
  var sndGood = function () { tones([523, 659, 784]); };
  var sndBad = function () { tones([392, 311]); };
  var sndWin = function () { tones([523, 659, 784, 1047]); };

  // ---- Hiệu ứng ----
  function confetti(n) {
    var layer = $("#confetti");
    var colors = ["#ffd640", "#7c5cfa", "#ec6dbf", "#2bd49b", "#ff7a85", "#4cc9f0"];
    for (var i = 0; i < (n || 28); i++) {
      var p = el("div", "confetti-piece");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.4 + Math.random() * 1.3) + "s";
      p.style.animationDelay = Math.random() * 0.25 + "s";
      layer.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 3000); })(p);
    }
  }
  function burstAt(x, y, emojis) {
    var layer = $("#burst");
    var set = emojis || ["⭐", "✨", "🌟", "💫"];
    for (var i = 0; i < 10; i++) {
      var s = el("div", "spark");
      s.textContent = set[i % set.length];
      s.style.left = x + "px"; s.style.top = y + "px";
      var ang = (Math.PI * 2 * i) / 10 + Math.random();
      var dist = 50 + Math.random() * 60;
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 20) + "px");
      layer.appendChild(s);
      (function (node) { setTimeout(function () { node.remove(); }, 750); })(s);
    }
  }
  function reactMascot() { var m = $("#mascot"); m.classList.remove("react"); void m.offsetWidth; m.classList.add("react"); }

  var SPEECH_GOOD = ["Giỏi quá đi! 🎉", "Bé ngoan tuyệt vời! 💖", "Wow, thêm sao rồi! ⭐", "Tự hào về bé! 🥰", "Siêu lắm luôn! 🚀"];
  var SPEECH_BAD = ["Lần sau cố gắng nhé 💪", "Không sao, bé sửa được mà 🌈", "Mình ngoan hơn nha 🤗"];
  function say(msg) { var sp = $("#speech"); sp.textContent = msg; sp.style.animation = "none"; void sp.offsetWidth; sp.style.animation = ""; }

  var toastTimer = null;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800); }

  function levelUp(newLv) {
    $("#levelupSub").textContent = "Cấp " + newLv + " · " + levelTitle(newLv);
    var box = $("#levelup");
    box.classList.remove("hidden");
    confetti(60); sndWin();
    setTimeout(function () { box.classList.add("hidden"); }, 2200);
  }

  // ---- Nền động ----
  function buildBg() {
    var bg = $("#bg");
    var set = ["⭐", "☁️", "🎈", "✨", "🌈", "🦋", "🌸", "💫"];
    for (var i = 0; i < 12; i++) {
      var f = el("div", "floaty");
      f.textContent = set[i % set.length];
      f.style.left = Math.random() * 100 + "vw";
      f.style.fontSize = (20 + Math.random() * 22) + "px";
      f.style.animationDuration = (10 + Math.random() * 12) + "s";
      f.style.animationDelay = (-Math.random() * 18) + "s";
      bg.appendChild(f);
    }
  }

  // ---- Render chính ----
  function render() {
    var p = active();
    $("#kidName").textContent = p.name;
    $("#avatarInner").innerHTML = avatarHTML(p.avatar);
    // mascot: nếu avatar là emoji thì cho mascot giống avatar, nếu là ảnh thì giữ ngôi sao vui
    $("#mascot").textContent = p.avatar.type === "emoji" ? p.avatar.value : "🌟";

    var lv = levelOf(p.score);
    $("#levelBadge").textContent = "Cấp " + lv + " · " + levelTitle(lv);
    $("#score").textContent = p.score;

    renderProgress(p);
    renderGrid("#goodGrid", state.good, "good");
    renderGrid("#badGrid", state.bad, "bad");
    renderRewards(p);
    renderHistory(p);
  }

  function renderProgress(p) {
    var next = null;
    var sorted = state.rewards.slice().sort(function (a, b) { return a.pts - b.pts; });
    for (var i = 0; i < sorted.length; i++) if (p.score < sorted[i].pts) { next = sorted[i]; break; }
    var fill = $("#progressFill"), rocket = $("#progressRocket"), txt = $("#progressText");
    var pct;
    if (next) {
      pct = Math.max(0, Math.min(100, (p.score / next.pts) * 100));
      txt.textContent = "Còn " + (next.pts - p.score) + " ⭐ là được " + next.emoji + " " + next.label;
    } else if (sorted.length) {
      pct = 100; txt.textContent = "🎉 Bé đủ điểm cho mọi phần thưởng!";
    } else { pct = 0; txt.textContent = "Hãy làm việc tốt nhé!"; }
    fill.style.width = pct + "%";
    rocket.style.left = pct + "%";
  }

  function renderGrid(sel, items, type) {
    var grid = $(sel); grid.innerHTML = "";
    items.forEach(function (it) {
      var b = el("button", "card-btn " + type);
      b.innerHTML = '<span class="emoji">' + it.emoji + "</span>" +
        '<span class="label">' + esc(it.label) + "</span>" +
        '<span class="pts">' + (type === "good" ? "+" : "−") + it.pts + "</span>";
      b.addEventListener("click", function (ev) {
        applyDelta(type === "good" ? it.pts : -it.pts, it.emoji, it.label, type, ev);
      });
      grid.appendChild(b);
    });
  }

  function renderRewards(p) {
    var grid = $("#rewardGrid"); grid.innerHTML = "";
    state.rewards.forEach(function (it) {
      var ok = p.score >= it.pts;
      var b = el("button", "card-btn reward" + (ok ? " ready" : " locked"));
      b.innerHTML = '<span class="emoji">' + it.emoji + "</span>" +
        '<span class="label">' + esc(it.label) + "</span>" +
        '<span class="pts">' + (ok ? "Đổi " : "") + it.pts + " ⭐</span>";
      b.addEventListener("click", function (ev) { redeem(it, ev); });
      grid.appendChild(b);
    });
  }

  function renderHistory(p) {
    var list = $("#historyList"); list.innerHTML = "";
    var today = p.history.filter(function (h) { return h.ts >= todayStart(); });
    if (!today.length) {
      var empty = el("li", "history-empty");
      empty.textContent = "Chưa có hoạt động nào hôm nay 🌟";
      list.appendChild(empty);
    } else {
      today.slice().reverse().slice(0, 12).forEach(function (h) {
        var li = el("li");
        var cls = h.type === "reward" ? "reward" : (h.delta >= 0 ? "plus" : "minus");
        var sign = h.delta > 0 ? "+" : "";
        li.innerHTML = '<span class="h-emoji">' + h.emoji + "</span>" +
          '<span class="h-text">' + esc(h.text) + "</span>" +
          '<span class="h-pts ' + cls + '">' + sign + h.delta + " ⭐</span>";
        list.appendChild(li);
      });
    }
    $("#undoBtn").disabled = p.history.length === 0;
  }

  function evXY(ev) {
    if (ev && ev.currentTarget) { var r = ev.currentTarget.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  // ---- Hành động ----
  function applyDelta(delta, emoji, label, type, ev) {
    var p = active();
    var before = levelOf(p.score);
    p.score = Math.max(0, p.score + delta);
    p.history.push({ emoji: emoji, text: label, delta: delta, type: type, ts: Date.now() });
    save();

    var s = $("#score"); s.textContent = p.score;
    s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump");
    var pos = evXY(ev);

    if (delta >= 0) {
      burstAt(pos.x, pos.y); confetti(); sndGood(); reactMascot();
      say(SPEECH_GOOD[Math.floor(Math.random() * SPEECH_GOOD.length)]);
      toast("Giỏi quá! +" + delta + " ⭐");
    } else {
      burstAt(pos.x, pos.y, ["💧", "🍃"]); sndBad();
      say(SPEECH_BAD[Math.floor(Math.random() * SPEECH_BAD.length)]);
      toast("Cố gắng hơn nhé " + delta + " ⭐");
    }

    var after = levelOf(p.score);
    if (after > before) setTimeout(function () { levelUp(after); }, 350);

    $("#levelBadge").textContent = "Cấp " + after + " · " + levelTitle(after);
    renderProgress(p); renderRewards(p); renderHistory(p);
  }

  function redeem(it, ev) {
    var p = active();
    if (p.score < it.pts) { toast("Cần thêm " + (it.pts - p.score) + " ⭐ nữa nhé!"); sndBad(); return; }
    p.score -= it.pts;
    p.history.push({ emoji: it.emoji, text: "Đổi: " + it.label, delta: -it.pts, type: "reward", ts: Date.now() });
    save();
    $("#score").textContent = p.score;
    var pos = evXY(ev);
    burstAt(pos.x, pos.y, ["🎁", "🎉", "⭐"]); confetti(45); sndWin(); reactMascot();
    say("Tuyệt vời! 🎉");
    toast("🎉 Bé nhận " + it.emoji + " " + it.label);
    renderProgress(p); renderRewards(p); renderHistory(p);
  }

  function undo() {
    var p = active();
    if (!p.history.length) return;
    var last = p.history.pop();
    p.score = Math.max(0, p.score - last.delta);
    save();
    toast("Đã hoàn tác");
    render();
  }

  // ---- Tabs ----
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      document.querySelectorAll(".tab-panel").forEach(function (pn) { pn.classList.remove("active"); });
      tab.classList.add("active");
      $("#tab-" + tab.dataset.tab).classList.add("active");
    });
  });
  $("#undoBtn").addEventListener("click", undo);

  // =================== HỒ SƠ ===================
  var profileSheet = $("#profileSheet");
  var profileEdit = $("#profileEdit");
  $("#profileBtn").addEventListener("click", openProfileSheet);
  $("#closeProfiles").addEventListener("click", function () { profileSheet.classList.add("hidden"); });
  $("#closeProfileEdit").addEventListener("click", function () { profileEdit.classList.add("hidden"); });

  function openProfileSheet() {
    profileSheet.classList.remove("hidden");
    var list = $("#profileList"); list.innerHTML = "";
    state.profiles.forEach(function (p) {
      var card = el("div", "profile-card" + (p.id === state.activeId ? " active" : ""));
      var lv = levelOf(p.score);
      card.innerHTML =
        '<div class="p-ava">' + avatarHTML(p.avatar) + "</div>" +
        '<div class="p-main"><div class="p-name">' + esc(p.name) + "</div>" +
        '<div class="p-score">' + p.score + " ⭐ · Cấp " + lv + "</div></div>";
      var go = el("button", "p-go"); go.textContent = p.id === state.activeId ? "Đang chọn" : "Chọn";
      go.addEventListener("click", function () { state.activeId = p.id; save(); profileSheet.classList.add("hidden"); render(); toast("Xin chào " + p.name + "! 👋"); });
      var ed = el("button", "p-edit"); ed.textContent = "✏️";
      ed.addEventListener("click", function () { openProfileEdit(p); });
      card.appendChild(go); card.appendChild(ed);
      list.appendChild(card);
    });
    var add = el("button", "add-btn"); add.textContent = "➕ Thêm bé";
    add.addEventListener("click", function () {
      var np = makeProfile(uid("p"), "Bé mới", AVATAR_EMOJIS[Math.floor(Math.random() * 14)]);
      state.profiles.push(np); state.activeId = np.id; save();
      profileSheet.classList.add("hidden"); render(); openProfileEdit(np);
    });
    list.appendChild(add);
  }

  function openProfileEdit(p) {
    profileSheet.classList.add("hidden");
    profileEdit.classList.remove("hidden");
    $("#profileEditTitle").textContent = "✏️ Hồ sơ: " + p.name;
    var body = $("#profileEditBody"); body.innerHTML = "";

    var ava = el("div", "ava-big"); ava.innerHTML = avatarHTML(p.avatar); body.appendChild(ava);

    var actions = el("div", "ava-actions");
    var photoBtn = el("button", "btn primary"); photoBtn.style.width = "auto"; photoBtn.style.padding = "10px 16px"; photoBtn.style.marginTop = "0";
    photoBtn.textContent = "📷 Chọn ảnh";
    photoBtn.addEventListener("click", function () { pickPhoto(p, ava); });
    actions.appendChild(photoBtn);
    body.appendChild(actions);

    var pick = el("div", "emoji-pick");
    AVATAR_EMOJIS.forEach(function (em) {
      var b = el("button"); b.textContent = em;
      if (p.avatar.type === "emoji" && p.avatar.value === em) b.classList.add("sel");
      b.addEventListener("click", function () {
        p.avatar = { type: "emoji", value: em }; save();
        ava.innerHTML = em;
        pick.querySelectorAll("button").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
        render();
      });
      pick.appendChild(b);
    });
    body.appendChild(pick);

    var f = el("div", "field");
    f.innerHTML = '<label>Tên bé</label>';
    var inp = el("input"); inp.type = "text"; inp.value = p.name;
    inp.addEventListener("input", function () { p.name = inp.value || "Bé"; save(); render(); });
    f.appendChild(inp); body.appendChild(f);

    var done = el("button", "btn green"); done.textContent = "✅ Xong";
    done.addEventListener("click", function () { profileEdit.classList.add("hidden"); render(); });
    body.appendChild(done);
  }

  // ---- Chọn & nén ảnh avatar ----
  var photoInput = $("#photoInput");
  var photoTarget = null; // {profile, avaEl}
  function pickPhoto(p, avaEl) { photoTarget = { p: p, ava: avaEl }; photoInput.value = ""; photoInput.click(); }
  photoInput.addEventListener("change", function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file || !photoTarget) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var size = 256;
        var c = document.createElement("canvas"); c.width = size; c.height = size;
        var ctx = c.getContext("2d");
        var scale = Math.max(size / img.width, size / img.height);
        var w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        var data;
        try { data = c.toDataURL("image/jpeg", 0.82); } catch (err) { data = c.toDataURL(); }
        photoTarget.p.avatar = { type: "photo", value: data };
        save();
        if (photoTarget.ava) photoTarget.ava.innerHTML = avatarHTML(photoTarget.p.avatar);
        var pickWrap = $("#profileEditBody .emoji-pick");
        if (pickWrap) pickWrap.querySelectorAll("button").forEach(function (x) { x.classList.remove("sel"); });
        render();
        toast("Đã đổi ảnh đại diện 📸");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // =================== CÀI ĐẶT (PIN) ===================
  var settings = $("#settings");
  $("#lockBtn").addEventListener("click", openPin);
  $("#closeSettings").addEventListener("click", function () { settings.classList.add("hidden"); render(); });

  function openPin() {
    settings.classList.remove("hidden");
    var entered = "";
    var body = $("#settingsBody");
    body.innerHTML = '<div class="pin-pad"><p style="font-weight:800">Nhập mật khẩu của ba mẹ</p>' +
      '<div class="pin-dots" id="pinDots"></div><div class="pin-keys" id="pinKeys"></div>' +
      '<p class="hint">Mặc định là 1234 — đổi được trong cài đặt</p></div>';
    var dots = $("#pinDots"), keys = $("#pinKeys");
    ["1","2","3","4","5","6","7","8","9","⌫","0","OK"].forEach(function (k) {
      var btn = el("button"); btn.textContent = k;
      btn.addEventListener("click", function () {
        if (k === "⌫") entered = entered.slice(0, -1);
        else if (k === "OK") { if (entered === String(state.pin)) return openSettings(); toast("Sai mật khẩu"); entered = ""; }
        else if (entered.length < 6) entered += k;
        dots.textContent = entered.replace(/./g, "●");
      });
      keys.appendChild(btn);
    });
  }

  function openSettings() {
    var body = $("#settingsBody"); body.innerHTML = "";

    // Quản lý hồ sơ
    var ps = el("div", "set-section");
    ps.innerHTML = "<h3>👨‍👩‍👧 Hồ sơ</h3>";
    state.profiles.forEach(function (p) {
      var row = el("div", "set-row");
      row.innerHTML = '<span class="i-emoji">' + (p.avatar.type === "emoji" ? p.avatar.value : "📷") + "</span>";
      var nm = el("div", "i-label"); nm.style.fontWeight = "800"; nm.textContent = p.name + " (" + p.score + " ⭐)";
      row.appendChild(nm);
      var del = el("button", "del"); del.textContent = "✕";
      del.addEventListener("click", function () {
        if (state.profiles.length <= 1) { toast("Phải còn ít nhất 1 bé"); return; }
        if (confirm("Xoá hồ sơ " + p.name + "? (Mất hết điểm của bé này)")) {
          state.profiles = state.profiles.filter(function (x) { return x.id !== p.id; });
          if (state.activeId === p.id) state.activeId = state.profiles[0].id;
          save(); openSettings(); render();
        }
      });
      row.appendChild(del); ps.appendChild(row);
    });
    var addP = el("button", "add-btn"); addP.textContent = "➕ Thêm bé";
    addP.addEventListener("click", function () {
      state.profiles.push(makeProfile(uid("p"), "Bé mới", AVATAR_EMOJIS[Math.floor(Math.random() * 14)]));
      save(); openSettings(); render();
    });
    ps.appendChild(addP);
    body.appendChild(ps);

    body.appendChild(itemSection("😊 Việc tốt (cộng điểm)", "good"));
    body.appendChild(itemSection("😕 Chưa ngoan (trừ điểm)", "bad"));
    body.appendChild(itemSection("🎁 Phần thưởng", "rewards"));

    var sec = el("div", "set-section");
    sec.innerHTML = "<h3>🔐 Khác</h3>";
    sec.appendChild(field("Mật khẩu ba mẹ", "pin", state.pin));

    var reset = el("button", "btn danger"); reset.textContent = "🗑️ Xoá điểm & lịch sử của bé đang chọn";
    reset.addEventListener("click", function () {
      if (confirm("Đặt lại điểm của " + active().name + " về 0 và xoá lịch sử?")) {
        var p = active(); p.score = 0; p.history = []; save(); toast("Đã đặt lại"); render();
      }
    });
    sec.appendChild(reset);

    var restore = el("button", "btn grey"); restore.textContent = "↺ Khôi phục danh sách mặc định";
    restore.addEventListener("click", function () {
      if (confirm("Khôi phục danh sách việc tốt / chưa ngoan / phần thưởng mặc định? (Điểm giữ nguyên)")) {
        state.good = clone(DEF_GOOD); state.bad = clone(DEF_BAD); state.rewards = clone(DEF_REWARDS);
        save(); openSettings(); render();
      }
    });
    sec.appendChild(restore);
    body.appendChild(sec);
  }

  function field(labelText, key) {
    var f = el("div", "field");
    var lab = el("label"); lab.textContent = labelText;
    var inp = el("input"); inp.type = "text"; inp.value = state[key];
    inp.addEventListener("input", function () { state[key] = inp.value || "1234"; save(); });
    f.appendChild(lab); f.appendChild(inp); return f;
  }

  function itemSection(title, key) {
    var sec = el("div", "set-section");
    var h = el("h3"); h.textContent = title; sec.appendChild(h);
    state[key].forEach(function (it) { sec.appendChild(itemRow(key, it)); });
    var add = el("button", "add-btn"); add.textContent = "➕ Thêm mục mới";
    add.addEventListener("click", function () {
      state[key].push({ id: uid("i"), emoji: "⭐", label: "Mục mới", pts: 1 });
      save(); sec.insertBefore(itemRow(key, state[key][state[key].length - 1]), add);
    });
    sec.appendChild(add); return sec;
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
    del.addEventListener("click", function () { var i = state[key].indexOf(it); if (i > -1) state[key].splice(i, 1); save(); row.remove(); });
    row.appendChild(em); row.appendChild(lb); row.appendChild(pt); row.appendChild(del);
    return row;
  }

  // ---- Service worker ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  // Chặn double-tap zoom iOS
  var lastTouch = 0;
  document.addEventListener("touchend", function (e) {
    var now = Date.now(); if (now - lastTouch < 300) e.preventDefault(); lastTouch = now;
  }, { passive: false });

  buildBg();
  render();
})();
