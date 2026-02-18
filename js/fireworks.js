(() => {
  const canvas = document.getElementById("fireworks");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0, H = 0, DPR = 1;
  let running = false;
  let raf = 0;

  const rockets = [];
  const sparks = [];

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function resize() {
    DPR = clamp(window.devicePixelRatio || 1, 1, 2);
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  function clear() {
    ctx.clearRect(0, 0, W, H);
  }

  function addRocket(opts = {}) {
    const x = opts.x ?? rand(W * 0.15, W * 0.85);
    const y = H + rand(20, 60);
    const targetY = opts.targetY ?? rand(H * 0.12, H * 0.44);
    const vx = opts.vx ?? rand(-0.7, 0.7);
    const vy = opts.vy ?? rand(-12.0, -9.2);
    const hue = opts.hue ?? rand(0, 360);

    rockets.push({ x, y, vx, vy, targetY, hue, trail: [] });
  }

  function explode(x, y, hue, power = 1) {
    const count = Math.floor(rand(64, 110) * power);
    const base = rand(2.6, 4.3) * power;

    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2) * (i / count) + rand(-0.06, 0.06);
      const sp = base * rand(0.65, 1.35);

      sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: rand(0.08, 0.14),
        drag: rand(0.985, 0.992),
        hue: hue + rand(-16, 16),
        alpha: 1,
        decay: rand(0.009, 0.016),
        size: rand(1.2, 2.4)
      });
    }
  }

  // ===== TEXT EXPLOSION =====
  function textExplosion(text = "HAPPY BIRTHDAY") {
    const off = document.createElement("canvas");
    const octx = off.getContext("2d");

    const fontSize = Math.floor(Math.min(W, 900) / 10);
    off.width = Math.floor(W * 0.92);
    off.height = Math.floor(fontSize * 2.2);

    octx.clearRect(0, 0, off.width, off.height);
    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.font = `900 ${fontSize}px system-ui, Segoe UI, Arial`;

    // glow for text mask
    octx.shadowColor = "rgba(255,255,255,.9)";
    octx.shadowBlur = 18;
    octx.fillText(text, off.width / 2, off.height / 2);

    const img = octx.getImageData(0, 0, off.width, off.height).data;

    const step = Math.max(4, Math.floor(fontSize / 14)); // density
    const baseX = (W - off.width) / 2;
    const baseY = H * 0.30;

    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        const a = img[(y * off.width + x) * 4 + 3];
        if (a > 18) {
          const px = baseX + x;
          const py = baseY + y;
          const hue = rand(0, 360);
          const ang = rand(0, Math.PI * 2);
          const sp = rand(1.2, 3.2);

          sparks.push({
            x: px,
            y: py,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            g: rand(0.02, 0.06),
            drag: rand(0.986, 0.994),
            hue,
            alpha: 1,
            decay: rand(0.010, 0.018),
            size: rand(1.0, 2.0)
          });
        }
      }
    }
  }

  let t = 0;
  let lastTextBurst = 0;
  let multi = true;
  let msg = "HAPPY BIRTHDAY";

  function step() {
    if (!running) return;
    raf = requestAnimationFrame(step);
    t++;

    // fade background for trails
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0, 0, W, H);

    // multi-layer fireworks
    if (multi) {
      if (Math.random() < 0.09) addRocket();
      if (Math.random() < 0.05) addRocket({ x: rand(W*0.20, W*0.80), targetY: rand(H*0.10, H*0.28), vy: rand(-13.5,-11.5) });
      if (Math.random() < 0.04) addRocket({ x: rand(W*0.10, W*0.90), targetY: rand(H*0.28, H*0.46), vy: rand(-11.5,-9.2) });
    } else {
      if (Math.random() < 0.06) addRocket();
    }

    // text burst every ~2.6s (only on cake intro)
    if (t - lastTextBurst > 160) {
      lastTextBurst = t;
      textExplosion(msg);
    }

    // rockets update
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];

      r.vy += 0.09;
      r.x += r.vx;
      r.y += r.vy;

      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 18) r.trail.shift();

      // draw trail
      for (let k = 0; k < r.trail.length; k++) {
        const p = r.trail[k];
        const a = (k / r.trail.length) * 0.55;
        ctx.fillStyle = `hsla(${r.hue},95%,70%,${a})`;
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      // draw head
      ctx.fillStyle = `hsla(${r.hue},95%,75%,0.95)`;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.3, 0, Math.PI * 2);
      ctx.fill();

      if (r.y <= r.targetY || r.vy >= -1.6) {
        explode(r.x, r.y, r.hue, rand(0.9, 1.25));
        rockets.splice(i, 1);
      }

      if (r.x < -80 || r.x > W + 80 || r.y > H + 120) rockets.splice(i, 1);
    }

    // sparks update
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.vx *= s.drag;
      s.vy *= s.drag;
      s.vy += s.g;

      s.x += s.vx;
      s.y += s.vy;

      s.alpha -= s.decay;

      ctx.fillStyle = `hsla(${s.hue},95%,72%,${Math.max(0, s.alpha)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() < 0.35) {
        ctx.fillStyle = `hsla(${s.hue},95%,78%,${Math.max(0, s.alpha) * 0.35})`;
        ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
      }

      if (s.alpha <= 0 || s.x < -120 || s.x > W + 120 || s.y > H + 180) {
        sparks.splice(i, 1);
      }
    }
  }

  function start(opts = {}) {
    msg = opts.text || "HAPPY BIRTHDAY";
    multi = opts.multi !== false;

    if (running) return;
    running = true;
    clear();
    // dark base for glow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, W, H);

    // kickstart bursts
    for (let i = 0; i < 3; i++) addRocket({ targetY: rand(H*0.12, H*0.36), vy: rand(-13.0,-10.5) });
    textExplosion(msg);

    t = 0;
    lastTextBurst = 0;
    step();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    rockets.length = 0;
    sparks.length = 0;
    clear();
  }

  window.fireworks = { start, stop, resize };
})();
