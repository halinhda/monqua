window.addEventListener('load', () => {

    // ================= Audio logic =================
    const music = document.getElementById("bgMusic");
    music.play().catch(() => {});

    window.toggleMusic = function() {
        const icon = document.getElementById("musicIcon");
        const btn  = document.querySelector(".music-player");

        if (music.paused) {
            icon.textContent = "⏸";
            btn.classList.add("playing");
            music.play().catch(()=>{});
        } else {
            music.pause();
            icon.textContent = "▶";
            btn.classList.remove("playing");
        }
    }

    // ================= Snow effect =================
    const canvas = document.getElementById("snowCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const snowflakes = [];
    const numFlakes = 150;
    for(let i=0;i<numFlakes;i++){
        snowflakes.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            r: Math.random()*3+1,
            d: Math.random()*2
        });
    }

    function drawSnow(){
        ctx.fillStyle = "white";
        for(let i=0;i<numFlakes;i++){
            const f = snowflakes[i];
            ctx.beginPath();
            ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
            ctx.fill();
            f.y += Math.pow(f.d,1.5)+0.5;
            f.x += Math.sin(f.y*0.01)*1.5;
            if(f.y>canvas.height){
                f.y = 0;
                f.x = Math.random()*canvas.width;
            }
        }
    }

    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawSnow();
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', ()=>{
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // ================= QR code =================
    const btnGenerate = document.getElementById('generateBtn');
    const formBox = document.querySelector('.form-box');
    const qrContainer = document.getElementById('qrContainer');

    btnGenerate.addEventListener('click', () => {
        const name = encodeURIComponent(document.getElementById("nameInput").value.trim());
        const msg  = encodeURIComponent(document.getElementById("msgInput").value.trim());
        if(!name && !msg){
            alert("Hãy nhập tên hoặc lời chúc!");
            return;
        }
        const url = `card.html?name=${name}&msg=${msg}`;

        // Clear previous QR
        qrContainer.innerHTML = '';

        // Tạo QR canvas
        const qrCanvas = document.createElement('canvas');
        qrContainer.appendChild(qrCanvas);

        // Tạo QR
        QRCode.toCanvas(qrCanvas, url, {width:350}, function(error){
            if(error) console.error(error);
        });

        // Ẩn form
        formBox.style.display = 'none';

        // Nút quay lại
        const backBtn = document.createElement('button');
        backBtn.textContent = '🔙 Quay lại';
        backBtn.style.marginTop = '15px';
        backBtn.onclick = () => {
            qrContainer.innerHTML = '';
            formBox.style.display = 'block';
        };
        qrContainer.appendChild(backBtn);
    });

});
