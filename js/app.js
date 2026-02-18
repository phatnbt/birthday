const CONFIG = {
  receiverName: "Bubuuu",
  senderName: "Tipii",
  typewriterText: "Chúc mừng sinh nhật, Bubu 💖",

  questions: [
    "Em có đồng ý nhận món quà này và cười thật tươi không? 😊",
    "Em có hứa sang tuổi mới sẽ chăm chỉ hơn và đi ngủ sớm không ? ✨",
    "Em có iu anh không? 💗"
  ],

  passText: "Pass rồi đó 😚💖",
  doneText: "Giỏi lắm anh biết em chọn đúng hết mà:)✨",

  letterText: [
    "Hôm nay là ngày đặc biệt, nên anh muốn gửi em một lá thư nhỏ.",
    "Đây là món quà đầu tiên anh tặng em.Tuy nó là món quà nhỏ nhưng mong em sẽ vui.",
    "Mong tuổi mới sẽ mang đến cho em thật nhiều niềm vui, sức khỏe và bình yên.",
    "Xinh đẹp, học giỏi và đạt được điểm mong muốn trong kì thi sắp tới.",
    "Chúc mừng sinh nhật nhé! Emiu 🎂✨"
  ].join("\n\n"),

  photos: [
    "assets/photos/1.jpg","assets/photos/2.jpg","assets/photos/3.jpg",
    "assets/photos/4.jpg","assets/photos/5.jpg","assets/photos/6.jpg",
    "assets/photos/7.jpg","assets/photos/8.jpg","assets/photos/9.jpg",
    "assets/photos/10.jpg","assets/photos/11.jpg","assets/photos/12.jpg",
  ]
};

const $ = (s) => document.querySelector(s);

// ===== Elements (có thể null, phải guard) =====
const bgm = $("#bgm");

const cakeIntro = $("#cakeIntro");
const btnNextIntro = $("#btnNextIntro");

const introOverlay = $("#introOverlay");
const btnEnter = $("#btnEnter");
const mainContent = $("#mainContent");

const typeEl = $("#typewriter");
const nameInline = $("#nameInline");
const nameBold = $("#nameBold");
const centerName = $("#centerName");

const btnLetter = $("#btnLetter");
const letterModal = $("#letterModal");
const envelope = $("#envelope");
const btnOpenEnvelope = $("#btnOpenEnvelope");
const btnCloseLetter = $("#btnCloseLetter");
const letterTo = $("#letterTo");
const letterFrom = $("#letterFrom");
const letterBody = $("#letterBody");
const paperDate = $("#paperDate");

const polaroidRain = $("#polaroidRain");
const photoModal = $("#photoModal");
const photoModalImg = $("#photoModalImg");

const threat = $("#threat");

const gameQuestion = $("#gameQuestion");
const gameArea = $("#gameArea");
const btnYes = $("#btnYes");
const btnNo = $("#btnNo");
const gameResult = $("#gameResult");
const qIndexEl = $("#qIndex");
const qScoreEl = $("#qScore");

let qIndex = 0;
let score = 0;
let threatTimer = null;

function applyThemeByHour(){
  const h = new Date().getHours();
  document.body.classList.remove("theme-morning","theme-afternoon","theme-night");
  if(h >= 6 && h < 12) document.body.classList.add("theme-morning");
  else if(h >= 12 && h < 18) document.body.classList.add("theme-afternoon");
  else document.body.classList.add("theme-night");
}

function setTextBasics(){
  if (nameInline) nameInline.textContent = CONFIG.receiverName;
  if (nameBold) nameBold.textContent = CONFIG.receiverName;
  if (centerName) centerName.textContent = CONFIG.receiverName;

  if (letterTo) letterTo.textContent = CONFIG.receiverName;
  if (letterFrom) letterFrom.textContent = CONFIG.senderName;

  if (paperDate){
    const d = new Date();
    paperDate.textContent = d.toLocaleDateString("vi-VN", { year:"numeric", month:"long", day:"numeric" });
  }

  CONFIG.typewriterText = CONFIG.typewriterText.replace("[Tên Người Nhận]", CONFIG.receiverName);
}

function typeWriter(text, el, speed=42){
  if (!el) return;
  el.textContent = "";
  let i = 0;
  const tick = () => {
    if(i < text.length){
      el.textContent += text.charAt(i++);
      setTimeout(tick, speed);
    }
  };
  tick();
}

function openModal(modal){
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(modal){
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}

function showIntro1(){
  if (introOverlay) introOverlay.style.display = "grid";
  window.party?.burst?.({ ms: 900, count: 80 });

  // bật fireworks trên intro 1 luôn
  const cleanName = CONFIG.receiverName.replace(/\[|\]/g, "").trim();
  const fwText = cleanName ? `HAPPY BIRTHDAY\n${cleanName}` : "HAPPY BIRTHDAY";
  window.fireworks?.start?.({ text: fwText, multi: true });

  // nổ thêm 1 lần cho nổi bật
  setTimeout(() => window.fireworks?.start?.({ text: fwText, multi: true }), 300);
}

function enterSite(){
  window.fireworks?.stop?.();
  if (introOverlay) introOverlay.style.display = "none";
  if (mainContent) mainContent.setAttribute("aria-hidden","false");
  // layout vòng trái tim SAU khi hiện trang (fix width/height = 0)
  setTimeout(() => {
    window.heartRing?.layout?.(CONFIG.photos);
    window.heartRing?.start?.();
  }, 60);


  window.party?.start?.();
  typeWriter(CONFIG.typewriterText, typeEl, 40);

  setTimeout(() => openLetterModalClosed(), 650);
  setTimeout(()=> window.party?.burst({ms:900, count:40}), 500);
}

/* ===== Letter ===== */
function resetLetterState(){
  if (envelope) envelope.classList.remove("open");
  if (letterBody) letterBody.textContent = "";
}
function openLetterModalClosed(){
  resetLetterState();
  openModal(letterModal);
}
function openEnvelopeAndType(){
  if(!envelope || !letterBody) return;
  if(envelope.classList.contains("open")) return;

  envelope.classList.add("open");

  // bật nhạc ở gesture
  if (bgm){
    bgm.volume = 0.75;
    bgm.play().catch(()=>{});
  }

  const text = CONFIG.letterText;
  let i = 0;

  setTimeout(() => {
    const tick = () => {
      if(i < text.length){
        letterBody.textContent += text.charAt(i++);
        setTimeout(tick, 18);
      }
    };
    tick();
  }, 1150);

  window.party?.burst?.({ms:1500, count:80});
}

/* ===== Polaroid ===== */
function openPhoto(src){
  if (!photoModalImg) return;
  photoModalImg.src = src;
  openModal(photoModal);
}
function spawnPolaroid(){
  if(!polaroidRain) return;

  const box = polaroidRain.getBoundingClientRect();

  // ✅ rơi theo cột để giảm đè
  const cols = box.width < 520 ? 2 : box.width < 900 ? 3 : 4;
  const colW = box.width / cols;
  const col = (Math.random() * cols) | 0;

  const pad = 26;
  const x = col * colW + pad + Math.random() * (colW - pad * 2);

  const rot = (Math.random()*18 - 9).toFixed(2) + "deg";

  // ✅ nhanh hơn 1 tí (9–13s)
  const dur = (9 + Math.random()*4).toFixed(2) + "s";

  const src = CONFIG.photos[(Math.random()*CONFIG.photos.length)|0];

  const card = document.createElement("div");
  card.className = "polaroid";
  card.style.left = `${x}px`;
  card.style.top = `-40px`;
  card.style.setProperty("--rot", rot);

  card.style.animation = `
    fall ${dur} cubic-bezier(.2,.75,.2,1) forwards,
    sway ${dur} ease-in-out forwards
  `;

  card.innerHTML = `<img src="${src}" alt="polaroid"><div class="cap">💗</div>`;
  card.addEventListener("click", () => openPhoto(src));
  polaroidRain.appendChild(card);

  // ✅ tính đáy theo chiều cao THẬT của thẻ (chuẩn 100%)
  requestAnimationFrame(() => {
    const box2 = polaroidRain.getBoundingClientRect();
    const realH = card.offsetHeight || 170;
    const endY = Math.max(40, box2.height - realH - 18); // chừa padding đáy
    card.style.setProperty("--dropEnd", `${endY}px`);
  });

  // ✅ giới hạn số card để ít đè
  const MAX_ON_SCREEN = 10;
  const all = polaroidRain.querySelectorAll(".polaroid");
  if (all.length > MAX_ON_SCREEN) all[0].remove();

  // ✅ KHÔNG xóa giữa chừng: luôn chờ rơi xong + nằm lại 4–6s
  const durMs = parseFloat(dur) * 1000;
  const keepMs = durMs + 4000 + Math.random()*2000;
  setTimeout(() => card.remove(), keepMs);
}


function startPolaroidRain(){
  // ✅ rơi thưa hơn để nhìn “sang” và ít đè
  setInterval(spawnPolaroid, 2100); // trước là 1200
}

/* ===== Threat ===== */
function showThreat(){
  if(!threat) return;
  threat.classList.add("show");
  threat.setAttribute("aria-hidden","false");
  clearTimeout(threatTimer);
  threatTimer = setTimeout(() => {
    threat.classList.remove("show");
    threat.setAttribute("aria-hidden","true");
  }, 1200);
}

/* ===== Quiz ===== */
function setQuestion(i){
  qIndex = i;
  if (gameQuestion) gameQuestion.textContent = CONFIG.questions[qIndex];
  if (qIndexEl) qIndexEl.textContent = String(qIndex + 1);
  if (qScoreEl) qScoreEl.textContent = String(score);
  if (gameResult) gameResult.textContent = "";
  if (btnNo){
    btnNo.style.left = "160px";
    btnNo.style.top  = "24px";
  }
}
function moveNoButton(){
  if(!gameArea || !btnNo) return;

  const area = gameArea.getBoundingClientRect();
  const btn = btnNo.getBoundingClientRect();
  const padding = 12;

  const maxX = Math.max(padding, area.width - btn.width - padding);
  const maxY = Math.max(padding, area.height - btn.height - padding);

  btnNo.style.left = `${padding + Math.random() * maxX}px`;
  btnNo.style.top  = `${padding + Math.random() * maxY}px`;
}
function onYes(){
  score += 1;
  if (qScoreEl) qScoreEl.textContent = String(score);
  window.party?.burst?.({ms:900, count:55});

  if(qIndex < CONFIG.questions.length - 1){
    if (gameResult) gameResult.textContent = "Đúng rồi 😚 (qua câu tiếp theo…)";
    setTimeout(() => setQuestion(qIndex + 1), 700);
  } else {
    if (gameResult) gameResult.textContent = `${CONFIG.passText} ${CONFIG.doneText}`;
    if (btnYes) btnYes.disabled = true;
    if (btnNo) { btnNo.disabled = true; btnNo.style.opacity = "0.55"; }
    if (btnYes) btnYes.style.opacity = "0.75";
    window.party?.burst?.({ms:2000, count:140});
  }
}
function setupQuiz(){
  setQuestion(0);

  if (btnNo){
    btnNo.addEventListener("mouseenter", moveNoButton);
    btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      moveNoButton();
      showThreat();
      window.party?.burst?.({ms:650, count:16});
    });
  }

  if (btnYes) btnYes.addEventListener("click", onYes);
}

/* ===== Close ===== */
function wireClose(){
  document.addEventListener("click", (e) => {
    const t = e.target;
    if(t?.dataset?.close === "letter") closeModal(letterModal);
    if(t?.dataset?.close === "photo") closeModal(photoModal);
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      closeModal(letterModal);
      closeModal(photoModal);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  applyThemeByHour();
  setTextBasics();

  if (mainContent) mainContent.setAttribute("aria-hidden","true");

  startPolaroidRain();
  setupQuiz();
  wireClose();

  // ==== Cake intro: chạy fireworks + confetti ====
  window.party?.start?.();
  window.fireworks?.start?.({ text: "HAPPY BIRTHDAY", multi: true });

  setTimeout(() => window.party?.burst?.({ ms: 1800, count: 160 }), 220);

  // next intro (guard null)
  if (btnNextIntro){
    btnNextIntro.addEventListener("click", () => {
      btnNextIntro.disabled = true;
      if (cakeIntro) cakeIntro.style.display = "none";

      window.fireworks?.stop?.();
      showIntro1();
      window.party?.burst?.({ ms: 1200, count: 90 });
    });
  } else {
    // nếu không có cake intro thì show luôn intro 1
    showIntro1();
  }

  // enter site
  if (btnEnter) btnEnter.addEventListener("click", enterSite);

  // letter buttons
  if (btnLetter) btnLetter.addEventListener("click", openLetterModalClosed);
  if (btnOpenEnvelope) btnOpenEnvelope.addEventListener("click", openEnvelopeAndType);
  if (btnCloseLetter) btnCloseLetter.addEventListener("click", () => closeModal(letterModal));
  
});
