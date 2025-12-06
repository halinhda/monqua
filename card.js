document.addEventListener("DOMContentLoaded", () => {

    /*==============================*/
    /* THAY ĐỔI FONT H1 */
    /*==============================*/
    const title = document.querySelector("h1");
    if (title) {
        title.style.fontFamily = "'Halimum', cursive";
        title.style.letterSpacing = "2px";   // giãn chữ nhẹ
        title.style.fontWeight = "normal";   // font script không dùng bold
    }

    /*==============================*/
    /* SLIDER ẢNH */
    /*==============================*/
    const slider = document.querySelector(".image-slider");
    const track = document.querySelector(".slider-track");
    if (slider && track) {
        slider.addEventListener("mousemove", (e) => {
            const rect = slider.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const percent = mouseX / rect.width;
            const maxShift = track.scrollWidth - slider.clientWidth;
            const moveX = -maxShift * percent;
            track.style.transform = `translateX(${moveX}px)`;
        });
    }

    /*==============================*/
    /* CANVAS HIỆU ỨNG TUYẾT & SAO */
    /*==============================*/
    const canvas = document.getElementById("snowStar");
    if (!canvas) {
        console.error("Không tìm thấy canvas #snowStar");
        return;
    }
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function randomColor() {
        return `hsl(${Math.floor(Math.random() * 360)}, 90%, 70%)`;
    }

    const particles = [];
    const total = 150;

    for (let i = 0; i < total; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            xs: (Math.random() * 0.6) - 0.3,
            ys: Math.random() * 1 + 0.5,
            a: Math.random() * 0.6 + 0.4,
            color: randomColor()
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let p of particles) {
            ctx.beginPath();
            ctx.globalAlpha = Math.min(p.a * 1.4, 1);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 18;
            ctx.shadowColor = p.color;
            ctx.arc(p.x, p.y, p.r + 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            p.x += p.xs;
            p.y += p.ys;
            if (p.y > canvas.height) p.y = -5;
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
        }
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    /*==============================*/
    /* VIEWER PHÓNG TO ẢNH */
    /*==============================*/
    const zoomViewer = document.getElementById("zoomViewer");
    const zoomImg = document.getElementById("zoomImg");
    let watcher = null;

    function startWatcher() {
        if (watcher) return;
        watcher = (e) => {
            if (!zoomViewer.classList.contains("active")) return;
            const rect = zoomImg.getBoundingClientRect();
            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
            if (!inside) {
                zoomViewer.classList.remove("active");
                stopWatcher();
            }
        };
        document.addEventListener("mousemove", watcher);
    }

    function stopWatcher() {
        if (!watcher) return;
        document.removeEventListener("mousemove", watcher);
        watcher = null;
    }

    document.querySelectorAll(".slider-track img").forEach(img => {
        img.addEventListener("mouseenter", () => {
            zoomImg.src = img.src;
            zoomViewer.classList.add("active");
            setTimeout(startWatcher, 10); // delay để bounding box ổn định
        });
    });

    zoomViewer.addEventListener("transitionstart", () => {
        if (zoomViewer.classList.contains("active")) startWatcher();
    });

    /*==============================*/
    /* BỨC THƯ LỜI CHÚC */
    /*==============================*/
    const openBtn = document.getElementById("openLetterBtn");
    const closeBtn = document.getElementById("closeLetter");
    const letterPopup = document.getElementById("letterPopup");
    const letterText = document.getElementById("letterText");
    const heartContainer = document.getElementById("heartContainer");
    const audio = document.getElementById("letterSound");

    const message = `
Chúc bạn luôn vui vẻ,
hạnh phúc và đầy năng lượng tích cực mỗi ngày! 💖

Bạn xứng đáng với tất cả những điều tốt đẹp nhất!
`;

    function createHearts() {
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement("div");
            heart.classList.add("heart");
            heart.style.left = Math.random() * 100 + "%";
            heart.style.animationDuration = 1 + Math.random() * 2 + "s";
            heartContainer.appendChild(heart);
            setTimeout(() => heart.remove(), 2000);
        }
    }

    if (openBtn && closeBtn && letterPopup && letterText) {

        // Mở thư
        // Mở thư
        openBtn.addEventListener("click", () => {
            if (videoOverlay && countdownVideo) {

                // 🎵 Buộc tắt nhạc nền khi hiện VIDEO
                const bgm = document.getElementById("bgm");
                if (bgm) {
                    bgm.pause();
                    bgm.currentTime = 0;
                }

                // Hiện popup thư
                letterPopup.classList.add("active");
                letterText.innerHTML = "";
                const lines = message.split("\n").filter(line => line.trim() !== "");
                lines.forEach((line, i) => {
                    const span = document.createElement("span");
                    span.textContent = line;
                    span.style.color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
                    span.style.animation = "typeShow 0.5s forwards";
                    span.style.animationDelay = (i * 0.25) + "s";
                    letterText.appendChild(span);
                });

                // Sticker tim
                const heartInterval = setInterval(createHearts, 300);
                letterPopup.dataset.heartInterval = heartInterval;

                // Phát nhạc riêng cho thư
                audio.currentTime = 0;
                audio.play().catch(() => { });
            }
        });


        // Mở thư với video đếm ngược
        const videoOverlay = document.getElementById("videoOverlay");
        const countdownVideo = document.getElementById("countdownVideo");

        openBtn.addEventListener("click", () => {
            if (videoOverlay && countdownVideo) {
                videoOverlay.style.display = "flex";
                countdownVideo.currentTime = 0;
                countdownVideo.play();

                countdownVideo.onended = () => {
                    videoOverlay.style.display = "none";
                    letterPopup.classList.add("active");
                    audio.currentTime = 0;
                    audio.play().catch(() => { });
                    showMessage();
                };
            }
        });

        // Đóng thư
        closeBtn.addEventListener("click", () => {
            letterPopup.classList.remove("active");
            audio.pause();
            audio.currentTime = 0;
            letterText.innerHTML = "";
            clearInterval(letterPopup.dataset.heartInterval);
        });

    } else {
        console.error("Một số element bức thư không tìm thấy. Kiểm tra ID trong HTML!");
    }

    //LOVE
    const loveBtn = document.getElementById("loveBtn");

    loveBtn.addEventListener("click", () => {
        window.location.href = "love.html";
    });

    //PHÁO HOA

});
