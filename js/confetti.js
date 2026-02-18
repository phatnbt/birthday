(() => {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  let W, H, raf = null;
  const pieces = [];
  let running = false;
  let lastSpawn = 0;

  function resize(){
    const dpr = devicePixelRatio || 1;
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(1,0,0,1,0,0);
  }
  window.addEventListener("resize", resize, {passive:true});
  resize();

  const colors = ["#ffd6e7","#d9d7ff","#c8f1ff","#fff1b6","#d7ffd9","#ffffff"];
  const rand = (a,b)=>Math.random()*(b-a)+a;
  const pick = (arr)=>arr[(Math.random()*arr.length)|0];

  function spawn(count=8){
    const dpr = devicePixelRatio || 1;
    for(let i=0;i<count;i++){
      pieces.push({
        x: rand(0, W),
        y: rand(-H*0.1, 0),
        w: rand(6, 12) * dpr,
        h: rand(8, 16) * dpr,
        vx: rand(-0.28, 0.28) * dpr,
        vy: rand(1.2, 2.2) * dpr,
        rot: rand(0, Math.PI*2),
        vr: rand(-0.025, 0.025),
        color: pick(colors),
        alpha: rand(0.35, 0.65)
      });
    }
  }

  function step(ts){
    ctx.clearRect(0,0,W,H);

    // spawn nhẹ theo thời gian (nền ngầm)
    if(ts - lastSpawn > 220){
      spawn(6);
      lastSpawn = ts;
      // giới hạn số hạt để không rối
      if(pieces.length > 220) pieces.splice(0, pieces.length - 220);
    }

    for(let i=pieces.length-1;i>=0;i--){
      const p = pieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();

      if(p.y > H + 40) pieces.splice(i,1);
    }

    if(running) raf = requestAnimationFrame(step);
  }

  function start(){
    if(running) return;
    running = true;
    raf = requestAnimationFrame(step);
  }

  function burst({ms=1400, count=80} = {}){
    // burst mạnh (khi cần)
    spawn(count);
    const prev = pieces.length;
    setTimeout(() => {
      // giảm alpha sau burst cho sạch
      for(let i=Math.max(0, prev - count); i<pieces.length; i++){
        pieces[i].alpha = Math.min(pieces[i].alpha, 0.55);
      }
    }, ms);
  }

  window.party = { start, burst };
})();
