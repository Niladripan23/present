// ===== FLOATING HEARTS CANVAS (FIREFLY BOKEH) =====
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');

let heartsArray = [];
const heartCache = []; 

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function generateHeartCache() {
    const pinks = ['#ffccd5', '#ffb3c1', '#ff85a1', '#f8bbd0', '#ffe8f3'];
    for (let i = 0; i < 15; i++) {
        const cacheCanvas = document.createElement('canvas');
        const cacheCtx = cacheCanvas.getContext('2d');
        const size = Math.random() * 10 + 6; // Refined, smaller sizing
        const blurAmount = Math.random() * 3; 
        const color = pinks[Math.floor(Math.random() * pinks.length)];
        const padding = blurAmount * 3 + 12;
        cacheCanvas.width = size + padding * 2;
        cacheCanvas.height = size + padding * 2;
        
        cacheCtx.filter = `blur(${blurAmount}px)`;
        cacheCtx.fillStyle = color;
        cacheCtx.shadowBlur = 8;
        cacheCtx.shadowColor = color;
        
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
        
        heartCache.push({ canvas: cacheCanvas, width: cacheCanvas.width, height: cacheCanvas.height });
    }
}

class Heart {
    constructor() {
        this.cacheIndex = Math.floor(Math.random() * heartCache.length);
        this.reset(true); 
    }

    reset(initial = false) {
        const texture = heartCache[this.cacheIndex];
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + texture.height + 50;
        
        this.speedY = Math.random() * 0.3 + 0.2; 
        
        // Firefly swaying mechanics
        this.swaySpeed = Math.random() * 0.015 + 0.005;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.swayWidth = Math.random() * 0.5 + 0.2; 

        this.baseOpacity = Math.random() * 0.4 + 0.15;
        this.opacity = initial ? this.baseOpacity : 0; 
    }

    draw() {
        const texture = heartCache[this.cacheIndex];
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.drawImage(texture.canvas, this.x - texture.width / 2, this.y - texture.height / 2);
        ctx.restore();
    }

    update() {
        this.y -= this.speedY;
        
        // Elegant side-to-side firefly drift
        this.swayOffset += this.swaySpeed;
        this.x += Math.sin(this.swayOffset) * this.swayWidth;

        // Smooth fade in from bottom, fade out at top
        const fadeDistance = 150;
        let targetOpacity = this.baseOpacity;
        
        if (this.y < fadeDistance) {
            targetOpacity = this.baseOpacity * (this.y / fadeDistance); 
        } else if (canvas.height - this.y < fadeDistance) {
            targetOpacity = this.baseOpacity * ((canvas.height - this.y) / fadeDistance); 
        }
        
        this.opacity += (targetOpacity - this.opacity) * 0.05;

        if (this.y < -50) {
            this.reset(false);
        }
    }
}

generateHeartCache(); 

function initHearts() {
    heartsArray = [];
    const numberOfHearts = window.innerWidth < 480 ? 10 : 18; // Reduced quantity for elegance
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


// ===== UX NAVIGATION: OPEN, BACK & GESTURES =====
let isOpened = false;

function openGift() {
    if (isOpened) return; 
    isOpened = true;

    // Push state to browser history to enable back navigation
    history.pushState({ screen: 'password' }, '', '#password');

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

// Handle Browser Back Button
window.addEventListener('popstate', (e) => {
    if (isOpened) {
        closeGift();
    }
});

// Reversal animation logic
function closeGift() {
    isOpened = false;
    const gift3d = document.getElementById('gift3d');
    const lid = document.getElementById('lid');
    const openingScreen = document.getElementById('opening-screen');
    const nextScreen = document.getElementById('next-screen');

    nextScreen.classList.remove('visible');
    openingScreen.style.display = 'flex'; 
    
    setTimeout(() => {
        openingScreen.classList.remove('fade-out');
        gift3d.classList.remove('opening');
        lid.classList.remove('fly-off');
    }, 50); 
}

// Touch Gestures: Swipe Right to go Back
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    if (touchEndX - touchStartX > 80 && Math.abs(touchEndY - touchStartY) < 60) {
        if (isOpened) {
            history.back(); 
        }
    }
}, { passive: true });


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
