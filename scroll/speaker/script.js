console.clear();

// ── Scene ──────────────────────────────────────────────────────────────────
class Scene {
  constructor(model) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08080f, 0.0035);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.set(0, 0, 180);
    this.camera.lookAt(new THREE.Vector3(0, 5, 0));

    // Key light — warm white from front-right
    this.light = new THREE.PointLight(0xfff5e0, 1.2);
    this.light.position.set(70, -20, 150);
    this.scene.add(this.light);

    // Club side light — electric purple from left
    this.purpleLight = new THREE.PointLight(0xb06aff, 1.5);
    this.purpleLight.position.set(-120, 40, 80);
    this.scene.add(this.purpleLight);

    // Gold rim light from top
    this.rimLight = new THREE.PointLight(0xe8c87a, 0.8);
    this.rimLight.position.set(0, 150, -60);
    this.scene.add(this.rimLight);

    // Soft ambient
    this.softLight = new THREE.AmbientLight(0x111122, 2.0);
    this.scene.add(this.softLight);

    this.modelGroup = model;
    this.scene.add(this.modelGroup);

    this.onResize();
    window.addEventListener('resize', this.onResize, false);
  }

  render = () => {
    this.renderer.render(this.scene, this.camera);
  }

  onResize = () => {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.camera.aspect = this.w / this.h;
    var camZ = (screen.width - this.w) / 3;
    this.camera.position.z = camZ < 180 ? 180 : camZ;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.w, this.h);
    this.render();
  }
}

// ── Speaker geometry ───────────────────────────────────────────────────────
function buildSpeaker() {
  const group = new THREE.Group();

  const matCabinet = new THREE.MeshPhongMaterial({ color: 0x0a0a0a, specular: 0x282828, shininess: 15, flatShading: true });
  const matWoofer  = new THREE.MeshPhongMaterial({ color: 0x141414, specular: 0x303030, shininess: 40 });
  const matMetal   = new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0xdddddd, shininess: 120 });
  const matAccent  = new THREE.MeshPhongMaterial({ color: 0xe8c87a, specular: 0xffe8a0, shininess: 160, emissive: 0x3a3010 });
  const matDark    = new THREE.MeshPhongMaterial({ color: 0x040404, specular: 0x080808, shininess: 5, flatShading: true });

  // Cabinet
  group.add(mesh(new THREE.BoxGeometry(30, 52, 20), matCabinet));

  // Woofer surround
  const wr = mesh(new THREE.TorusGeometry(10, 1.5, 8, 48), matMetal);
  wr.position.set(0, -6, 10.5);
  group.add(wr);

  // Woofer cone
  const wc = mesh(new THREE.CylinderGeometry(6, 2.5, 4, 32), matWoofer);
  wc.rotation.x = Math.PI / 2;
  wc.position.set(0, -6, 12);
  group.add(wc);

  // Dust cap
  const dc = mesh(new THREE.SphereGeometry(2.5, 16, 8), matMetal);
  dc.position.set(0, -6, 14);
  group.add(dc);

  // Tweeter dome
  const td = mesh(new THREE.SphereGeometry(2.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), matMetal);
  td.rotation.x = -Math.PI / 2;
  td.position.set(0, 16, 10.5);
  group.add(td);

  // Tweeter ring (gold)
  const tr = mesh(new THREE.TorusGeometry(3.5, 0.5, 8, 24), matAccent);
  tr.position.set(0, 16, 10);
  group.add(tr);

  // Bass port
  const port = mesh(new THREE.CylinderGeometry(2, 2, 22, 16), matDark);
  port.rotation.x = Math.PI / 2;
  port.position.set(0, -21, 0);
  group.add(port);

  // Top gold strip
  const top = mesh(new THREE.BoxGeometry(30, 1.5, 21), matAccent);
  top.position.set(0, 23, 0);
  group.add(top);

  // Gold side bevels
  const bl = mesh(new THREE.BoxGeometry(1.2, 52, 20), matAccent);
  bl.position.set(-15, 0, 0);
  group.add(bl);
  const br = mesh(new THREE.BoxGeometry(1.2, 52, 20), matAccent);
  br.position.set(15, 0, 0);
  group.add(br);

  // Logo plate
  const logo = mesh(new THREE.BoxGeometry(12, 3, 0.5), matAccent);
  logo.position.set(0, 8, 10.5);
  group.add(logo);

  return group;
}

function mesh(geo, mat) {
  return new THREE.Mesh(geo, mat);
}

// ── Background: particles + synthwave grid ─────────────────────────────────
function buildBackground(threeScene) {
  // Gold particles — scattered sphere
  const goldPositions = new Float32Array(600 * 3);
  for (let i = 0; i < 600; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 90 + Math.random() * 280;
    goldPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    goldPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    goldPositions[i * 3 + 2] = r * Math.cos(phi) - 60;
  }
  const geoGold = new THREE.BufferGeometry();
  geoGold.setAttribute('position', new THREE.BufferAttribute(goldPositions, 3));
  const matGold = new THREE.PointsMaterial({ color: 0xe8c87a, size: 1.2, transparent: true, opacity: 0.65 });
  const gold = new THREE.Points(geoGold, matGold);
  threeScene.add(gold);

  // Purple particles — random cloud
  const purplePositions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    purplePositions[i * 3]     = (Math.random() - 0.5) * 700;
    purplePositions[i * 3 + 1] = (Math.random() - 0.5) * 350;
    purplePositions[i * 3 + 2] = (Math.random() - 0.5) * 500 - 80;
  }
  const geoPurple = new THREE.BufferGeometry();
  geoPurple.setAttribute('position', new THREE.BufferAttribute(purplePositions, 3));
  const matPurple = new THREE.PointsMaterial({ color: 0xb06aff, size: 0.9, transparent: true, opacity: 0.45 });
  const purple = new THREE.Points(geoPurple, matPurple);
  threeScene.add(purple);

  // White micro-stars
  const starPositions = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    starPositions[i * 3]     = (Math.random() - 0.5) * 900;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 600 - 150;
  }
  const geoStar = new THREE.BufferGeometry();
  geoStar.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const matStar = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.3 });
  threeScene.add(new THREE.Points(geoStar, matStar));

  // Synthwave grid floor
  const grid = new THREE.GridHelper(600, 30, 0x440088, 0x1a0044);
  grid.position.y = -80;
  grid.material.transparent = true;
  grid.material.opacity = 0.6;
  threeScene.add(grid);

  // Second tilted grid for depth
  const grid2 = new THREE.GridHelper(400, 20, 0xe8c87a, 0x3a3010);
  grid2.position.y = -80;
  grid2.material.transparent = true;
  grid2.material.opacity = 0.12;
  threeScene.add(grid2);

  return [gold, purple];
}

// ── Animation setup ────────────────────────────────────────────────────────
function setupAnimation(speakerGroup) {
  gsap.registerPlugin(ScrollTrigger);

  var scene   = new Scene(speakerGroup);
  var speaker = scene.modelGroup;

  // Canvas: full screen, above content
  scene.renderer.domElement.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10;pointer-events:none;';

  // Add background to the same Three.js scene
  var particles = buildBackground(scene.scene);

  // SVG setup
  gsap.set('#line-length',     { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
  gsap.set('#line-wingspan',   { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
  gsap.set('#circle-phalange', { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });

  gsap.fromTo(scene.renderer.domElement,
    { x: '50%', autoAlpha: 0 },
    { duration: 1, x: '0%', autoAlpha: 1 }
  );
  gsap.to('.loading',    { autoAlpha: 0 });
  gsap.to('.scroll-cta', { opacity: 1, delay: 0.8 });

  var tau            = Math.PI * 2;
  var sectionDuration = 1;

  gsap.set(speaker.rotation, { y: tau * -0.25 });
  gsap.set(speaker.position, { x: 80, y: -32, z: -60 });

  // Continuous particle drift (independent of scroll)
  (function animateParticles() {
    requestAnimationFrame(animateParticles);
    particles[0].rotation.y += 0.0006;
    particles[1].rotation.y -= 0.0004;
    particles[1].rotation.x += 0.0002;
    scene.render();
  })();

  // Parallax
  gsap.to('.ground', { y: '30%', ease: 'none', scrollTrigger: { trigger: '.ground-container', scrub: true, start: 'top bottom', end: 'bottom top' } });
  gsap.from('.clouds', { y: '25%', ease: 'none', scrollTrigger: { trigger: '.ground-container', scrub: true, start: 'top bottom', end: 'bottom top' } });

  // SVG draw in
  gsap.to('#line-length',     { attr: { 'stroke-dashoffset': 0 }, scrollTrigger: { trigger: '.length',   scrub: true, start: 'top bottom', end: 'top top' } });
  gsap.to('#line-wingspan',   { attr: { 'stroke-dashoffset': 0 }, scrollTrigger: { trigger: '.wingspan', scrub: true, start: 'top 25%',   end: 'bottom 50%' } });
  gsap.to('#circle-phalange', { attr: { 'stroke-dashoffset': 0 }, scrollTrigger: { trigger: '.phalange', scrub: true, start: 'top 50%',   end: 'bottom 100%' } });

  // SVG erase
  gsap.to('#line-length',     { attr: { 'stroke-dashoffset': -1 }, opacity: 0, scrollTrigger: { trigger: '.length',   scrub: true, start: 'top top', end: 'bottom top' } });
  gsap.to('#line-wingspan',   { attr: { 'stroke-dashoffset': -1 }, opacity: 0, scrollTrigger: { trigger: '.wingspan', scrub: true, start: 'top top', end: 'bottom top' } });
  gsap.to('#circle-phalange', { attr: { 'stroke-dashoffset': -1 }, opacity: 0, scrollTrigger: { trigger: '.phalange', scrub: true, start: 'top top', end: 'bottom top' } });

  // ── Main timeline — exact scroll1 airplane movement ───────────────────────
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.content',
      scrub: true,
      start: 'top top',
      end: 'bottom bottom',
    },
    defaults: { duration: sectionDuration, ease: 'power2.inOut' }
  });

  var delay = 0;

  tl.to('.scroll-cta',    { duration: 0.25, opacity: 0 }, delay);
  tl.to(speaker.position, { x: -10, ease: 'power1.in' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.25, y: 0, z: -tau * 0.05, ease: 'power1.inOut' }, delay);
  tl.to(speaker.position, { x: -40, y: 0, z: -60, ease: 'power1.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.25, y: 0, z: tau * 0.05, ease: 'power3.inOut' }, delay);
  tl.to(speaker.position, { x: 40, y: 0, z: -60, ease: 'power2.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.2, y: 0, z: -tau * 0.1, ease: 'power3.inOut' }, delay);
  tl.to(speaker.position, { x: -40, y: 0, z: -30, ease: 'power2.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: 0, z: 0, y: tau * 0.25 }, delay);
  tl.to(speaker.position, { x: 0, y: -10, z: 50 }, delay);
  delay += sectionDuration;
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.25, y: tau * 0.5, z: 0, ease: 'power4.inOut' }, delay);
  tl.to(speaker.position, { z: 30, ease: 'power4.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.25, y: tau * 0.5, z: 0, ease: 'power4.inOut' }, delay);
  tl.to(speaker.position, { z: 60, x: 30, ease: 'power4.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.35, y: tau * 0.75, z: tau * 0.6, ease: 'power4.inOut' }, delay);
  tl.to(speaker.position, { z: 100, x: 20, y: 0, ease: 'power4.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation, { x: tau * 0.15, y: tau * 0.85, z: 0, ease: 'power1.in' }, delay);
  tl.to(speaker.position, { z: -150, x: 0, y: 0, ease: 'power1.inOut' }, delay);
  delay += sectionDuration;

  tl.to(speaker.rotation,     { duration: sectionDuration, x: -tau * 0.05, y: tau, z: -tau * 0.1, ease: 'none' }, delay);
  tl.to(speaker.position,     { duration: sectionDuration, x: 0, y: 30, z: 320, ease: 'power1.in' }, delay);
  tl.to(scene.light.position, { duration: sectionDuration, x: 0, y: 0, z: 0 }, delay);

  // Purple light pulses toward speaker in finale
  tl.to(scene.purpleLight.position, { duration: sectionDuration, x: 0, y: 0, z: 100 }, delay);
}

setupAnimation(buildSpeaker());
