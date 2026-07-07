/* ==========================================================================
   JYOTI ELECTRICALS - COMING SOON PAGE LOGIC
   Theme: Electric Red & Midnight Tech
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==================================================
    // STATE MANAGEMENT & VARIABLES
    // ==================================================
    let isPowerOn = false;
    const htmlEl = document.documentElement;
    const breaker = document.getElementById('main-breaker');
    const statusDisplay = document.getElementById('status-display');
    const voltDisplay = document.getElementById('volt-display');
    const freqDisplay = document.getElementById('freq-display');
    const panelMessage = document.getElementById('panel-message');
    const canvas = document.getElementById('circuit-canvas');
    const ctx = canvas.getContext('2d');

    // ==================================================
    // SOUND EFFECTS (Web Audio API Synthesizer)
    // ==================================================
    let audioCtx = null;
    let mainHumGain = null;
    let humOscillator = null;
    let subHumOscillator = null;

    function initAudio() {
        if (audioCtx) return;
        // Create audio context
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();

        // Create main gain node for the continuous hum
        mainHumGain = audioCtx.createGain();
        mainHumGain.gain.setValueAtTime(0, audioCtx.currentTime);
        mainHumGain.connect(audioCtx.destination);
    }

    function playZapSound() {
        if (!audioCtx) initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // Spark 1: Short White Noise burst for the crisp "snap"
        const bufferSize = audioCtx.sampleRate * 0.08; // 80ms buffer
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1000;
        noiseFilter.Q.value = 2;

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noiseNode.start(now);

        // Spark 2: Frequency Sweep oscillator for the high-voltage "pop"
        const sweepOsc = audioCtx.createOscillator();
        const sweepGain = audioCtx.createGain();
        
        sweepOsc.type = 'sawtooth';
        sweepOsc.frequency.setValueAtTime(800, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        const sweepFilter = audioCtx.createBiquadFilter();
        sweepFilter.type = 'lowpass';
        sweepFilter.frequency.setValueAtTime(1200, now);
        sweepFilter.frequency.exponentialRampToValueAtTime(200, now + 0.15);

        sweepGain.gain.setValueAtTime(0.4, now);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        sweepOsc.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(audioCtx.destination);
        
        sweepOsc.start(now);
        sweepOsc.stop(now + 0.16);
    }

    function startPowerHum() {
        if (!audioCtx) initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // Clean up old oscillators if they exist
        stopPowerHum(true);

        // 1. Core 50Hz Sine Hum (Grid frequency)
        humOscillator = audioCtx.createOscillator();
        humOscillator.type = 'sine';
        humOscillator.frequency.setValueAtTime(30, now); // start lower
        humOscillator.frequency.exponentialRampToValueAtTime(50, now + 1.2); // sweep up to 50Hz

        // 2. Gritty 100Hz Triangle Hum (First harmonic / transformer vibration)
        subHumOscillator = audioCtx.createOscillator();
        subHumOscillator.type = 'triangle';
        subHumOscillator.frequency.setValueAtTime(60, now);
        subHumOscillator.frequency.exponentialRampToValueAtTime(100, now + 1.2);

        // Sub hum gain (mix of textures)
        const subGain = audioCtx.createGain();
        subGain.gain.value = 0.4;

        // Connect sources to main gain node
        humOscillator.connect(mainHumGain);
        subHumOscillator.connect(subGain);
        subGain.connect(mainHumGain);

        // Power up fade-in volume
        mainHumGain.gain.cancelScheduledValues(now);
        mainHumGain.gain.setValueAtTime(0, now);
        mainHumGain.gain.linearRampToValueAtTime(0.12, now + 1.2); // rise to comfortable operational volume

        // Start oscillators
        humOscillator.start(now);
        subHumOscillator.start(now);
    }

    function stopPowerHum(immediate = false) {
        if (!audioCtx || !mainHumGain) return;

        const now = audioCtx.currentTime;

        if (immediate) {
            mainHumGain.gain.cancelScheduledValues(now);
            mainHumGain.gain.setValueAtTime(0, now);
            try {
                if (humOscillator) humOscillator.stop();
                if (subHumOscillator) subHumOscillator.stop();
            } catch(e) {}
            return;
        }

        // Power down fade-out and sweep-down frequency
        if (humOscillator && subHumOscillator) {
            humOscillator.frequency.cancelScheduledValues(now);
            subHumOscillator.frequency.cancelScheduledValues(now);
            humOscillator.frequency.exponentialRampToValueAtTime(25, now + 0.8);
            subHumOscillator.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        }

        mainHumGain.gain.cancelScheduledValues(now);
        mainHumGain.gain.setValueAtTime(mainHumGain.gain.value, now);
        mainHumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        // Store references to stop them after fade out
        const oldHum = humOscillator;
        const oldSub = subHumOscillator;
        setTimeout(() => {
            try {
                if (oldHum) oldHum.stop();
                if (oldSub) oldSub.stop();
            } catch(e) {}
        }, 850);
    }

    // ==================================================
    // BREAKER INTERACTION
    // ==================================================
    breaker.addEventListener('click', () => {
        isPowerOn = !isPowerOn;

        if (isPowerOn) {
            // Power ON routine
            htmlEl.classList.remove('grid-offline');
            htmlEl.classList.add('grid-online');
            
            // Trigger Audio zap & hum
            playZapSound();
            setTimeout(startPowerHum, 80);

            // Update Panel Readings
            statusDisplay.textContent = "GRID STATUS: ONLINE (LOAD STABLE)";
            panelMessage.textContent = "MAIN GRID ENERGIZED. ALL OUTLETS ACTIVE.";
            
            animateCounterValues(24, 238, 1200, (val) => {
                voltDisplay.textContent = Math.round(val) + "V AC (OPER)";
            });

            animateCounterValues(0, 50.1, 1200, (val) => {
                freqDisplay.textContent = val.toFixed(1) + " Hz";
            });

            // Re-draw canvas with intense flow
            currentPulseSpawnRate = 0.12;
            maxParticles = 120;

        } else {
            // Power OFF routine
            htmlEl.classList.remove('grid-online');
            htmlEl.classList.add('grid-offline');
            
            // Fade out audio hum
            playZapSound();
            stopPowerHum();

            // Reset Panel Readings
            statusDisplay.textContent = "GRID STATUS: OFFLINE (STANDBY)";
            panelMessage.textContent = "SYSTEM OFFLINE. FLIP MAIN BREAKER TO ENERGIZE SYSTEM.";

            animateCounterValues(238, 24, 800, (val) => {
                voltDisplay.textContent = Math.round(val) + "V AC (STBY)";
            });

            animateCounterValues(50.1, 0, 800, (val) => {
                freqDisplay.textContent = val.toFixed(1) + " Hz";
            });

            // Set background canvas back to sleep mode
            currentPulseSpawnRate = 0.01;
            maxParticles = 15;
            sparkParticles.length = 0; // Clear any leftover sparks
        }
    });

    // Tech count-up/down helper
    function animateCounterValues(start, end, duration, onUpdate) {
        const startTime = performance.now();
        
        function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out quad
            const ease = progress * (2 - progress);
            const currentVal = start + (end - start) * ease;
            onUpdate(currentVal);
            
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);
    }


    // ==================================================
    // COUNTDOWN CLOCK
    // ==================================================
    // Set launch date to 30 days from current date
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);
    launchDate.setHours(9, 0, 0, 0); // 9:00 AM launch

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = launchDate.getTime() - now;

        if (difference <= 0) {
            document.getElementById('days').textContent = "00";
            document.getElementById('hours').textContent = "00";
            document.getElementById('minutes').textContent = "00";
            document.getElementById('seconds').textContent = "00";
            return;
        }

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = d.toString().padStart(2, '0');
        document.getElementById('hours').textContent = h.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = m.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = s.toString().padStart(2, '0');
    }

    // Run clock once and then start interval
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // ==================================================
    // NEWSLETTER SUBSCRIPTION
    // ==================================================
    const form = document.getElementById('subscribe-form');
    const feedback = document.getElementById('form-feedback');
    const btnSubscribe = document.getElementById('btn-subscribe');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!isPowerOn) {
            feedback.className = "feedback-msg error";
            feedback.textContent = "TRANSMISSION FAILED: GRID OFFLINE. FLIP SWITCH TO INITIALIZE TERMINAL.";
            return;
        }

        const email = document.getElementById('subscriber-email').value;
        if (!email) return;

        btnSubscribe.disabled = true;
        const originalBtnText = btnSubscribe.innerHTML;
        btnSubscribe.innerHTML = '<span>CONNECTING...</span>';
        feedback.textContent = "";

        // Simulate server register request
        setTimeout(() => {
            feedback.className = "feedback-msg success";
            feedback.textContent = `SUCCESS: EMAIL ENCRYPTED AND CONNECTED TO DIGITAL GRID.`;
            document.getElementById('subscriber-email').value = "";
            btnSubscribe.disabled = false;
            btnSubscribe.innerHTML = originalBtnText;

            // Trigger minor "sound alert"
            if (audioCtx) {
                const now = audioCtx.currentTime;
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.frequency.setValueAtTime(523.25, now); // C5
                noteOsc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                noteGain.gain.setValueAtTime(0.08, now);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                noteOsc.start(now);
                noteOsc.stop(now + 0.3);
            }
        }, 1200);
    });


    // ==================================================
    // INTERACTIVE CANVAS CIRCUIT BOARD ANIMATION
    // ==================================================
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const circuitNodes = [];
    const circuitTraces = [];
    const activePulses = [];
    const sparkParticles = [];
    
    let currentPulseSpawnRate = 0.015; // Slow standby rate
    let maxParticles = 15;
    let mousePos = { x: -1000, y: -1000, active: false };

    // Handle Window Resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        buildCircuitGrid();
    });

    // Trace Mouse Coordinates
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
        mousePos.active = true;

        // Spawn spark particles if grid is online
        if (isPowerOn && Math.random() < 0.35) {
            spawnSparks(mousePos.x, mousePos.y, 3);
        }
    });

    window.addEventListener('mouseleave', () => {
        mousePos.active = false;
    });

    // Card Hover Glow Effect
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Sparks creator
    function spawnSparks(x, y, count) {
        for (let i = 0; i < count; i++) {
            if (sparkParticles.length >= 150) sparkParticles.shift(); // Cap array size
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            sparkParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // slight upward float
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: 1 + Math.random() * 2
            });
        }
    }

    // Grid layout generator
    function buildCircuitGrid() {
        circuitNodes.length = 0;
        circuitTraces.length = 0;
        activePulses.length = 0;

        const cols = Math.floor(width / 160) + 1;
        const rows = Math.floor(height / 140) + 1;

        // 1. Create strategic coordinate nodes
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                // Add jitter to make it look organic, yet grid-aligned
                const x = c * 160 + (Math.random() * 40 - 20) + 40;
                const y = r * 140 + (Math.random() * 40 - 20) + 40;
                
                circuitNodes.push({
                    x: Math.max(10, Math.min(width - 10, x)),
                    y: Math.max(10, Math.min(height - 10, y)),
                    radius: 2.5 + Math.random() * 2,
                    neighbors: [],
                    brightness: 0.15
                });
            }
        }

        // 2. Connect nodes to construct trace lines (PCB layout style)
        for (let i = 0; i < circuitNodes.length; i++) {
            const nodeA = circuitNodes[i];
            
            // Connect to nearby nodes to form structured traces
            const candidates = circuitNodes
                .map((node, index) => ({ index, dist: Math.hypot(node.x - nodeA.x, node.y - nodeA.y) }))
                .filter(item => item.dist > 0 && item.dist < 220)
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 3); // max 3 connections per node to keep it readable

            candidates.forEach(cand => {
                const nodeB = circuitNodes[cand.index];
                
                // Avoid duplicates
                const exists = circuitTraces.some(t => 
                    (t.from === nodeA && t.to === nodeB) || (t.from === nodeB && t.to === nodeA)
                );

                if (!exists) {
                    // Create path with classic PCB traces:
                    // Horizontal/Vertical or 45-degree angle bends
                    const points = [nodeA];
                    
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;

                    if (Math.abs(dx) > 30 && Math.abs(dy) > 30) {
                        // Bend needed
                        const midX = nodeA.x + (dx > 0 ? Math.abs(dy) * Math.sign(dx) : -Math.abs(dy) * Math.sign(dx));
                        points.push({ x: midX, y: nodeB.y });
                    }
                    
                    points.push(nodeB);

                    circuitTraces.push({
                        from: nodeA,
                        to: nodeB,
                        points: points,
                        length: points.reduce((acc, p, idx) => {
                            if (idx === 0) return 0;
                            return acc + Math.hypot(p.x - points[idx-1].x, p.y - points[idx-1].y);
                        }, 0)
                    });

                    nodeA.neighbors.push(nodeB);
                    nodeB.neighbors.push(nodeA);
                }
            });
        }
    }

    // Pulse flow along lines
    function spawnCurrentPulse() {
        if (circuitTraces.length === 0) return;
        
        // Pick a random trace
        const trace = circuitTraces[Math.floor(Math.random() * circuitTraces.length)];
        
        activePulses.push({
            trace: trace,
            progress: 0,
            speed: 1.2 + Math.random() * 1.8,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }

    // Initialize Grid Setup
    buildCircuitGrid();

    // ==================================================
    // ANIMATION LOOP
    // ==================================================
    function animate() {
        requestAnimationFrame(animate);

        // Clear Canvas with subtle fade trail
        ctx.fillStyle = isPowerOn ? 'rgba(7, 8, 9, 0.22)' : 'rgba(7, 8, 9, 0.4)';
        ctx.fillRect(0, 0, width, height);

        // 1. Draw static background PCB traces
        ctx.lineWidth = 1;
        
        circuitTraces.forEach(trace => {
            ctx.beginPath();
            ctx.moveTo(trace.points[0].x, trace.points[0].y);
            for (let i = 1; i < trace.points.length; i++) {
                ctx.lineTo(trace.points[i].x, trace.points[i].y);
            }
            
            if (isPowerOn) {
                // Online glow state
                ctx.strokeStyle = 'rgba(255, 46, 46, 0.08)';
            } else {
                // Standby state
                ctx.strokeStyle = 'rgba(255, 46, 46, 0.015)';
            }
            ctx.stroke();
        });

        // 2. Spawn current pulses dynamically
        if (activePulses.length < maxParticles && Math.random() < currentPulseSpawnRate) {
            spawnCurrentPulse();
        }

        // 3. Draw & update current pulses
        for (let i = activePulses.length - 1; i >= 0; i--) {
            const p = activePulses[i];
            p.progress += p.speed;

            if (p.progress >= p.trace.length) {
                activePulses.splice(i, 1);
                continue;
            }

            // Find current interpolated coordinate on the path points
            const coord = getPointOnPath(p.trace.points, p.progress, p.direction === 1);
            
            // Draw flowing dot
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, isPowerOn ? 2.2 : 1.2, 0, Math.PI * 2);
            
            if (isPowerOn) {
                ctx.fillStyle = 'rgba(255, 46, 46, 0.85)';
                ctx.shadowColor = '#ff2e2e';
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = 'rgba(255, 46, 46, 0.15)';
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
        }

        // 4. Draw node terminals (circuits intersections)
        circuitNodes.forEach(node => {
            const dx = node.x - mousePos.x;
            const dy = node.y - mousePos.y;
            const dist = Math.hypot(dx, dy);

            // Node interaction
            if (isPowerOn && dist < 120 && mousePos.active) {
                node.brightness = Math.max(node.brightness, 0.9 - (dist / 120) * 0.7);
                
                // Draw magnetic field arc connecting to mouse
                if (Math.random() < 0.08) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    // organic arc
                    const cx = (node.x + mousePos.x) / 2 + (Math.random() * 20 - 10);
                    const cy = (node.y + mousePos.y) / 2 + (Math.random() * 20 - 10);
                    ctx.quadraticCurveTo(cx, cy, mousePos.x, mousePos.y);
                    ctx.strokeStyle = `rgba(255, 46, 46, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            } else {
                // decay brightness to baseline
                node.brightness += (0.15 - node.brightness) * 0.05;
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

            if (isPowerOn) {
                ctx.fillStyle = `rgba(255, 46, 46, ${node.brightness})`;
                ctx.strokeStyle = `rgba(255, 46, 46, ${node.brightness * 0.5})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            } else {
                ctx.fillStyle = `rgba(255, 46, 46, ${node.brightness * 0.15})`;
            }
            ctx.fill();
        });

        // 5. Draw mouse sparks
        if (isPowerOn) {
            for (let i = sparkParticles.length - 1; i >= 0; i--) {
                const sp = sparkParticles[i];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.life -= sp.decay;

                if (sp.life <= 0) {
                    sparkParticles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 46, 46, ${sp.life})`;
                ctx.shadowColor = '#ff2e2e';
                ctx.shadowBlur = 4;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    // Helper to calculate exact coordinates along a multi-point path segment
    function getPointOnPath(points, distance, forwards) {
        const localPoints = forwards ? points : [...points].reverse();
        
        let remaining = distance;
        for (let i = 0; i < localPoints.length - 1; i++) {
            const p1 = localPoints[i];
            const p2 = localPoints[i+1];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

            if (remaining <= dist) {
                const ratio = remaining / dist;
                return {
                    x: p1.x + (p2.x - p1.x) * ratio,
                    y: p1.y + (p2.y - p1.y) * ratio
                };
            }
            remaining -= dist;
        }

        // Return end point if overflow
        return {
            x: localPoints[localPoints.length - 1].x,
            y: localPoints[localPoints.length - 1].y
        };
    }

    // Fire off loop
    animate();

});
