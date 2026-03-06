import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/PointerLockControls.js";

const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const hud = document.getElementById("hud");
const statusEl = document.getElementById("status");
const recorderEl = document.getElementById("recorder");
const clueEl = document.getElementById("clue");
const hintEl = document.getElementById("hint");
const messageEl = document.getElementById("message");

const touchControls = document.getElementById("touchControls");
const joystickZone = document.getElementById("joystickZone");
const joystickKnob = document.getElementById("joystickKnob");
const lookZone = document.getElementById("lookZone");
const btnRecord = document.getElementById("btnRecord");
const btnAnalyze = document.getElementById("btnAnalyze");
const btnFlash = document.getElementById("btnFlash");
const btnSprint = document.getElementById("btnSprint");

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06080f);
scene.fog = new THREE.FogExp2(0x0a0f1f, 0.06);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 250);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);

const ambient = new THREE.AmbientLight(0x4f5b8a, 0.08);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0x8fb0ff, 0.2);
moon.position.set(14, 22, -8);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
moon.shadow.camera.near = 1;
moon.shadow.camera.far = 80;
moon.shadow.camera.left = -25;
moon.shadow.camera.right = 25;
moon.shadow.camera.top = 25;
moon.shadow.camera.bottom = -25;
scene.add(moon);

const flashlight = new THREE.SpotLight(0xc8ddff, 1.8, 28, Math.PI / 7, 0.5, 1.4);
flashlight.castShadow = true;
flashlight.visible = true;
scene.add(flashlight);
scene.add(flashlight.target);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(180, 180),
  new THREE.MeshStandardMaterial({ color: 0x10151d, roughness: 0.97, metalness: 0.02 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1613, roughness: 1 });
for (let i = 0; i < 120; i += 1) {
  const branch = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.5), branchMaterial);
  branch.position.set((Math.random() - 0.5) * 120, 0.03, (Math.random() - 0.5) * 120);
  branch.rotation.y = Math.random() * Math.PI;
  branch.castShadow = true;
  scene.add(branch);
}

const treeGroup = new THREE.Group();
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x261b14, roughness: 0.9 });
const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x0e1117, roughness: 1 });

for (let i = 0; i < 230; i += 1) {
  const x = (Math.random() - 0.5) * 170;
  const z = (Math.random() - 0.5) * 170;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 4 + Math.random() * 4, 6), trunkMaterial);
  trunk.position.set(x, 2, z);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.2 + Math.random() * 1.2, 2 + Math.random() * 2, 6), leavesMaterial);
  leaves.position.set(x, 5 + Math.random() * 1.2, z);
  leaves.castShadow = true;
  treeGroup.add(leaves);
}
scene.add(treeGroup);

const symbols = [];
const symbolData = [
  { pos: new THREE.Vector3(8, 1.5, -10), clue: "Her voice says: 'Below roots, truth sleeps.'" },
  { pos: new THREE.Vector3(-18, 1.5, -3), clue: "Faint child whisper: 'She counted us at midnight.'" },
  { pos: new THREE.Vector3(14, 1.5, 18), clue: "Distorted female tone: 'Do not follow the lantern.'" },
  { pos: new THREE.Vector3(-4, 1.5, 22), clue: "Breathing behind tape hiss: 'Turn back before dawn.'" },
  { pos: new THREE.Vector3(24, 1.5, 2), clue: "The witch murmurs your name from static." }
];

symbolData.forEach(({ pos, clue }) => {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x3b2a21 }));
  pole.position.copy(pos);
  pole.castShadow = true;

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.25, 0.05, 56, 8),
    new THREE.MeshStandardMaterial({ color: 0x5b0f18, emissive: 0x1a0305, roughness: 0.6 })
  );
  knot.position.copy(pos).add(new THREE.Vector3(0, 0.4, 0));
  knot.rotation.x = Math.PI / 2;
  knot.scale.set(0.7, 0.7, 0.25);

  scene.add(pole, knot);
  symbols.push({ pole, knot, clue, captured: false });
});

camera.position.set(0, 1.7, 12);

const movement = { forward: false, backward: false, left: false, right: false, sprint: false };
let flashlightOn = true;
let clueCount = 0;
let lastRecording = null;
let whisperTimer = 8;

const touchMove = { x: 0, y: 0, active: false };
const lookState = { active: false, pointerId: null, x: 0, y: 0 };
let yaw = 0;
let pitch = 0;

const listener = new THREE.AudioListener();
camera.add(listener);

const humOsc = listener.context.createOscillator();
humOsc.type = "sawtooth";
humOsc.frequency.value = 34;
const humGain = listener.context.createGain();
humGain.gain.value = 0.009;
humOsc.connect(humGain);
humGain.connect(listener.context.destination);
humOsc.start();

const footstepClock = new THREE.Clock();
let stepAccumulator = 0;

function showMessage(text, timeout = 2600) {
  messageEl.textContent = text;
  messageEl.classList.remove("hidden");
  setTimeout(() => messageEl.classList.add("hidden"), timeout);
}

function nearestSymbol() {
  const playerPos = camera.position;
  let nearest = null;
  let nearestDist = Infinity;
  for (const s of symbols) {
    const d = s.pole.position.distanceTo(playerPos);
    if (d < nearestDist) {
      nearest = s;
      nearestDist = d;
    }
  }
  return { nearest, dist: nearestDist };
}

function recordEnvironment() {
  const { nearest, dist } = nearestSymbol();
  recorderEl.textContent = "Recorder: Capturing...";
  setTimeout(() => {
    if (nearest && dist < 7) {
      lastRecording = nearest;
      recorderEl.textContent = "Recorder: Distorted voice captured";
      showMessage("Tape catches an impossible whisper.");
    } else {
      lastRecording = { clue: "Only wind and distant cracks. No voice imprint.", captured: true };
      recorderEl.textContent = "Recorder: Mostly silence";
      showMessage("No nearby anomaly. Move toward marked trees.");
    }
  }, 1200);
}

function analyzeRecording() {
  if (!lastRecording) {
    showMessage("No recording available. Press R first.");
    return;
  }

  recorderEl.textContent = "Recorder: Spectral analysis...";
  setTimeout(() => {
    hintEl.textContent = `Playback: ${lastRecording.clue}`;
    statusEl.textContent = "Status: Heartbeat rising";
    if (!lastRecording.captured && symbols.includes(lastRecording)) {
      lastRecording.captured = true;
      clueCount += 1;
      clueEl.textContent = `Clues: ${clueCount}/5`;
      showMessage("Hidden voice decoded.");
      if (clueCount === 5) {
        showMessage("All clues recovered. The witch knows you listened.", 5000);
        statusEl.textContent = "Status: RUN";
      }
    }
    recorderEl.textContent = "Recorder: Idle";
  }, 1400);
}

function spawnWhisper() {
  const panner = listener.context.createStereoPanner();
  panner.pan.value = Math.random() * 1.6 - 0.8;
  const gain = listener.context.createGain();
  gain.gain.setValueAtTime(0.0001, listener.context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.03, listener.context.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, listener.context.currentTime + 1.7);

  const noiseBuffer = listener.context.createBuffer(1, listener.context.sampleRate * 1.8, listener.context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const n = (Math.random() * 2 - 1) * (1 - i / data.length);
    data[i] = n * 0.5;
  }

  const src = listener.context.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 0.3 + Math.random() * 0.25;
  src.connect(panner).connect(gain).connect(listener.context.destination);
  src.start();
  showMessage("You hear breathing behind you.", 1300);
}

function toggleFlashlight() {
  flashlightOn = !flashlightOn;
  flashlight.visible = flashlightOn;
  btnFlash?.classList.toggle("active", flashlightOn);
}

function setSprint(active) {
  movement.sprint = active;
  btnSprint?.classList.toggle("active", active);
}

function applyTouchMoveToKeyboardFlags() {
  const deadZone = 0.2;
  movement.left = touchMove.active && touchMove.x < -deadZone;
  movement.right = touchMove.active && touchMove.x > deadZone;
  movement.forward = touchMove.active && touchMove.y < -deadZone;
  movement.backward = touchMove.active && touchMove.y > deadZone;
}

function updateJoystickKnob() {
  const maxOffset = 42;
  const x = touchMove.x * maxOffset;
  const y = touchMove.y * maxOffset;
  joystickKnob.style.transform = `translate(${x}px, ${y}px)`;
}

function setTouchMove(clientX, clientY) {
  const rect = joystickZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const radius = rect.width * 0.44;
  const length = Math.hypot(dx, dy) || 1;
  const scale = Math.min(1, radius / length);
  touchMove.x = (dx * scale) / radius;
  touchMove.y = (dy * scale) / radius;
  touchMove.active = true;
  applyTouchMoveToKeyboardFlags();
  updateJoystickKnob();
}

function resetTouchMove() {
  touchMove.x = 0;
  touchMove.y = 0;
  touchMove.active = false;
  applyTouchMoveToKeyboardFlags();
  updateJoystickKnob();
}

function initMobileControls() {
  if (!isTouchDevice) return;

  touchControls.classList.remove("hidden");
  btnFlash.classList.add("active");

  joystickZone.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    joystickZone.setPointerCapture(e.pointerId);
    setTouchMove(e.clientX, e.clientY);
  });

  joystickZone.addEventListener("pointermove", (e) => {
    if (!touchMove.active) return;
    setTouchMove(e.clientX, e.clientY);
  });

  const endJoystick = () => resetTouchMove();
  joystickZone.addEventListener("pointerup", endJoystick);
  joystickZone.addEventListener("pointercancel", endJoystick);

  lookZone.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    lookState.active = true;
    lookState.pointerId = e.pointerId;
    lookState.x = e.clientX;
    lookState.y = e.clientY;
    lookZone.setPointerCapture(e.pointerId);
  });

  lookZone.addEventListener("pointermove", (e) => {
    if (!lookState.active || e.pointerId !== lookState.pointerId) return;
    const dx = e.clientX - lookState.x;
    const dy = e.clientY - lookState.y;
    lookState.x = e.clientX;
    lookState.y = e.clientY;
    yaw -= dx * 0.0023;
    pitch -= dy * 0.002;
    pitch = Math.max(-1.3, Math.min(1.3, pitch));
  });

  const endLook = (e) => {
    if (e.pointerId !== lookState.pointerId) return;
    lookState.active = false;
    lookState.pointerId = null;
  };
  lookZone.addEventListener("pointerup", endLook);
  lookZone.addEventListener("pointercancel", endLook);

  btnRecord.addEventListener("click", recordEnvironment);
  btnAnalyze.addEventListener("click", analyzeRecording);
  btnFlash.addEventListener("click", toggleFlashlight);
  btnSprint.addEventListener("click", () => setSprint(!movement.sprint));
}

startBtn.addEventListener("click", async () => {
  overlay.classList.add("hidden");
  hud.classList.remove("hidden");

  if (!isTouchDevice) {
    controls.lock();
  }

  if (listener.context.state !== "running") {
    await listener.context.resume();
  }
  showMessage(isTouchDevice ? "Use left joystick + right swipe to move/look." : "Find symbols. Record. Analyze.");
});

controls.addEventListener("lock", () => {
  statusEl.textContent = "Status: Investigating";
});

controls.addEventListener("unlock", () => {
  statusEl.textContent = "Status: Paused";
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") movement.forward = true;
  if (e.code === "KeyS") movement.backward = true;
  if (e.code === "KeyA") movement.left = true;
  if (e.code === "KeyD") movement.right = true;
  if (e.code === "ShiftLeft") setSprint(true);
  if (e.code === "KeyF") toggleFlashlight();
  if (e.code === "KeyR") recordEnvironment();
  if (e.code === "KeyE") analyzeRecording();
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") movement.forward = false;
  if (e.code === "KeyS") movement.backward = false;
  if (e.code === "KeyA") movement.left = false;
  if (e.code === "KeyD") movement.right = false;
  if (e.code === "ShiftLeft") setSprint(false);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const side = new THREE.Vector3();
const forward = new THREE.Vector3();

function updateMovement(delta) {
  const baseSpeed = movement.sprint ? 8.5 : 4.8;
  direction.set(0, 0, 0);

  if (movement.forward) direction.z -= 1;
  if (movement.backward) direction.z += 1;
  if (movement.left) direction.x -= 1;
  if (movement.right) direction.x += 1;

  if (direction.lengthSq() > 0) {
    direction.normalize();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    side.crossVectors(forward, up).normalize();

    velocity.copy(forward).multiplyScalar(direction.z * baseSpeed * delta);
    velocity.add(side.multiplyScalar(direction.x * baseSpeed * delta));
    controls.getObject().position.add(velocity);

    stepAccumulator += delta;
    if (stepAccumulator > (movement.sprint ? 0.28 : 0.42)) {
      stepAccumulator = 0;
      statusEl.textContent = `Status: ${Math.random() > 0.5 ? "Branches crack nearby" : "Listening"}`;
    }
  }

  controls.getObject().position.y = 1.7;
}

function updateCameraForTouch() {
  if (!isTouchDevice) return;
  const obj = controls.getObject();
  obj.rotation.y = yaw;
  camera.rotation.x = pitch;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = footstepClock.getDelta();

  const playing = isTouchDevice ? overlay.classList.contains("hidden") : controls.isLocked;
  if (playing) {
    updateCameraForTouch();
    updateMovement(delta);

    const look = new THREE.Vector3();
    camera.getWorldDirection(look);
    flashlight.position.copy(camera.position);
    flashlight.target.position.copy(camera.position).add(look.multiplyScalar(8));

    whisperTimer -= delta;
    if (whisperTimer <= 0) {
      whisperTimer = 7 + Math.random() * 7;
      spawnWhisper();
    }
  }

  renderer.render(scene, camera);
}

initMobileControls();
animate();
