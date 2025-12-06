/* ===========================================================
   HPBD.JS — Unified script for:
     - index/hpbd.html (generator + snow + QR)
     - card.html (display card by occ param)
   Safe, robust, logs, supports occ/name/msg/music params
   =========================================================== */

(function () {
  "use strict";

  // -----------------
  // util logs (an toàn)
  // -----------------
  const LOG = (...args) => {
    try {
      console.log("%c[HPBD]", "color:#0fb;border-radius:3px;padding:2px 4px;", ...args);
    } catch (e) {
      console.log("[HPBD]", ...args);
    }
  };

  // Giải mã param an toàn (nếu đã decode thì trả về nguyên vẹn)
  function safeDecode(v) {
    if (!v) return "";
    try {
      return decodeURIComponent(v);
    } catch (e) {
      return v;
    }
  }

  // parse URL params (works for both pages)
  // Nếu vì lý do nào đó URLSearchParams ném lỗi, fallback thành empty URLSearchParams
  const URL_PARAMS = (() => {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      LOG("URLSearchParams init failed, using empty params", e);
      return new URLSearchParams();
    }
  })();

  // Lấy param với danh sách tên thay thế
  function param(name, altNames = []) {
    try {
      if (!(URL_PARAMS instanceof URLSearchParams)) return null;
      if (URL_PARAMS.has(name)) return URL_PARAMS.get(name);
      for (let a of altNames) if (URL_PARAMS.has(a)) return URL_PARAMS.get(a);
      return null;
    } catch (e) {
      LOG("param() error:", e);
      return null;
    }
  }

  // detect page mode: generator or card display
  const isGenerator = !!document.getElementById("generateBtn") || !!document.querySelector(".form-box");
  const isCard = !!document.getElementById("cardBirthday") || !!document.querySelector(".card-box");

  LOG("isGenerator:", isGenerator, "isCard:", isCard);

  /* -----------------------
     COMMON CONFIGS
     ----------------------- */
  const OCCASIONS = {
    birthday: { src: 'music/birthday.mp3', bg: '#ffdde1' },
    christmas: { src: 'music/christmas.mp3', bg: '#0d0d0d' },
    womensday: { src: 'music/womensday.mp3', bg: '#ffe6f0' },
    love: { src: 'music/love.mp3', bg: '#ff99bb' },
    midautumn: { src: 'music/midautumn.mp3', bg: '#3b1b00' }
  };

  /* ===============================
     PART A — Generator page logic
     =============================== */
  function runGenerator() {
    LOG("Init generator");

    // audio element
    const musicEl = document.getElementById("bgMusic");

    // initialize occasion select
    const occSelect = document.getElementById("occasionSelect");
    if (occSelect) {
      // set default if not present
      if (!occSelect.value) occSelect.value = "birthday";
      // initial set
      setOccasionUI(occSelect.value);
      occSelect.addEventListener("change", (e) => setOccasionUI(e.target.value));
    }

    // set occasion UI (music + background)
    function setOccasionUI(occ) {
      const o = OCCASIONS[occ];
      if (!o) return;
      if (musicEl && o.src) {
        // set audio src but do not force play on all browsers; attempt and swallow errors
        try {
          musicEl.src = o.src;
          musicEl.load();
          musicEl.play().catch(()=>{ /* autoplay blocked; user must press */ });
        } catch (e) {
          LOG("Error setting music source:", e);
        }
      }
      // set body background to simple color for clarity
      try { document.body.style.background = o.bg; } catch (e) { /* ignore */ }
    }

    // snow effect (lightweight)
    try {
      initSnowCanvas();
    } catch (e) {
      console.warn("Snow init failed:", e);
    }

    // QR generation
    const generateBtn = document.getElementById("generateBtn");
    const qrContainer = document.getElementById("qrContainer");
    const formBox = document.querySelector(".form-box");

    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        // read inputs
        const nameRaw = document.getElementById("nameInput")?.value || "";
        const msgRaw  = document.getElementById("msgInput")?.value  || "";
        const occVal  = (document.getElementById("occasionSelect")?.value) || "birthday";
        const musicSel = (document.getElementById("musicSelect")?.value) || "";

        const name = encodeURIComponent(nameRaw);
        const msg  = encodeURIComponent(msgRaw);
        const occ  = encodeURIComponent(occVal);

        // build card URL (use occ param)
        // ensure we produce a sensible path even if location.pathname ends with /
        const basePath = location.pathname.replace(/\/[^/]*$/, "") || "";
        const cardUrl = `${location.origin}${basePath}/card.html?name=${name}&msg=${msg}&occ=${occ}&music=${encodeURIComponent(musicSel)}`;

        // Clear old
        if (qrContainer) qrContainer.innerHTML = "";

        // create canvas and draw QR
        const qrCanvas = document.createElement("canvas");
        qrCanvas.setAttribute("aria-label", "qr-canvas");
        if (qrContainer) qrContainer.appendChild(qrCanvas);

        // back button
        const backBtn = document.createElement("button");
        backBtn.textContent = "🔙 Quay lại";
        backBtn.style.display = "block";
        backBtn.style.marginTop = "10px";
        backBtn.addEventListener("click", () => {
          if (qrContainer) qrContainer.innerHTML = "";
          if (formBox) formBox.style.display = "block";
        });
        if (qrContainer) qrContainer.appendChild(backBtn);

        // hide form
        if (formBox) formBox.style.display = "none";

        // create QR using library; if not present, fallback to link text
        if (window.QRCode && typeof QRCode.toCanvas === "function") {
          QRCode.toCanvas(qrCanvas, cardUrl, { width: 300 }, (err) => {
            if (err) {
              console.error("QRCode error:", err);
              // fallback show link
              const a = document.createElement("a");
              a.href = cardUrl;
              a.textContent = cardUrl;
              qrContainer.appendChild(a);
            }
          });
        } else {
          // fallback: create simple link
          const a = document.createElement("a");
          a.href = cardUrl;
          a.textContent = cardUrl;
          a.style.wordBreak = "break-all";
          if (qrContainer) qrContainer.appendChild(a);
          LOG("QRCode library missing — displayed plain link");
        }

        LOG("QR generated for:", cardUrl);
      });
    } else {
      LOG("generateBtn not found — skipping generator wiring");
    }

    // music toggle exposed globally so HTML onclick can use it
    window.toggleMusic = function() {
      const icon = document.getElementById("musicIcon");
      const btn  = document.querySelector(".music-player");
      if (!musicEl) return;
      if (musicEl.paused) {
        musicEl.play().catch(()=>{});
        if (icon) icon.textContent = "⏸";
        if (btn) btn.classList.add("playing");
      } else {
        musicEl.pause();
        if (icon) icon.textContent = "▶";
        if (btn) btn.classList.remove("playing");
      }
    };

    // snow canvas initializer
    function initSnowCanvas() {
      const canvas = document.getElementById("snowCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      // resize
      function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      resize();
      window.addEventListener("resize", resize);

      // create flakes
      const flakes = [];
      const N = 120;
      for (let i=0;i<N;i++){
        flakes.push({
          x: Math.random()*canvas.width,
          y: Math.random()*canvas.height,
          r: 1 + Math.random()*3,
          d: Math.random()*2,
          vx: 0, vy: 0
        });
      }

      let mouse = { x: null, y: null, radius: 80 };
      canvas.addEventListener("mousemove", (e)=> { mouse.x = e.clientX; mouse.y = e.clientY; });
      canvas.addEventListener("mouseleave", ()=> { mouse.x = null; mouse.y = null; });

      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        for (let f of flakes){
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
          ctx.fill();

          if (mouse.x !== null && mouse.y !== null){
            const dx = f.x - mouse.x, dy = f.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < mouse.radius){
              const force = (mouse.radius - dist) / mouse.radius;
              // protect against dist == 0
              const nx = dist === 0 ? 0.001 : dx/dist;
              const ny = dist === 0 ? 0.001 : dy/dist;
              f.vx += nx * force * 0.5;
              f.vy += ny * force * 0.5;
            }
          }

          f.y += Math.pow(f.d,1.5) + 0.5 + f.vy;
          f.x += Math.sin(f.y*0.01)*1.5 + f.vx;

          f.vx *= 0.92; f.vy *= 0.92;

          if (f.y > canvas.height){ f.y = 0; f.x = Math.random()*canvas.width; f.vx=0; f.vy=0; }
          if (f.x > canvas.width){ f.x = 0; f.y = Math.random()*canvas.height; f.vx=0; f.vy=0; }
          if (f.x < 0){ f.x = canvas.width; f.y = Math.random()*canvas.height; f.vx=0; f.vy=0; }
        }
        requestAnimationFrame(draw);
      }
      draw();
    }

  } // end runGenerator


  // =========================
  // PHẦN B — Logic hiển thị thiệp (card page)
  // =========================
  function runCard() {
    LOG("Init card display");

    // Lấy params từ URL: occ / occasion / type
    // Nếu không có thì mặc định là “birthday”
    const rawOcc = param("occ", ["occasion", "type"]) || "birthday";
    const occ = (typeof rawOcc === "string") ? rawOcc : "birthday";

    // Lấy tên & lời chúc từ URL
    const rawName = param("name") || "";
    const rawMsg = param("msg") || "";
    const name = safeDecode(rawName); // giải mã text để không bị lỗi ký tự
    const msg = safeDecode(rawMsg);

    LOG("card params:", { occ, name, msg });

    // MAP các loại thiệp với id trong HTML
    // Phải trùng với id bạn đặt trong file HTML
    const CARD_MAP = {
      birthday: { id: "cardBirthday", nameID: "nameBirthday", msgID: "msgBirthday" },
      christmas: { id: "cardChristmas", nameID: "nameChristmas", msgID: "msgChristmas" },
      womensday: { id: "cardWomens", nameID: "nameWomens", msgID: "msgWomens" },
      love: { id: "cardLove", nameID: "nameLove", msgID: "msgLove" },
      midautumn: { id: "cardMidautumn", nameID: "nameMidautumn", msgID: "msgMidautumn" }
    };

    // Ẩn toàn bộ các thiệp (nếu có trong DOM)
    Object.values(CARD_MAP).forEach(c => {
      const el = document.getElementById(c.id);
      if (el) el.style.display = "none";
    });

    // Chọn loại thiệp đúng theo param occ
    const cardDef = CARD_MAP[occ] || CARD_MAP["birthday"];
    const elCard = document.getElementById(cardDef.id);

    // Nếu không tìm thấy card tương ứng → fallback sang birthday
    if (!elCard) {
      LOG("Không tìm thấy card theo occ:", occ, " - fallback birthday");
      const fb = document.getElementById(CARD_MAP["birthday"].id);
      if (fb) fb.style.display = "block";
      return;
    }

    // Gán tên & lời chúc vào thiệp
    const elName = document.getElementById(cardDef.nameID);
    const elMsg = document.getElementById(cardDef.msgID);
    if (elName) elName.innerText = name;
    if (elMsg) elMsg.innerText = msg;

    // Animation xuất hiện nhẹ
    elCard.style.display = "block";
    elCard.style.opacity = "0";
    elCard.style.transform = "translateY(8px)";

    setTimeout(() => {
      elCard.style.transition = "opacity 700ms ease, transform 700ms ease";
      elCard.style.opacity = "1";
      elCard.style.transform = "translateY(0)";
    }, 40);

    // ======== Nhạc nền =================
    const musicEl = document.getElementById("bgMusic");

    if (musicEl) {
      const musicParam = param("music", []);
      const musicKey = musicParam || occ; // ưu tiên param music, nếu không có dùng occ

      const m = OCCASIONS[musicKey] || OCCASIONS[occ];

      // Nếu có nhạc → load + play
      if (m && m.src) {
        musicEl.src = m.src;
        musicEl.load();

        musicEl.play().catch(() => {
          // Autoplay bị chặn (trình duyệt bắt yêu cầu user tương tác)
          LOG("Autoplay blocked — user cần bấm play");
        });
      }
    }

    // ======== Theme nền theo loại thiệp =========
    const theme = OCCASIONS[occ];
    if (theme)
      document.body.style.background = theme.bg || document.body.style.background;

  } // hết runCard()



  // ===========================
  // Boot — chạy khi HTML load xong
  // ===========================
  document.addEventListener("DOMContentLoaded", () => {
    try {
      if (isGenerator) runGenerator(); // chạy trang generator
      if (isCard) runCard();           // chạy trang thiệp

      // Nếu không phải 2 loại trang trên → script đứng im
      if (!isGenerator && !isCard) {
        LOG("Không có generator hoặc card - script loaded nhưng không chạy.");
      }
    } catch (err) {
      console.error("HPBD main error:", err);
    }
  });

})();
