/* ===========================================================
   HPBD.JS — FULL VERSION (LONG, CLEAN, PRO STRUCTURE)
   Project: Multi-Occasion Greeting Generator
   Author: Linn ✦ ChatGPT Dev Team
   =========================================================== */

// GLOBAL =====================================================
console.log("%c[HPBD] JS Loaded Successfully!", "color:#00ffaa;font-weight:bold;");

window.addEventListener("DOMContentLoaded", () => {

    /* -------------------------------------------------------
       SECTION 1 — PARSE URL PARAMETERS
    --------------------------------------------------------*/
    const params = new URLSearchParams(window.location.search);

    const occ  = params.get("occ") || "birthday";
    const name = decodeURIComponent(params.get("name") || "");
    const msg  = decodeURIComponent(params.get("msg")  || "");

    console.log("%c[PARAMS] occ=" + occ, "color:#ffcc00");
    console.log("[PARAMS] name=", name);
    console.log("[PARAMS] msg =", msg);


    /* -------------------------------------------------------
       SECTION 2 — CARD DEFINITIONS
       Chỉ cần add thêm dịp là chạy auto
    --------------------------------------------------------*/
    const CARD_MAP = {
        birthday:   { id: "cardBirthday",   nameID: "nameBirthday",   msgID: "msgBirthday" },
        christmas:  { id: "cardChristmas",  nameID: "nameChristmas",  msgID: "msgChristmas" },
        womensday:  { id: "cardWomens",     nameID: "nameWomens",     msgID: "msgWomens" },
        love:       { id: "cardLove",       nameID: "nameLove",       msgID: "msgLove" },
        midautumn:  { id: "cardMidautumn",  nameID: "nameMidautumn",  msgID: "msgMidautumn" }
    };

    const allCards = Object.values(CARD_MAP).map(c => c.id);


    /* -------------------------------------------------------
       SECTION 3 — HIDE ALL CARDS
    --------------------------------------------------------*/
    function hideAllCards() {
        allCards.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = "none";
                el.style.opacity = "0";
            }
        });
    }

    hideAllCards();


    /* -------------------------------------------------------
       SECTION 4 — SHOW CARD WITH ANIMATION
    --------------------------------------------------------*/
    function showCardAnimated(cardID, nameID, msgID) {
        const card = document.getElementById(cardID);

        if (!card) {
            console.error("[ERROR] Card không tồn tại:", cardID);
            return;
        }

        // Set name + msg
        document.getElementById(nameID).innerText = name;
        document.getElementById(msgID).innerText  = msg;

        // Hiện card
        card.style.display = "block";

        // Animation
        setTimeout(() => {
            card.style.transition = "opacity 0.8s ease, transform 0.8s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 30);
    }


    /* -------------------------------------------------------
       SECTION 5 — OCCASION HANDLER
    --------------------------------------------------------*/
    function renderOccasion(occKey) {
        console.log("%c[OCCASION] Rendering: " + occKey, "color:#00ddff;font-weight:bold;");

        const card = CARD_MAP[occKey] || CARD_MAP["birthday"];

        showCardAnimated(card.id, card.nameID, card.msgID);
    }

    renderOccasion(occ);


    /* -------------------------------------------------------
       SECTION 6 — OPTIONAL: THEMES FOR EACH CARD
    --------------------------------------------------------*/
    const OCC_THEMES = {
        birthday:   "#ffdde1",
        christmas:  "#0d0d0d",
        womensday:  "#ffe6f0",
        love:       "#ff99bb",
        midautumn:  "#3b1b00"
    };

    function applyTheme() {
        const bg = OCC_THEMES[occ] || OCC_THEMES["birthday"];
        document.body.style.background = bg;
    }

    applyTheme();


    /* -------------------------------------------------------
       SECTION 7 — OPTIONAL: MUSIC AUTO PLAY (Nếu cần)
    --------------------------------------------------------*/
    const music = document.getElementById("bgMusic");
    if (music) {
        const musicKey = params.get("music") || occ;

        const MUSIC_MAP = {
            birthday:   "music/birthday.mp3",
            christmas:  "music/christmas.mp3",
            womensday:  "music/womensday.mp3",
            love:       "music/love.mp3",
            midautumn:  "music/midautumn.mp3"
        };

        if (MUSIC_MAP[musicKey]) {
            music.src = MUSIC_MAP[musicKey];

            music.play().catch(() => {
                console.warn("[AUDIO] Không autoplay được, phải bấm user gesture.");
            });
        }
    }


    /* -------------------------------------------------------
       SECTION 8 — LOG DEBUG
    --------------------------------------------------------*/
    console.log("%c[DONE] Thiệp đã render đúng!", "color:#00ff88;font-weight:bold;");

});
