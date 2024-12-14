const colors = [
  "#FF0000", // 빨간색
  "#006400", // 진한 초록색
  "#FFD700", // 금색
  "#C0C0C0", // 은색
  "#800000", // 마룬색
  "#228B22", // 포레스트 그린
  "#8B0000", // 다크레드
  "#DAA520", // 골든로드
  "#CD853F", // 페루색
  "#B8860B", // 다크골든로드
  "#556B2F", // 다크올리브그린
  "#8B4513", // 새들브라운
  "#A52A2A", // 브라운
  "#D2691E", // 초콜릿색
  "#BC8F8F", // 로지브라운
  "#D2B48C", // 탄색
  "#DEB887", // 버블우드
  "#F4A460", // 샌디브라운
  "#E9967A", // 다크샐몬
  "#CD5C5C", // 인디안레드
];
// Matter.js 모듈 가져오기
const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

// 엔진과 렌더러 생성
const engine = Engine.create();
const render = Render.create({
  element: document.getElementById("randomBox"),
  engine: engine,
  options: {
    width: window.innerWidth * 0.7, // 70vw
    height: window.innerHeight * 0.7, // 70vh
    wireframes: false,
    background: "#fff",
  },
});

// 상자 크기에 맞는 바닥과 벽 생성
const boxWidth = window.innerWidth * 0.7;
const boxHeight = window.innerHeight * 0.7;
const ground = Bodies.rectangle(boxWidth / 2, boxHeight, boxWidth, 20, {
  isStatic: true,
});
const leftWall = Bodies.rectangle(0, boxHeight / 2, 20, boxHeight, {
  isStatic: true,
});
const rightWall = Bodies.rectangle(boxWidth, boxHeight / 2, 20, boxHeight, {
  isStatic: true,
});
const topWall = Bodies.rectangle(boxWidth / 2, 0, boxWidth, 20, {
  isStatic: true,
});

World.add(engine.world, [ground, leftWall, rightWall, topWall]);

// 엔진 실행
Engine.run(engine);
Render.run(render);

// 입력 필드 및 버튼
const nameInput = document.getElementById("nameInput");
const voteInput = document.getElementById("voteInput");
const addButton = document.getElementById("addButton");
const resetButton = document.getElementById("resetButton");
const shuffleButton = document.getElementById("shuffleButton");
const modal = document.getElementById("modal");
const selectedName = document.getElementById("selectedName");
const closeModal = document.getElementById("closeModal");

// 동그란 픽셀 느낌의 SVG를 생성하는 함수
function generatePixelBallSVG(color) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="${color}" />
      <circle cx="20" cy="20" r="15" fill="${lightenColor(color, 20)}" />
      <circle cx="20" cy="20" r="10" fill="${lightenColor(color, 40)}" />
      <circle cx="20" cy="20" r="5" fill="${lightenColor(color, 60)}" />
    </svg>
  `;
}

// 색상을 밝게 만드는 함수
function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16),
    r = Math.min(255, (num >> 16) + percent),
    g = Math.min(255, ((num >> 8) & 0x00ff) + percent),
    b = Math.min(255, (num & 0x0000ff) + percent);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// 공 추가 이벤트 리스너
addButton.addEventListener('click', () => {
  const name = nameInput.value.trim();
  let vote = parseInt(voteInput.value, 10);

  if (name && vote > 0) {
    if (vote > 30) {
      alert('투표 수는 최대 30까지만 입력할 수 있습니다!');
      vote = 30;
    }

    for (let i = 0; i < vote; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const svgData = generatePixelBallSVG(color);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      const ball = Bodies.circle(boxWidth / 2, 50, 20, {
        restitution: 0.8, // 탄성 적용
        render: {
          sprite: {
            texture: url,
            xScale: 1,
            yScale: 1
          }
        },
        label: name
      });

      World.add(engine.world, ball);
    }

    nameInput.value = '';
    voteInput.value = '';
  } else {
    alert('이름과 투표수를 정확히 입력해 주세요!');
  }
});

// 섞기 버튼 이벤트 리스너
shuffleButton.addEventListener("click", () => {
  const bodies = Matter.Composite.allBodies(engine.world);

  bodies.forEach((body) => {
    if (!body.isStatic) {
      const forceMagnitude = 0.7;
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * forceMagnitude,
        y: (Math.random() - 0.5) * forceMagnitude,
      });
    }
  });

  shuffleButton.disabled = true;
  setTimeout(() => {
    shuffleButton.disabled = false;
  }, 3000);
});

// 리셋 버튼 이벤트 리스너
resetButton.addEventListener("click", () => {
  World.clear(engine.world, true);
  World.add(engine.world, [ground, leftWall, rightWall, topWall]);
});

// 공이 상자 밖으로 나갔을 경우 리셋하는 함수
function resetOutOfBoundsBalls() {
  const bodies = Matter.Composite.allBodies(engine.world);

  bodies.forEach((body) => {
    if (
      !body.isStatic &&
      (body.position.x < 0 ||
        body.position.x > boxWidth ||
        body.position.y > boxHeight)
    ) {
      Matter.Body.setPosition(body, { x: boxWidth / 2, y: 50 });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
    }
  });
}

// 엔진의 `beforeUpdate` 이벤트에 리셋 함수 추가
Matter.Events.on(engine, "beforeUpdate", resetOutOfBoundsBalls);

// 모달 닫기 이벤트 리스너
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// 공을 클릭하면 공 정보 콘솔 출력
render.canvas.addEventListener("click", (event) => {
  const rect = render.canvas.getBoundingClientRect();
  const mousePosition = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  const bodies = Matter.Composite.allBodies(engine.world);
  const clickedBody = bodies.find((body) => {
    if (body.isStatic) return false;

    const distance = Math.sqrt(
      Math.pow(mousePosition.x - body.position.x, 2) +
        Math.pow(mousePosition.y - body.position.y, 2)
    );

    return distance <= body.circleRadius;
  });

  if (clickedBody) {
    // 초기 모달 상태: 로딩 애니메이션 표시
    closeModal.style.display = "none";
    selectedName.innerHTML = `<span class="loading" style="font-size: 50px; color: #888; font-weight: bold; animation: blink 1s infinite;">🥁두구두구🥁</span>`;
    modal.style.display = "flex";

    // 2초 후에 선택된 이름 표시
    setTimeout(() => {
      selectedName.textContent = `🎉 ${clickedBody.label} 🎉`;
      closeModal.style.display = "flex";
    }, 2000);
  }
});

// 엔진의 `beforeUpdate` 이벤트에 리셋 함수 추가
Matter.Events.on(engine, "beforeUpdate", resetOutOfBoundsBalls);

// 눈 효과를 위한 캔버스 설정
const canvas = document.getElementById("snowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 눈송이 객체 배열 생성
const snowflakes = [];
const numSnowflakes = 100;

// 눈송이 초기화 함수
function initSnowflakes() {
  for (let i = 0; i < numSnowflakes; i++) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }
}

// 눈송이 그리기 함수
function drawSnowflakes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  for (let i = 0; i < numSnowflakes; i++) {
    const sf = snowflakes[i];
    ctx.globalAlpha = sf.opacity;
    ctx.moveTo(sf.x, sf.y);
    ctx.arc(sf.x, sf.y, sf.radius, 0, Math.PI * 2);
  }
  ctx.fill();
}

// 눈송이 애니메이션 함수
function updateSnowflakes() {
  for (let i = 0; i < numSnowflakes; i++) {
    const sf = snowflakes[i];
    sf.y += sf.speed;
    if (sf.y > canvas.height) {
      sf.y = 0;
      sf.x = Math.random() * canvas.width;
    }
  }
}

// 애니메이션 루프
function animateSnow() {
  drawSnowflakes();
  updateSnowflakes();
  requestAnimationFrame(animateSnow);
}

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// 눈 효과 초기화 및 시작
initSnowflakes();
animateSnow();
