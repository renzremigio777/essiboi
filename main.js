document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const playBtn = document.getElementById('playBtn')
  let hue = 0;

  setInterval(() => {
    hue = (hue + 2) % 360;
    body.style.setProperty('--hue', `${hue}deg`);
  }, 100);



  // Fireflies
  const canvas = document.getElementById("fireflies");
  canvas.width = canvas.parentNode.clientWidth
  canvas.height = canvas.parentNode.clientHeight
  const ctx = canvas.getContext("2d");


  const fireflies = [];
  for (let i = 0; i < 100; i++) {
    createFireFly()
  }
  function createFireFly() {
    fireflies.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      size:(Math.random() + 0.4) * 1,
      vx: (Math.random() - 0.5) * 0.5, // horizontal speed
      vy: (Math.random() + 0.5) * 1  // vertical speed
    });
  }

  function updateFirefly(f) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.shadowColor = "white";   // glow color
    ctx.shadowBlur = 20;   
    ctx.fill();
  }

  function animateFireflies() {
    fireflies.forEach(f => {
      f.x += f.vx;
      f.y -= f.vy;
      if (f.y < 0) {
        fireflies.splice(fireflies.indexOf(f), 1)
        createFireFly()
      }
      updateFirefly(f);
    });
  }

  // Audio
  const audio = document.getElementById("audio")
  audio.volume = 0.1; 
  // Create Audio Context
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioSrc = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  audioSrc.connect(analyser);
  analyser.connect(audioCtx.destination);

  // Configure analyser
  // analyser.fftSize = 256;
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount /8;
  const dataArray = new Uint8Array(bufferLength);

  const sampleRate = audioCtx.sampleRate; 
  const fftSize = analyser.fftSize;
  const bassStart = 20; // Hz
  const bassEnd = 250;  // Hz
  const startBin = Math.floor(bassStart * fftSize / sampleRate);
  const endBin = Math.floor(bassEnd * fftSize / sampleRate);

  const img = new Image();        // create an image object
  img.src = 'speaker.png';  // set the source
  img.crossOrigin = "anonymous";  // needed if from another domain

  console.log(audio)
  const playBtnOffsetTop = playBtn.offsetTop
  const playBtnWidth = playBtn.offsetWidth
  const playBtnHeight = playBtn.offsetHeight
  // SoundBars
  function animateSoundBar() {
    if (audio.paused || audio.ended || audio.currentTime == 0) return;
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    let count = 0;

    for (let i = startBin; i <= endBin; i++) {
      sum += dataArray[i];
      count++;
    }
    const bassIntensity = sum / count; // 0–255
    
    // play button animation
    let buttonPosY = Math.floor(playBtnOffsetTop * (bassIntensity) / 100)
    let buttonWidth = Math.floor(playBtnWidth * (bassIntensity) / 100)
    let buttonHeight = Math.floor(playBtnHeight * (bassIntensity) / 100)
    if(buttonPosY > playBtnOffsetTop) {
      if (buttonPosY > 200) {
        buttonPosY = 200 - Math.random() * 10
      }
      playBtn.style.top = `${ buttonPosY}px`
      playBtn.style.width = `${buttonWidth}px`
      playBtn.style.height = `${buttonHeight}px`
    }
    
    const barWidth = (canvas.width / bufferLength);
    let barHeight;
    let x = 0;
  
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * 0.5 ;
      const hsl = `hsl(${hue}, 50%, 50%)`;

      ctx.fillStyle = hsl;
      ctx.shadowColor = hsl; 
      ctx.shadowBlur = 5; 
      // ctx.fillRect(x, 100, barWidth, barHeight);
      // ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      const y = ((canvas.height - barHeight) / 2) - (canvas.height / 2.30);
      console.log(y)
      ctx.fillRect(x, y, barWidth, barHeight);
      x += barWidth + 1;
    }
  }



  function animate(time = 0) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    animateFireflies();

    animateSoundBar();
  }

  animate()

  playBtn.addEventListener('click', () => {
    const audio1 = document.getElementById("audio")
    audio1.play().catch(err => console.error(err));
  });
});