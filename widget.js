// MN Kantoormeubelen — Chat Widget v3 (nieuw design)
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    var FAB_COLOR = "#1a9e3f";
    var ACCENT = "#2196F3";
    var ACCENT_LIGHT = "#E3F2FD";
    var ACCENT_DARK = "#0D5CA8";
    var ACCENT_SOFT = "#CFE8FC";
    var DEFAULT_GREETING = "Goedemiddag! Waarmee kan ik je helpen? 👋";
    var DEFAULT_OFFLINE_MSG = "Bedankt voor je bericht! Onze klantenservice is momenteel gesloten. We reageren zo snel mogelijk tijdens onze openingstijden.";
    var SHOP = "MN Kantoormeubelen";
    var isShopOnline = true;
    var shopSettings = null;

    var FIREBASE_CONFIG = {
      apiKey: "AIzaSyAvgWPDiTlbcCwqE2Hwh47DHputbSQyCds",
      authDomain: "mn-chat-7a6bd.firebaseapp.com",
      databaseURL: "https://mn-chat-7a6bd-default-rtdb.firebaseio.com",
      projectId: "mn-chat-7a6bd",
      storageBucket: "mn-chat-7a6bd.firebasestorage.app",
      messagingSenderId: "765217629725",
      appId: "1:765217629725:web:85fe5f0d296025a75908f4"
    };

    var style = document.createElement("style");
    style.textContent = "#mn-chat-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; } " +
      "#mn-chat-fab { position: fixed; bottom: 24px; right: 24px; z-index: 9999; width: 56px; height: 56px; border-radius: 50%; background: #fff; border: 2.5px solid " + FAB_COLOR + "; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 14px rgba(26,158,63,0.3); transition: transform 0.15s; } " +
      "#mn-chat-fab:hover { transform: scale(1.06); } " +
      "#mn-chat-fab-badge { position: absolute; top: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #e24b4a; border: 2px solid #fff; color: #fff; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; } " +
      "#mn-chat-tooltip { position: fixed; bottom: 90px; right: 24px; z-index: 9999; background: " + FAB_COLOR + "; color: #fff; font-size: 13px; font-weight: 500; padding: 6px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); white-space: nowrap; pointer-events: none; } " +
      "#mn-chat-tooltip::after { content: ''; position: absolute; bottom: -5px; right: 20px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid " + FAB_COLOR + "; } " +
      "#mn-chat-popup { position: fixed; bottom: 90px; right: 24px; z-index: 9998; width: 340px; background: #fff; border-radius: 16px; border: 0.5px solid #e5e7eb; box-shadow: 0 8px 32px rgba(0,0,0,0.12); display: none; flex-direction: column; overflow: hidden; } " +
      "#mn-chat-popup.open { display: flex; } " +
      "#mn-chat-header { background: " + ACCENT + "; padding: 14px 16px; display: flex; align-items: center; gap: 12px; } " +
      ".mn-avatar { width: 40px; height: 40px; border-radius: 50%; background: " + ACCENT_LIGHT + "; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; color: " + ACCENT_DARK + "; position: relative; flex-shrink: 0; } " +
      ".mn-online-dot { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: #4CD137; border: 2px solid " + ACCENT + "; } " +
      ".mn-header-name { color: #fff; font-size: 15px; font-weight: 500; } " +
      ".mn-header-sub { font-size: 12px; color: " + ACCENT_SOFT + "; margin-top: 1px; } " +
      "#mn-chat-close { cursor: pointer; margin-left: auto; font-size: 20px; line-height: 1; background: none; border: none; color: " + ACCENT_SOFT + "; } " +
      "#mn-chat-close:hover { color: #fff; } " +
      "#mn-chat-messages { padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 160px; max-height: 260px; overflow-y: auto; overflow-x: hidden; } " +
      ".mn-msg { display: flex; flex-direction: column; max-width: 80%; } " +
      ".mn-msg.agent { align-self: flex-start; } " +
      ".mn-msg.user { align-self: flex-end; } " +
      ".mn-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; } " +
      ".mn-msg.agent .mn-bubble { background: #f3f4f6; border: 0.5px solid #e5e7eb; color: #1a1a1a; border-bottom-left-radius: 4px; } " +
      ".mn-msg.user .mn-bubble { background: " + ACCENT + "; color: #fff; border-bottom-right-radius: 4px; } " +
      ".mn-bubble a { color: " + ACCENT + "; font-weight: 500; text-decoration: underline; word-break: break-all; } " +
      ".mn-msg.user .mn-bubble a { color: " + ACCENT_LIGHT + "; } " +
      ".mn-meta { font-size: 11px; color: #9ca3af; margin-top: 4px; padding-left: 4px; } " +
      ".mn-msg.user .mn-meta { text-align: right; padding-left: 0; padding-right: 4px; } " +
      "#mn-chat-input-row { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-top: 0.5px solid #e5e7eb; background: #fff; } " +
      "#mn-chat-input { flex: 1; border: 0.5px solid #e5e7eb; border-radius: 999px; padding: 10px 16px; font-size: 14px; outline: none; background: #fafafa; } " +
      "#mn-chat-input:focus { border-color: " + ACCENT + "; background: #fff; } " +
      "#mn-chat-send { width: 38px; height: 38px; border-radius: 50%; background: " + ACCENT + "; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.1s; } " +
      "#mn-chat-send:hover { transform: scale(1.05); } " +
      "#mn-chat-footer { text-align: center; font-size: 11px; color: #bbb; padding: 8px; background: #fff; border-top: 0.5px solid #e5e7eb; } " +
      ".mn-dot { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: mn-bounce 1.2s infinite; } " +
      ".mn-dot:nth-child(2){animation-delay:0.2s} .mn-dot:nth-child(3){animation-delay:0.4s} " +
      "@keyframes mn-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}";
    document.head.appendChild(style);

    var widget = document.createElement("div");
    widget.id = "mn-chat-widget";
    widget.innerHTML = '<div id="mn-chat-tooltip">Stel een vraag</div><div id="mn-chat-popup"><div id="mn-chat-header"><div class="mn-avatar">MN<div class="mn-online-dot" id="mn-chat-status-dot"></div></div><div><div class="mn-header-name">' + SHOP + '</div><div class="mn-header-sub" id="mn-chat-header-sub">Klantenservice &middot; reageert binnen 5 min</div></div><button id="mn-chat-close" aria-label="Sluit">&times;</button></div><div id="mn-chat-messages"></div><div id="mn-chat-input-row"><input id="mn-chat-input" placeholder="Stel je vraag&hellip;" /><button id="mn-chat-send" aria-label="Verstuur"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></div><div id="mn-chat-footer">' + SHOP + ' live chat</div></div><button id="mn-chat-fab" aria-label="Open chat"><svg viewBox="0 0 24 24" fill="none" stroke="' + FAB_COLOR + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="26" height="26"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="9" cy="10" r="1" fill="' + FAB_COLOR + '"></circle><circle cx="12" cy="10" r="1" fill="' + FAB_COLOR + '"></circle><circle cx="15" cy="10" r="1" fill="' + FAB_COLOR + '"></circle></svg><div id="mn-chat-fab-badge">1</div></button>';
    document.body.appendChild(widget);

    var isOpen = false;
    var sessionId = getOrCreateSessionId();

    function getOrCreateSessionId() {
      try {
        var stored = localStorage.getItem("mn_chat_session_id");
        var storedTime = localStorage.getItem("mn_chat_session_time");
        var now = Date.now();
        // Hergebruik sessie als die korter dan 24 uur geleden is aangemaakt
        if (stored && storedTime && (now - parseInt(storedTime)) < 24 * 60 * 60 * 1000) {
          return stored;
        }
      } catch (e) {
        // localStorage niet beschikbaar, val terug op tijdelijke sessie
      }
      var newId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      try {
        localStorage.setItem("mn_chat_session_id", newId);
        localStorage.setItem("mn_chat_session_time", Date.now().toString());
      } catch (e) {}
      return newId;
    }
    var db = null;
    var messagesRef = null;
    var msgs = [];

    function loadFirebase() {
      var s1 = document.createElement("script");
      s1.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
      s1.onload = function () {
        var s2 = document.createElement("script");
        s2.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
        s2.onload = function () {
          firebase.initializeApp(FIREBASE_CONFIG);
          db = firebase.database();
          messagesRef = db.ref("chats/" + sessionId + "/messages");
          checkShopStatusAndGreet();
        };
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    }

    function checkShopStatusAndGreet() {
      db.ref("settings").once("value").then(function(snap) {
        shopSettings = snap.val() || {};
        isShopOnline = computeOnlineStatus(shopSettings);
        updateFabAppearance();
        loadExistingMessagesThenGreet();
      }).catch(function() {
        loadExistingMessagesThenGreet();
      });
    }

    function loadExistingMessagesThenGreet() {
      messagesRef.once("value").then(function(snap) {
        var existing = snap.val();
        if (existing) {
          // Sessie bestond al: toon de eerdere berichten, geen nieuwe begroeting
          var msgs = Object.values(existing).sort(function(a,b){ return (a.timestamp||0)-(b.timestamp||0); });
          msgs.forEach(function(msg) {
            addMessage(msg.role === "agent" ? "agent" : "user", msg.text, msg.role === "agent" ? "Klantenservice" : "");
          });
        } else {
          // Nieuwe sessie: toon de begroeting
          var greeting = isShopOnline
            ? (shopSettings.msgOnline || DEFAULT_GREETING)
            : buildOfflineMessage(shopSettings);
          addMessage("agent", greeting, "Klantenservice");
        }
        // Vanaf nu live luisteren naar nieuwe berichten van werknemers
        attachLiveAgentListener();
      });
    }

    function attachLiveAgentListener() {
      var startTime = Date.now();
      messagesRef.on("child_added", function (snap) {
        var msg = snap.val();
        if (msg.role === "agent" && msg.timestamp && msg.timestamp >= startTime - 2000) {
          removeTyping();
          addMessage("agent", msg.text, "Klantenservice");
        }
      });
    }

    function computeOnlineStatus(settings) {
      if (!settings) return true;
      if (settings.online === true) return true;
      if (settings.scheduleOn === false) return settings.online !== false;
      var schedule = settings.schedule;
      if (!schedule || !schedule.length) return true;
      var now = new Date();
      var dayIdx = (now.getDay() + 6) % 7;
      var d = schedule[dayIdx];
      if (!d || !d.open) return false;
      var toMins = function(t) { var p = t.split(":"); return parseInt(p[0])*60 + parseInt(p[1]); };
      var nowMins = now.getHours()*60 + now.getMinutes();
      return nowMins >= toMins(d.from) && nowMins < toMins(d.to);
    }

    function buildOfflineMessage(settings) {
      var msg = settings.msgOffline || DEFAULT_OFFLINE_MSG;
      if (settings.showHours && settings.schedule) {
        var labels = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
        var now = new Date();
        var dayIdx = (now.getDay() + 6) % 7;
        var next = null, nextLabel = "";
        for (var i = 1; i <= 7; i++) {
          var idx = (dayIdx + i) % 7;
          if (settings.schedule[idx] && settings.schedule[idx].open) {
            next = settings.schedule[idx];
            nextLabel = labels[idx];
            break;
          }
        }
        if (next) {
          msg += " (open weer " + nextLabel + " om " + next.from + ")";
        }
      }
      return msg;
    }

    function updateFabAppearance() {
      var dot = document.getElementById("mn-chat-status-dot");
      if (dot) dot.style.background = isShopOnline ? "#4CD137" : "#9ca3af";
      var sub = document.getElementById("mn-chat-header-sub");
      if (sub) sub.innerHTML = isShopOnline
        ? "Klantenservice &middot; reageert binnen 5 min"
        : "Klantenservice &middot; momenteel afwezig";
    }

    function linkify(text) {
      var escaped = String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      var urlPattern = /((https?:\/\/|www\.)[^\s<]+)/gi;
      return escaped.replace(urlPattern, function(match) {
        var href = match.indexOf("http") === 0 ? match : "https://" + match;
        return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + match + '</a>';
      });
    }

    function addMessage(role, text, sender) {
      var now = new Date();
      var t = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
      var container = document.getElementById("mn-chat-messages");
      if (!container) return;
      var div = document.createElement("div");
      div.className = "mn-msg " + role;
      var meta = role === "agent" ? (sender + " &middot; " + t) : ("Jij &middot; " + t);
      div.innerHTML = '<div class="mn-bubble">' + linkify(text) + '</div><div class="mn-meta">' + meta + '</div>';
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
      var container = document.getElementById("mn-chat-messages");
      var div = document.createElement("div");
      div.className = "mn-msg agent"; div.id = "mn-typing";
      div.innerHTML = '<div style="display:flex;align-items:center;gap:4px;padding:10px 14px;background:#f3f4f6;border:0.5px solid #e5e7eb;border-radius:16px;border-bottom-left-radius:4px"><div class="mn-dot"></div><div class="mn-dot"></div><div class="mn-dot"></div></div>';
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function removeTyping() { var t = document.getElementById("mn-typing"); if (t) t.remove(); }

    function sendMessage() {
      var input = document.getElementById("mn-chat-input");
      var text = input.value.trim();
      if (!text) return;
      input.value = "";
      addMessage("user", text, "");
      showTyping();
      if (messagesRef) {
        messagesRef.push({ role: "customer", text: text, timestamp: Date.now() });
        db.ref("chats/" + sessionId).update({ page: window.location.href, started: Date.now(), status: "open" });
      }
    }

    document.getElementById("mn-chat-fab").addEventListener("click", function () {
      isOpen = !isOpen;
      var popup = document.getElementById("mn-chat-popup");
      if (isOpen) {
        popup.classList.add("open");
        document.getElementById("mn-chat-tooltip").style.display = "none";
        document.getElementById("mn-chat-fab-badge").style.display = "none";
      } else {
        popup.classList.remove("open");
      }
    });

    document.getElementById("mn-chat-close").addEventListener("click", function () {
      isOpen = false;
      document.getElementById("mn-chat-popup").classList.remove("open");
    });

    document.getElementById("mn-chat-send").addEventListener("click", sendMessage);
    document.getElementById("mn-chat-input").addEventListener("keydown", function (e) { if (e.key === "Enter") sendMessage(); });

    setTimeout(function () {
      var t = document.getElementById("mn-chat-tooltip");
      if (t) t.style.display = "none";
    }, 5000);

    loadFirebase();
  }
})();
