/**
 * Zenith AI — hero 3D scene.
 *
 * Signature element: a wireframe icosahedron "core" (the idea) with
 * three tilted particle rings orbiting it (the generation modes —
 * text, image, video/music) and a soft starfield behind everything.
 * Purely decorative / ambient — no interaction required.
 */
(function () {
  const canvas = document.getElementById("zenith-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030308, 0.028);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0.6, 9.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ---- lighting (subtle, mostly for the core's faint fill) ----
  scene.add(new THREE.AmbientLight(0x8888ff, 0.4));
  const point = new THREE.PointLight(0x6ef3d6, 1.2, 30);
  point.position.set(4, 4, 6);
  scene.add(point);

  // ---- core: wireframe icosahedron ----
  const coreGroup = new THREE.Group();
  const coreGeo = new THREE.IcosahedronGeometry(1.7, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x6ef3d6,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  coreGroup.add(core);

  const coreInnerGeo = new THREE.IcosahedronGeometry(1.68, 0);
  const coreInnerMat = new THREE.MeshBasicMaterial({
    color: 0x9b7bff,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  coreGroup.add(new THREE.Mesh(coreInnerGeo, coreInnerMat));
  scene.add(coreGroup);

  // ---- orbit rings made of points ----
  const ringColors = [0x6ef3d6, 0x9b7bff, 0xff7a59];
  const rings = [];
  ringColors.forEach((color, i) => {
    const radius = 3.1 + i * 0.75;
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let p = 0; p < count; p++) {
      const angle = (p / count) * Math.PI * 2;
      positions[p * 3] = Math.cos(angle) * radius;
      positions[p * 3 + 1] = (Math.random() - 0.5) * 0.15;
      positions[p * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    points.rotation.x = Math.PI / 2.4 + i * 0.35;
    points.rotation.z = i * 0.6;
    scene.add(points);
    rings.push({ mesh: points, speed: 0.0009 + i * 0.0004 * (i % 2 === 0 ? 1 : -1) });
  });

  // ---- background starfield ----
  const starCount = 900;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xf2f2fa,
    size: 0.03,
    transparent: true,
    opacity: 0.55,
  });
  scene.add(new THREE.Points(starGeo, starMat));

  // ---- pointer parallax ----
  let targetX = 0;
  let targetY = 0;
  window.addEventListener("pointermove", (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let frame = 0;
  function animate() {
    frame += 1;
    if (!prefersReducedMotion) {
      coreGroup.rotation.y += 0.0022;
      coreGroup.rotation.x += 0.0008;

      rings.forEach(({ mesh, speed }) => {
        mesh.rotation.z += speed;
      });

      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (0.6 - targetY - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
