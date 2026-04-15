/**
 * meme-loan - 核心交互脚本（明亮版）
 * 功能：纯动画模拟 + 音效生成 + 状态管理
 * 不依赖摄像头，纯前端交互
 */

// ============ 音效生成（Web Audio API） ============
const audioCtx = new (window.AudioContext || window.webkitAudioContext)());

function playBeep(freq = 800, duration = 100, type = 'sine') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration/1000);
  osc.stop(audioCtx.currentTime + duration/1000);
}

function playSuccess() {
  [523, 659, 784].forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 200, 'square'), i * 150);
  });
}

// ============ 动作序列配置 ============
const actions = [
  { text: '📸 正在检测人脸...', icon: '📸', face: '😊', progress: 10, duration: 1200 },
  { text: '😱 请张大嘴巴，像被催收吓到一样', icon: '😱', face: '😮', progress: 30, duration: 2500 },
  { text: '🙀 请用力摇头，表示"我没有网贷"', icon: '🙀', face: '😵', progress: 50, duration: 2500 },
  { text: '👁️ 请眨眨眼，证明你还清醒', icon: '👁️', face: '😉', progress: 70, duration: 2000 },
  { text: '⏳ 正在分析信用状况...', icon: '💭', face: '🤔', progress: 90, duration: 1500 },
  { text: '✅ 验证通过！', icon: '✅', face: '😎', progress: 100, duration: 1000 }
];

let currentAction = 0;

// ============ UI 更新函数 ============
function updateUI(action) {
  const promptEl = document.getElementById('prompt');
  const actionIcon = document.getElementById('actionIcon');
  const faceIcon = document.getElementById('faceIcon');
  const progressEl = document.getElementById('progress');
  const statusEl = document.getElementById('status');
  const scanLine = document.getElementById('scanLine');

  if (promptEl) promptEl.textContent = action.text;
  if (actionIcon) actionIcon.textContent = action.icon;
  if (faceIcon) faceIcon.textContent = action.face;
  if (progressEl) progressEl.style.width = action.progress + '%';
  if (statusEl) statusEl.textContent = `进度: ${action.progress}%`;

  // 扫描线显示控制（20%-80% 进度显示）
  if (scanLine) {
    if (action.progress >= 20 && action.progress <= 80) {
      scanLine.classList.remove('hidden');
    } else {
      scanLine.classList.add('hidden');
    }
  }

  // 随机音效（模拟检测声）
  if (action.progress > 0 && action.progress < 100) {
    const freq = 600 + Math.random() * 400;
    playBeep(freq, 50, 'square');
  }
}

// ============ 动作序列执行 ============
function runActionSequence() {
  if (currentAction >= actions.length) {
    finishCheck();
    return;
  }

  const action = actions[currentAction];
  updateUI(action);
  currentAction++;

  setTimeout(runActionSequence, action.duration);
}

// ============ 完成处理 ============
function finishCheck() {
  const promptEl = document.getElementById('prompt');
  const actionIcon = document.getElementById('actionIcon');
  const nextBtn = document.getElementById('nextBtn');
  const scanLine = document.getElementById('scanLine');

  if (promptEl) promptEl.innerHTML = '<span class="text-success">🎉 验证通过！正在跳转...</span>';
  if (actionIcon) actionIcon.classList.add('hidden');
  if (scanLine) scanLine.classList.add('hidden');
  if (nextBtn) nextBtn.classList.remove('hidden');

  playSuccess();

  // 3秒后自动跳转
  setTimeout(() => {
    window.location.href = 'result.html';
  }, 3000);
}

// ============ 初始化 ============
window.addEventListener('DOMContentLoaded', () => {
  // 首次用户交互后恢复音频上下文
  document.body.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, { once: true });

  // 延迟启动，让用户先看到页面
  setTimeout(runActionSequence, 500);
});
