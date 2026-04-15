/**
 * meme-loan - 核心交互脚本
 * 功能：摄像头调用、动作模拟、音效生成、状态管理
 */

// ============ 音效生成（Web Audio API） ============
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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

function playError() {
  playBeep(200, 300, 'sawtooth');
}

// ============ 摄像头控制 ============
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
      audio: false
    });
    return stream;
  } catch (err) {
    console.error('摄像头启动失败:', err);
    throw err;
  }
}

function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// ============ 动作检测（模拟） ============
// 注意：真实的人脸/动作检测需要 TensorFlow.js 或 Face-api.js
// 这里用简单的定时器和随机数模拟"检测"过程
function simulateActionDetection() {
  return new Promise((resolve) => {
    const steps = [
      { name: 'detecting', duration: 1500, progress: 10 },
      { name: 'mouth_open', duration: 3000, progress: 30 },
      { name: 'head_shake', duration: 3000, progress: 50 },
      { name: 'blink', duration: 2500, progress: 70 },
      { name: 'analyzing', duration: 2000, progress: 90 }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current >= steps.length) {
        clearInterval(interval);
        resolve();
        return;
      }
      const step = steps[current];
      updateProgress(step.progress);
      updatePrompt(getPromptText(step.name));
      playRandomBeep();
      current++;
    }, 500); // 每0.5秒更新一次
  });
}

function getPromptText(action) {
  const prompts = {
    detecting: '📸 正在检测人脸...',
    mouth_open: '😱 请张大嘴巴，像被催收吓到一样',
    head_shake: '🙀 请用力摇头，表示"我没有网贷"',
    blink: '👁️ 请眨眨眼，证明你还清醒',
    analyzing: '⏳ 正在分析信用状况...'
  };
  return prompts[action] || '处理中...';
}

function updateProgress(percent) {
  const bar = document.getElementById('progress');
  const status = document.getElementById('status');
  if (bar) bar.style.width = percent + '%';
  if (status) status.textContent = `进度: ${percent}%`;
}

function updatePrompt(text) {
  const el = document.getElementById('prompt');
  if (el) el.innerHTML = text;
}

function playRandomBeep() {
  // 随机高频短音，模拟"滴滴"检测声
  const freq = 600 + Math.random() * 400;
  playBeep(freq, 50, 'square');
}

// ============ 主流程 ============
async function initFaceCheck() {
  const video = document.getElementById('video');
  const nextBtn = document.getElementById('nextBtn');

  try {
    // 1. 启动摄像头
    const stream = await startCamera();
    video.srcObject = stream;
    updatePrompt('📸 摄像头已启动，准备验证...');

    // 2. 等待视频流稳定
    await new Promise(r => setTimeout(r, 1000));

    // 3. 开始动作模拟检测
    await simulateActionDetection();

    // 4. 完成
    updatePrompt('✅ 验证通过！正在跳转...');
    playSuccess();
    nextBtn.classList.remove('hidden');

    // 5. 1秒后关闭摄像头（节省资源）
    setTimeout(() => stopCamera(stream), 1000);

  } catch (err) {
    updatePrompt('❌ 摄像头启动失败，请检查权限或使用 HTTPS');
    playError();
  }
}

// 页面加载后自动启动
window.addEventListener('DOMContentLoaded', () => {
  // 首次用户交互后才能播放音频（浏览器策略）
  document.body.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, { once: true });

  initFaceCheck();
});
