window.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // LẤY THÔNG TIN TỪ URL PARAMS
    // ==============================
    const params = new URLSearchParams(window.location.search);

    // Lấy tên từ URL (?name=...) hoặc mặc định là "Bạn thân yêu"
    const name = decodeURIComponent(params.get("name") || "Bạn thân yêu");
    // Lấy lời chúc từ URL (?msg=...) hoặc mặc định là câu chúc sẵn
    const msg  = decodeURIComponent(params.get("msg")  || "Chúc bạn một ngày thật tuyệt vời và tràn đầy hạnh phúc! ✨");
    // Lấy ảnh từ URL (?img=...) hoặc mặc định là ảnh "tho.jpg"
    const photoURL = params.get("img") || "anh/tho.jpg";
    // Lấy nhạc từ URL (?music=...) hoặc mặc định là file nhạc
    const musicURL = params.get("music") || "music/chirstmishansara.mp3";

    // Gắn dữ liệu lấy được vào các phần tử HTML
    document.getElementById("wishName").innerText = name;
    document.getElementById("wishMsg").innerText  = msg;
    document.getElementById("photo").src = photoURL;

    // ==============================
    // PHÁT NHẠC (có nút bật/tắt)
    // ==============================
    const bgMusic  = document.getElementById("bgMusic");
    const musicBtn = document.getElementById("musicBtn"); // nút icon 🔊/🔇
    bgMusic.src = musicURL;

    // Cho phép phát nhạc sau click đầu tiên (bỏ chặn autoplay)
    document.body.addEventListener("click", () => {
        bgMusic.play().catch(()=>{  
            console.warn("Nhạc không phát được, cần tương tác người dùng.");  
        });
    }, {once:true});

    // Toggle nhạc khi bấm vào nút loa
    musicBtn.addEventListener("click", () => {
        if(bgMusic.paused){
            bgMusic.play();
            musicBtn.innerText = "🔊"; // icon loa bật
        } else {
            bgMusic.pause();
            musicBtn.innerText = "🔇"; // icon loa tắt
        }
    });

    // ==============================
    // ĐẾM NGƯỢC + HIỂN THỊ NỘI DUNG
    // ==============================
    let count = 3; // bắt đầu từ 3 giây
    const countdownEl = document.getElementById("countdown");
    const contentEl = document.querySelector(".content");

    const interval = setInterval(()=>{
        // 1. Hiển thị số hiện tại (kể cả số 0)
        countdownEl.innerText = count;
        countdownEl.style.transform = "translate(-50%, -50%) scale(1.3)";
        setTimeout(()=>{ countdownEl.style.transform = "translate(-50%, -50%) scale(1)"; }, 300);
        
        // 2. Khi count <= 0 thì dừng đếm ngược
        if(count <= 0){
            clearInterval(interval);
            countdownEl.style.display="none"; // ẩn số đếm
            contentEl.classList.add("show");  // hiện nội dung chính

            // Hiệu ứng gõ chữ cho lời chúc
            const wishMsgEl = document.getElementById("wishMsg");
            const fullText = wishMsgEl.innerText;
            wishMsgEl.innerText = "";
            wishMsgEl.classList.add("typing");

            let idx = 0;
            const typer = setInterval(()=>{
                wishMsgEl.innerText = fullText.slice(0, idx);
                idx++;
                if(idx>fullText.length){
                    clearInterval(typer);
                    wishMsgEl.classList.remove("typing");
                }
            }, 40); // tốc độ gõ chữ
            return; 
        }
        
        // 3. Giảm biến đếm sau khi hiển thị
        count--; 
    },1000); // mỗi giây

    // ==============================
    // HIỆU ỨNG TUYẾT + TƯƠNG TÁC CHUỘT
    // ==============================
    const canvas = document.getElementById("snowCanvas");
    const ctx = canvas.getContext("2d");

    // Resize canvas cho khớp kích thước cửa sổ
    function resizeCanvas(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Tạo mảng bông tuyết
    const flakes = [];
    for(let i=0;i<180;i++){
        flakes.push({ 
            x:Math.random()*canvas.width, 
            y:Math.random()*canvas.height, 
            r:Math.random()*3+1, 
            d:Math.random()*2, 
            vx:0, vy:0 
        });
    }

    // Lưu vị trí chuột để tạo lực đẩy
    const mouse = { x:null, y:null, radius:150 };
    canvas.addEventListener("mousemove", e=>{
        // lấy tọa độ chuột trong canvas
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", ()=>{
        mouse.x = null;
        mouse.y = null;
    });

    function drawSnow(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";

        for(let f of flakes){
            // Vẽ bông tuyết
            ctx.beginPath();
            ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
            ctx.fill();

            // Nếu chuột gần bông tuyết thì tạo lực đẩy
            if(mouse.x!==null && mouse.y!==null){
                let dx = f.x - mouse.x;
                let dy = f.y - mouse.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if(dist < mouse.radius && dist > 0){
                    let force = (mouse.radius - dist) / mouse.radius;
                    f.vx += (dx/dist) * force * 50; // lực mạnh hơn
                    f.vy += (dy/dist) * force * 50;
                }
            }

            // Cập nhật vị trí bông tuyết
            f.y += Math.pow(f.d,1.3) + 0.3 + f.vy;
            f.x += Math.sin(f.y*0.01)*1 + f.vx;

            // Giảm dần lực
            f.vx *= 0.9; 
            f.vy *= 0.9;

            // Reset khi rơi quá màn hình
            if(f.y > canvas.height) {
                f.y = -5;
                f.x = Math.random() * canvas.width;
            }
        }

        // Vẽ vòng tròn vùng ảnh hưởng quanh chuột
        if(mouse.x!==null && mouse.y!==null){
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI*2);
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.stroke();
        }

        requestAnimationFrame(drawSnow);
    }
    drawSnow();


    //=========
    // TỰ HỌC JS THÊM Ở ĐÂY NẾU MUỐN
    //=========
    

        // ==============================
        // KẾT THÚC
        // ==============================
});