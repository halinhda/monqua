window.addEventListener('load', () => {
    const music = document.getElementById("bgMusic");
    music.play().catch(()=>{});

    window.toggleMusic = function() {
        const icon = document.getElementById("musicIcon");
        const btn  = document.querySelector(".music-player");
        if (music.paused) {
            icon.textContent = "⏸"; btn.classList.add("playing"); music.play().catch(()=>{});
        } else {
            music.pause(); icon.textContent = "▶"; btn.classList.remove("playing");
        }
    }

    // Snow effect
    const canvas = document.getElementById("snowCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const snowflakes = [];
    for(let i=0;i<150;i++){
        snowflakes.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            r: Math.random()*3+1,
            d: Math.random()*2
        });
    }

    function drawSnow(){
        ctx.fillStyle = "white";
        for(let f of snowflakes){
            ctx.beginPath();
            ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
            ctx.fill();
            f.y += Math.pow(f.d,1.5)+0.5;
            f.x += Math.sin(f.y*0.01)*1.5;
            if(f.y>canvas.height){ f.y=0; f.x=Math.random()*canvas.width; }
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

    // QR code
    const generateBtn = document.getElementById("generateBtn");
    const formBox = document.querySelector(".form-box");
    const qrContainer = document.getElementById("qrContainer");

    generateBtn.addEventListener('click', ()=>{
        const name = encodeURIComponent(document.getElementById("nameInput").value);
        const msg  = encodeURIComponent(document.getElementById("msgInput").value);
        const url = `https://halinhda.github.io/monqua/card.html?name=${name}&msg=${msg}`;

        qrContainer.innerHTML = '';

        const qrCanvas = document.createElement('canvas');
        qrContainer.appendChild(qrCanvas);

        const backBtn = document.createElement('button');
        backBtn.textContent = '🔙 Quay lại';
        backBtn.style.marginTop = '10px';
        backBtn.onclick = ()=>{ qrContainer.innerHTML=''; formBox.style.display='block'; };
        qrContainer.appendChild(backBtn);

        formBox.style.display = 'none';

        QRCode.toCanvas(qrCanvas, url, {width:300}, function(err){ if(err) console.error(err); });
    });
});
