(() => {
  const ring = document.getElementById("heartRing");
  if (!ring) return;

  // ====== CONFIG ======
  const TARGET_COUNT = 12;         // 12 tấm (đổi số nếu muốn)
  const ROT_SPEED = 0.22;          // rad/s (giảm để xoay chậm hơn)
  const DEPTH_Z = 170;             // độ "3D" (px) - tăng để nổi hơn
  const DEPTH_BLUR = 2.6;          // blur tối đa cho tấm ở xa
  const DEPTH_SCALE_MIN = 0.76;    // scale nhỏ nhất
  const DEPTH_SCALE_MAX = 1.14;    // scale lớn nhất

  let photos = [];
  let items = [];
  let raf = 0;
  let running = true;

  let rot = 0;
  let last = performance.now();

  const rand = (a, b) => a + Math.random() * (b - a);

  // Heart curve
  function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return { x, y };
  }

  function build(list) {
    photos = (list || []).filter(Boolean);
    ring.innerHTML = "";
    items = [];

    const n = TARGET_COUNT;

    for (let i = 0; i < n; i++) {
      const src = photos.length ? photos[i % photos.length] : "";
      const el = document.createElement("div");
      el.className = "heart-item";
      el.style.setProperty("--tilt", `${rand(-10, 10).toFixed(2)}deg`);
      el.dataset.idx = String(i);

      el.innerHTML = `
        <img src="${src}" alt="photo">
        <div class="cap">💗</div>
      `;

      el.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("heart:open", { detail: { src } }));
      });
      el.addEventListener("pointerdown", () => {
        el.classList.add("is-peek");
        clearTimeout(el.__peekTimer);
        el.__peekTimer = setTimeout(() => el.classList.remove("is-peek"), 650);
      });


      ring.appendChild(el);
      items.push(el);
    }

    requestAnimationFrame(() => renderFrame(0));
    start();
  }

  function renderFrame() {
    const w = ring.clientWidth;
    const h = ring.clientHeight;
    if (w < 80 || h < 80 || !items.length) return;

    const sx = w / 46;
    const sy = h / 46;

    const n = items.length;

    for (let i = 0; i < n; i++) {
      const base = (i / n) * Math.PI * 2;
      const t = base + rot;

      const p = heartPoint(t);

      const x = p.x * sx * 1.30;
      const y = -p.y * sy * 1.30;

      // depth 0..1 -> tấm trước rõ, tấm sau mờ
      const depth = (Math.sin(t) + 1) / 2;
      const z = (depth - 0.5) * DEPTH_Z;

      const s = DEPTH_SCALE_MIN + depth * (DEPTH_SCALE_MAX - DEPTH_SCALE_MIN);
      const blur = (1 - depth) * DEPTH_BLUR;

      const ry = (Math.cos(t) * 18).toFixed(2) + "deg";

      const el = items[i];
      el.style.setProperty("--x", `${x.toFixed(2)}px`);
      el.style.setProperty("--y", `${y.toFixed(2)}px`);
      el.style.setProperty("--zpx", `${z.toFixed(2)}px`);
      el.style.setProperty("--s", `${s.toFixed(3)}`);
      el.style.setProperty("--blur", `${blur.toFixed(2)}px`);
      el.style.setProperty("--op", `${(0.60 + depth * 0.40).toFixed(3)}`);
      el.style.setProperty("--ry", ry);

      el.style.zIndex = String(Math.floor(10 + depth * 500));
      el.classList.toggle("is-front", depth > 0.78);
    }
  }

  function tick(now) {
    if (!running) {
      raf = 0;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    rot += ROT_SPEED * dt;
    renderFrame();

    raf = requestAnimationFrame(tick);
  }

  function start() {
    running = true;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener("resize", () => renderFrame(), { passive: true });

  // expose
  window.heartRing = { layout: build, start, stop };
})();
