// MN Kantoormeubelen — Chat Widget
// Versie 1.1 — werkt vanuit <head>

(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
  var config = window.MNChatConfig || {};
  var FAB_COLOR = config.fabColor || "#1a9e3f";
  var ACCENT = config.accentColor || "#0a8de9";
  var GREETING = config.greeting || "Goedemiddag! Waarmee kan ik je helpen? 👋";
  var SHOP = config.shopName || "MN Kantoormeubelen";

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyAvgWPDiTlbcCwqE2Hwh47DHputbSQyCds",
    authDomain: "mn-chat-7a6bd.firebaseapp.com",
    databaseURL: "https://mn-chat-7a6bd-default-rtdb.firebaseio.com",
    projectId: "mn-chat-7a6bd",
    storageBucket: "mn-chat-7a6bd.firebasestorage.app",
    messagingSenderId: "765217629725",
    appId: "1:765217629725:web:85fe5f0d296025a75908f4"
  };

  // Inject styles
  var style = document.createElement("style");
  style.textContent = "\n    #mn-chat-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }\n    #mn-chat-fab {\n      position: fixed; bottom: 24px; right: 24px; z-index: 9999;\n      width: 56px; height: 56px; border-radius: 50%;\n      background: #fff; border: 2.5px solid " + FAB_COLOR + ";\n      cursor: pointer; display: flex; align-items: center; justify-content: center;\n      box-shadow: 0 3px 14px rgba(26,158,63,0.3);\n      transition: transform 0.15s;\n    }\n    #mn-chat-fab:hover { transform: scale(1.06); }\n    #mn-chat-fab svg { width: 26px; height: 26px; }\n    #mn-chat-fab-badge {\n      position: absolute; top: -2px; right: -2px;\n      width: 18px; height: 18px; border-radius: 50%;\n      background: #e24b4a; border: 2px solid #fff;\n      color: #fff; font-size: 10px; font-weight: 600;\n      display: flex; align-items: center; justify-content: center;\n    }\n    #mn-chat-tooltip {\n      position: fixed; bottom: 90px; right: 24px; z-index: 9999;\n      background: " + FAB_COLOR + "; color: #fff;\n      font-size: 13px; font-weight: 500;\n      padding: 6px 12px; border-radius: 20px;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n      white-space: nowrap; pointer-events: none;\n    }\n    #mn-chat-tooltip::after {\n      content: ''; position: absolute; bottom: -5px; right: 20px;\n      border-left: 5px solid transparent; border-right: 5px solid transparent;\n      border-top: 5px solid " + FAB_COLOR + ";\n    }\n    #mn-chat-popup {\n      position: fixed; bottom: 90px; right: 24px; z-index: 9998;\n      width: 320px; background: #fff; border-radius: 12px;\n      border: 0.5px solid #e5e7eb;\n      box-shadow: 0 8px 32px rgba(0,0,0,0.12);\n      display: none; flex-direction: column; overflow: hidden;\n    }\n    #mn-chat-popup.open { display: flex; }\n    #mn-chat-header {\n      background: " + ACCENT + "; padding: 12px 14px;\n      display: flex; align-items: center; gap: 10px;\n    }\n    .mn-avatar {\n      width: 38px; height: 38px; border-radius: 50%;\n      background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.4);\n      display: flex; align-items: center; justify-content: center;\n      font-size: 13px; font-weight: 600; color: #fff; position: relative;\n    }\n    .mn-online-dot {\n      position: absolute; bottom: 0; right: 0;\n      width: 10px; height: 10px; border-radius: 50%;\n      background: #4ade80; border: 2px solid " + ACCENT + ";\n    }\n    .mn-header-name { color: #fff; font-size: 14px; font-weight: 500; }\n    .mn-header-sub { font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 1px; }\n    #mn-chat-close { color: rgba(255,255,255,0.8); cursor: pointer; margin-left: auto; font-size: 20px; line-height: 1; background: none; border: none; }\n    #mn-chat-messages {\n      padding: 12px; display: flex; flex-direction: column; gap: 8px;\n      min-height: 140px; max-height: 220px; overflow-y: auto;\n    }\n    .mn-msg { display: flex; flex-direction: column; max-width: 85%; }\n    .mn-msg.agent { align-self: flex-start; }\n    .mn-msg.user { align-self: flex-end; }\n    .mn-bubble { padding: 8px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5; }\n    .mn-msg.agent .mn-bubble { background: #f3f4f6; color: #1a1a1a; border-bottom-left-radius: 3px; }\n    .mn-msg.user .mn-bubble { background: " + ACCENT + "; color: #fff; border-bottom-right-radius: 3px; }\n    .mn-meta { font-size: 10px; color: #9ca3af; margin-top: 3px; }\n    .mn-msg.user .mn-meta { text-align: right; }\n    #mn-chat-input-row {\n      display: flex; align-items: center; gap: 8px;\n      padding: 10px 12px; border-top: 0.5px solid #e5e7eb; background: #fafafa;\n    }\n    #mn-chat-input {\n      flex: 1; border: 0.5px solid #e5e7eb; border-radius: 20px;\n      padding: 8px 13px; font-size: 13px; outline: none; background: #fff;\n    }\n    #mn-chat-input:focus { border-color: " + ACCENT + "; }\n    #mn-chat-send {\n      width: 32px; height: 32px; border-radius: 50%;\n      background: " + ACCENT + "; border: none; cursor: pointer;\n      display: flex; align-items: center; justify-content: center; flex-shrink: 0;\n    }\n    #mn-chat-send svg { width: 15px; height: 15px; }\n    #mn-chat-footer {\n      text-align: center; font-size: 10px; color: #bbb;\n      padding: 5px; background: #fafafa; border-top: 0.5px solid #e5e7eb;\n    }\n    .mn-typing { display: flex; align-items: center; gap: 4px; padding: 8px 12px; background: #f3f4f6; border-radius: 12px; border-bottom-left-radius: 3px; width: fit-content; }\n    .mn-dot { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: mn-bounce 1.2s infinite; }\n    .mn-dot:nth-child(2) { animation-delay: 0.2s; }\n    .mn-dot:nth-child(3) { animation-delay: 0.4s; }\n    @keyframes mn-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }\n  ";
  document.head.appendChild(style);

  // Build HTML
  var widget = document.createElement("div");
  widget.id = "mn-chat-widget";
  widget.innerHTML = "\n    <div id=\"mn-chat-tooltip\">Stel een vraag</div>\n    <div id=\"mn-chat-popup\">\n      <div id=\"mn-chat-header\">\n        <div class=\"mn-avatar\">MN<div class=\"mn-online-dot\"></div></div>\n        <div>\n          <div class=\"mn-header-name\">" + SHOP + "</div>\n          <div class=\"mn-header-sub\">Klantservice &middot; &lt; 5 min reactie</div>\n        </div>\n        <button id=\"mn-chat-close\" aria-label=\"Sluit chat\">&times;</button>\n      </div>\n      <div id=\"mn-chat-messages\"></div>\n      <div id=\"mn-chat-input-row\">\n        <input id=\"mn-chat-input\" placeholder=\"Stel je vraag&hellip;\" />\n        <button id=\"mn-chat-send\" aria-label=\"Verstuur\">\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"></line>\n            <polygon points=\"22 2 15 22 11 13 2 9 22 2\"></polygon>\n          </svg>\n        </button>\n      </div>\n      <div id=\"mn-chat-footer\">" + SHOP + " live chat</div>\n    </div>\n    <button id=\"mn-chat-fab\" aria-label=\"Open chat\">\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"" + FAB_COLOR + "\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path>\n        <circle cx=\"9\" cy=\"10\" r=\"1\" fill=\"" + FAB_COLOR + "\"></circle>\n        <circle cx=\"12\" cy=\"10\" r=\"1\" fill=\"" + FAB_COLOR + "\"></circle>\n        <circle cx=\"15\" cy=\"10\" r=\"1\" fill=\"" + FAB_COLOR + "\"></circle>\n      </svg>\n      <div id=\"mn-chat-fab-badge\">1</div>\n    </button>\n  ";
  document.body.appendChild(widget);

  // State
  var isOpen = false;
  var sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  var db = null;
  var messagesRef = null;

  // Firebase init
  function initFirebase() {
    var script1 = document.createElement("script");
    script1.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
    script1.onload = function () {
      var script2 = document.createElement("script");
      script2.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
      script2.onload = function () {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.database();
        messagesRef = db.ref("chats/" + sessionId + "/messages");
        listenForAgentMessages();
        showGreeting();
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
  }

  function showGreeting() {
    addMessage("agent", GREETING, "Klantservice");
  }

  function listenForAgentMessages() {
    if (!messagesRef) return;
    messagesRef.on("child_added", function (snap) {
      var msg = snap.val();
      if (msg.role === "agent") {
        removeTyping();
        addMessage("agent", msg.text, "Klantservice");
      }
    });
  }

  function addMessage(role, text, sender) {
    var now = new Date();
    var t = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
    var container = document.getElementById("mn-chat-messages");
    var div = document.createElement("div");
    div.className = "mn-msg " + role;
    var meta = role === "agent" ? (sender + " &middot; " + t) : ("Jij &middot; " + t);
    div.innerHTML = '<div class="mn-bubble">' + text + '</div><div class="mn-meta">' + meta + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    var container = document.getElementById("mn-chat-messages");
    var div = document.createElement("div");
    div.className = "mn-msg agent";
    div.id = "mn-typing";
    div.innerHTML = '<div class="mn-typing"><div class="mn-dot"></div><div class="mn-dot"></div><div class="mn-dot"></div></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById("mn-typing");
    if (t) t.remove();
  }

  function sendMessage() {
    var input = document.getElementById("mn-chat-input");
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage("user", text, "");
    showTyping();
    if (messagesRef) {
      messagesRef.push({ role: "user", text: text, timestamp: Date.now() });
      db.ref("chats/" + sessionId).update({
        page: window.location.href,
        started: Date.now(),
        status: "open"
      });
    }
  }

  // Toggle
  document.getElementById("mn-chat-fab").addEventListener("click", function () {
    isOpen = !isOpen;
    var popup = document.getElementById("mn-chat-popup");
    var tooltip = document.getElementById("mn-chat-tooltip");
    var badge = document.getElementById("mn-chat-fab-badge");
    if (isOpen) {
      popup.classList.add("open");
      tooltip.style.display = "none";
      badge.style.display = "none";
    } else {
      popup.classList.remove("open");
    }
  });

  document.getElementById("mn-chat-close").addEventListener("click", function () {
    isOpen = false;
    document.getElementById("mn-chat-popup").classList.remove("open");
  });

  document.getElementById("mn-chat-send").addEventListener("click", sendMessage);
  document.getElementById("mn-chat-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  // Hide tooltip after 5s
  setTimeout(function () {
    var t = document.getElementById("mn-chat-tooltip");
    if (t) t.style.display = "none";
  }, 5000);

  initFirebase();
  } // einde init()
})();
