// ===== FLOATING HEARTS CANVAS (LAG-FREE OPTIMIZED) =====
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');

let heartsArray = [];
const heartCache = []; // Stores our pre-rendered, blurred heart textures

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 1. PRE-RENDER BLURRED HEARTS ONCE ---
function generateHeartCache() {
    const pinks = ['#ffccd5', '#ffb3c1', '#ff85a1', '#f8bbd0', '#ffe8f3'];
    
    // Generate 15 distinct heart templates with varying blurs and sizes
    for (let i = 0; i < 15; i++) {
        const cacheCanvas = document.createElement('canvas');
        const cacheCtx = cacheCanvas.getContext('2d');
        
        const size = Math.random() * 12 + 8; 
        const blurAmount = Math.random() * 4; 
        const color = pinks[Math.floor(Math.random() * pinks.length)];
        
        // Add padding around the canvas so the blur/glow filter doesn't get clipped at the edges
        const padding = blurAmount * 3 + 12;
        cacheCanvas.width = size + padding * 2;
        cacheCanvas.height = size + padding * 2;
        
        // Apply the expensive filters ONLY ONCE here
        cacheCtx.filter = `blur(${blurAmount}px)`;
        cacheCtx.fillStyle = color;
        cacheCtx.shadowBlur = 8;
        cacheCtx.shadowColor = color;
        
        // Draw the heart shape centered inside the cached canvas coordinate plane
        const cx = padding + size / 2;
        const cy = padding;
        const topCurveHeight = size * 0.3;
        
        cacheCtx.beginPath();
        cacheCtx.moveTo(cx, cy + topCurveHeight);
        cacheCtx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
        cacheCtx.bezierCurveTo(cx - size / 2, cy + (size + topCurveHeight) / 2, cx, cy + (size + topCurveHeight) / 2, cx, cy + size);
        cacheCtx.bezierCurveTo(cx, cy + (size + topCurveHeight) / 2, cx + size / 2, cy + (size + topCurveHeight) / 2, cx + size / 2, cy + topCurveHeight);
        cacheCtx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + topCurveHeight);
        cacheCtx.closePath();
        cacheCtx.fill();
        
        // Save this pre-rendered canvas item into our cache array
        heartCache.push({
            canvas: cacheCanvas,
            width: cacheCanvas.width,
            height: cacheCanvas.height
        });
    }
}

// --- 2. HEART PARTICLE LOGIC ---
class Heart {
    constructor() {
        // Assign a random pre-rendered image asset from our cache database
        this.cacheIndex = Math.floor(Math.random() * heartCache.length);
        this.reset(true); 
    }

    reset(initial = false) {
        const texture = heartCache[this.cacheIndex];
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + texture.height;
        
        this.speedY = Math.random() * 0.4 + 0.3; 
        this.speedX = (Math.random() - 0.5) * 0.2; 
        this.opacity = Math.random() * 0.4 + 0.2;
        
        this.swaySpeed = Math.random() * 0.01 + 0.005;
        this.swayOffset = Math.random() * Math.PI * 2;
    }

    draw() {
        const texture = heartCache[this.cacheIndex];
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // EXTREMELY FAST: Just stamping a pre-baked static graphic onto the screen
        ctx.drawImage(texture.canvas, this.x - texture.width / 2, this.y - texture.height / 2);
        
        ctx.restore();
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        this.swayOffset += this.swaySpeed;
        this.x += Math.sin(this.swayOffset) * 0.2;

        // Reset cleanly when out of bounds
        if (this.y < -50) {
            this.reset(false);
        }
    }
}

// --- 3. EXECUTION ---
generateHeartCache(); // Run cache system first

function initHearts() {
    heartsArray = [];
    const numberOfHearts = window.innerWidth < 480 ? 12 : 22; 
    for (let i = 0; i < numberOfHearts; i++) {
        heartsArray.push(new Heart());
    }
}

function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < heartsArray.length; i++) {
        heartsArray[i].update();
        heartsArray[i].draw();
    }
    requestAnimationFrame(animateHearts);
}

initHearts();
animateHearts();


// ===== GIFT OPENING INTERACTION =====
let isOpened = false;

function openGift() {
    if (isOpened) return; 
    isOpened = true;

    const gift3d = document.getElementById('gift3d');
    const lid = document.getElementById('lid');
    const openingScreen = document.getElementById('opening-screen');
    const nextScreen = document.getElementById('next-screen');

    gift3d.classList.add('opening');
    lid.classList.add('fly-off');

    setTimeout(() => {
        openingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            openingScreen.style.display = 'none'; 
            nextScreen.classList.add('visible');
            
            const firstInput = document.querySelector('.pin-input');
            if(firstInput) firstInput.focus();
        }, 800);

    }, 800); 
}

// ===== PIN INPUT LOGIC =====
const pinInputs = document.querySelectorAll('.pin-input');
pinInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1 && index < pinInputs.length - 1) {
            pinInputs[index + 1].focus();
        }
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
            pinInputs[index - 1].focus();
        }
    });
});