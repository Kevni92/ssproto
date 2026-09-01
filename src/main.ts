import { Application, Container, Graphics, Text } from 'pixi.js';
import './style.css';

type Vec = { x: number; y: number };

type Projectile = {
  view: Graphics;
  pos: Vec;
  vel: Vec;
  life: number;
  damage: number;
  owner: Ship;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const len = (v: Vec) => Math.hypot(v.x, v.y);
const normalize = (v: Vec): Vec => {
  const l = len(v) || 1;
  return { x: v.x / l, y: v.y / l };
};
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

class Ship {
  readonly root = new Container();
  readonly hull = new Graphics();
  readonly engine = new Graphics();
  readonly turret = new Graphics();
  readonly shield = new Graphics();
  readonly targetRing = new Graphics();

  pos: Vec;
  vel: Vec = { x: 0, y: 0 };
  angle = 0;
  turretAngle = 0;
  angularVelocity = 0;

  hullHp = 1000;
  maxHullHp = 1000;
  flux = 0;
  maxFlux = 1000;
  shieldActive = false;
  overloaded = 0;
  fireCooldown = 0;

  constructor(
    public readonly faction: 'player' | 'enemy',
    x: number,
    y: number,
    public readonly size = 1,
  ) {
    this.pos = { x, y };

    this.engine
      .poly([-34, -11, -49, 0, -34, 11])
      .fill({ color: 0x5fd7ff, alpha: 0.9 });

    const hullColor = faction === 'player' ? 0x7d9eb8 : 0xa35f61;
    this.hull
      .poly([42, 0, 17, -21, -24, -24, -39, -10, -32, 0, -39, 10, -24, 24, 17, 21])
      .fill({ color: hullColor })
      .stroke({ color: 0xd6e7f2, width: 2, alpha: 0.55 });
    this.hull
      .poly([24, 0, 5, -10, -18, -8, -25, 0, -18, 8, 5, 10])
      .fill({ color: 0x1a2530, alpha: 0.9 });

    this.turret
      .circle(0, 0, 7)
      .fill({ color: 0xc7d3db })
      .rect(0, -2, 27, 4)
      .fill({ color: 0xe4edf2 });
    this.turret.position.set(5, 0);

    this.shield
      .arc(0, 0, 53, -Math.PI * 0.62, Math.PI * 0.62)
      .stroke({ color: 0x65c8ff, width: 6, alpha: 0.75 });
    this.shield.alpha = 0;

    this.targetRing
      .circle(0, 0, 64)
      .stroke({ color: 0xff8b8b, width: 2, alpha: 0.5 });
    this.targetRing.alpha = 0;

    this.root.addChild(this.engine, this.hull, this.turret, this.shield, this.targetRing);
    this.root.scale.set(size);
    this.syncView();
  }

  get alive() {
    return this.hullHp > 0;
  }

  update(dt: number) {
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.overloaded = Math.max(0, this.overloaded - dt);

    if (!this.shieldActive && this.overloaded <= 0) {
      this.flux = Math.max(0, this.flux - 115 * dt);
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.angle += this.angularVelocity * dt;
    this.syncView();
  }

  syncView() {
    this.root.position.set(this.pos.x, this.pos.y);
    this.root.rotation = this.angle;
    this.turret.rotation = wrapAngle(this.turretAngle - this.angle);
    this.shield.alpha = this.shieldActive && this.overloaded <= 0 ? 1 : 0;
  }

  applyDamage(amount: number) {
    if (this.shieldActive && this.overloaded <= 0) {
      this.flux += amount * 1.1;
      if (this.flux >= this.maxFlux) {
        this.flux = this.maxFlux;
        this.overloaded = 2.4;
        this.shieldActive = false;
      }
      return;
    }

    this.hullHp = Math.max(0, this.hullHp - amount);
  }
}

class CombatDemo {
  readonly app = new Application();
  readonly world = new Container();
  readonly effects = new Container();
  readonly hud = new Container();
  readonly stars = new Graphics();
  readonly projectiles: Projectile[] = [];
  readonly keys = new Set<string>();

  readonly player = new Ship('player', 0, 0, 1.15);
  readonly enemies = [
    new Ship('enemy', 750, -180, 0.85),
    new Ship('enemy', 920, 150, 1.0),
    new Ship('enemy', 1120, 20, 1.25),
  ];

  pointerScreen: Vec = { x: 0, y: 0 };
  firing = false;
  shielding = false;
  zoom = 0.75;

  fluxText = new Text({ text: '', style: { fill: 0x9fdcff, fontSize: 14 } });
  hullText = new Text({ text: '', style: { fill: 0xd9e7f5, fontSize: 14 } });
  targetText = new Text({ text: '', style: { fill: 0xffb0b0, fontSize: 13 } });

  async init() {
    await this.app.init({
      resizeTo: window,
      antialias: true,
      background: 0x05070b,
      resolution: Math.min(devicePixelRatio, 2),
      autoDensity: true,
    });

    document.querySelector('#app')!.appendChild(this.app.canvas);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="hint">W/S Schub · A/D drehen · Q/E strafen · LMB feuern · RMB Schild · V venten · Mausrad Zoom</div>',
    );

    this.generateStars();
    this.world.addChild(this.stars);
    this.world.addChild(this.player.root);
    for (const enemy of this.enemies) this.world.addChild(enemy.root);
    this.world.addChild(this.effects);
    this.app.stage.addChild(this.world, this.hud);

    this.fluxText.position.set(18, 18);
    this.hullText.position.set(18, 40);
    this.targetText.position.set(18, 62);
    this.hud.addChild(this.fluxText, this.hullText, this.targetText);

    this.bindInput();
    this.app.ticker.add((ticker) => this.update(Math.min(0.033, ticker.deltaMS / 1000)));
  }

  generateStars() {
    let seed = 73129;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 800; i++) {
      const x = (random() - 0.5) * 5000;
      const y = (random() - 0.5) * 3500;
      const r = 0.5 + random() * 1.5;
      this.stars.circle(x, y, r).fill({ color: 0xcfe7ff, alpha: 0.18 + random() * 0.55 });
    }
  }

  bindInput() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'KeyV' && this.player.overloaded <= 0) {
        this.player.shieldActive = false;
        this.player.flux = Math.max(0, this.player.flux - 260);
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    this.app.canvas.addEventListener('pointermove', (e) => {
      this.pointerScreen = { x: e.clientX, y: e.clientY };
    });
    this.app.canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 0) this.firing = true;
      if (e.button === 2) this.shielding = true;
    });
    window.addEventListener('pointerup', (e) => {
      if (e.button === 0) this.firing = false;
      if (e.button === 2) this.shielding = false;
    });
    this.app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.app.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = clamp(this.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.35, 1.6);
    }, { passive: false });
  }

  screenToWorld(p: Vec): Vec {
    const cx = this.app.renderer.width / this.app.renderer.resolution / 2;
    const cy = this.app.renderer.height / this.app.renderer.resolution / 2;
    return {
      x: this.player.pos.x + (p.x - cx) / this.zoom,
      y: this.player.pos.y + (p.y - cy) / this.zoom,
    };
  }

  update(dt: number) {
    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);

    this.player.update(dt);
    for (const enemy of this.enemies) enemy.update(dt);

    this.updateCamera();
    this.updateHud();
  }

  updatePlayer(dt: number) {
    const ship = this.player;
    const forward = { x: Math.cos(ship.angle), y: Math.sin(ship.angle) };
    const right = { x: -forward.y, y: forward.x };

    let thrust = 0;
    if (this.keys.has('KeyW')) thrust += 1;
    if (this.keys.has('KeyS')) thrust -= 0.55;

    let strafe = 0;
    if (this.keys.has('KeyE')) strafe += 1;
    if (this.keys.has('KeyQ')) strafe -= 1;

    const accel = 250;
    ship.vel.x += (forward.x * thrust * accel + right.x * strafe * accel * 0.65) * dt;
    ship.vel.y += (forward.y * thrust * accel + right.y * strafe * accel * 0.65) * dt;

    const speed = len(ship.vel);
    const maxSpeed = 310;
    if (speed > maxSpeed) {
      const n = normalize(ship.vel);
      ship.vel = { x: n.x * maxSpeed, y: n.y * maxSpeed };
    }
    ship.vel.x *= Math.pow(0.965, dt * 60);
    ship.vel.y *= Math.pow(0.965, dt * 60);

    let turn = 0;
    if (this.keys.has('KeyD')) turn += 1;
    if (this.keys.has('KeyA')) turn -= 1;
    ship.angularVelocity += turn * 4.8 * dt;
    ship.angularVelocity *= Math.pow(0.88, dt * 60);
    ship.angularVelocity = clamp(ship.angularVelocity, -2.3, 2.3);

    const aim = this.screenToWorld(this.pointerScreen);
    ship.turretAngle = Math.atan2(aim.y - ship.pos.y, aim.x - ship.pos.x);

    ship.shieldActive = this.shielding && ship.overloaded <= 0 && ship.flux < ship.maxFlux;
    if (ship.shieldActive) ship.flux = Math.min(ship.maxFlux, ship.flux + 18 * dt);

    if (this.firing && ship.fireCooldown <= 0 && ship.overloaded <= 0) {
      this.fireProjectile(ship, ship.turretAngle, 720, 54, 420);
      ship.fireCooldown = 0.13;
      ship.flux = Math.min(ship.maxFlux, ship.flux + 24);
    }
  }

  updateEnemies(dt: number) {
    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        enemy.root.alpha = Math.max(0, enemy.root.alpha - dt * 0.8);
        continue;
      }

      const dx = this.player.pos.x - enemy.pos.x;
      const dy = this.player.pos.y - enemy.pos.y;
      const distance = Math.hypot(dx, dy);
      const desired = Math.atan2(dy, dx);
      enemy.turretAngle = desired;

      const angleDiff = wrapAngle(desired - enemy.angle);
      enemy.angularVelocity += clamp(angleDiff, -1, 1) * 2.2 * dt;
      enemy.angularVelocity *= Math.pow(0.9, dt * 60);

      const forward = { x: Math.cos(enemy.angle), y: Math.sin(enemy.angle) };
      const thrust = distance > 520 ? 1 : distance < 330 ? -0.35 : 0;
      enemy.vel.x += forward.x * thrust * 155 * dt;
      enemy.vel.y += forward.y * thrust * 155 * dt;
      enemy.vel.x *= Math.pow(0.975, dt * 60);
      enemy.vel.y *= Math.pow(0.975, dt * 60);

      enemy.shieldActive = distance < 560 && enemy.flux < enemy.maxFlux * 0.82 && enemy.overloaded <= 0;
      if (enemy.shieldActive) enemy.flux = Math.min(enemy.maxFlux, enemy.flux + 14 * dt);

      if (distance < 690 && enemy.fireCooldown <= 0 && enemy.overloaded <= 0) {
        const spread = (Math.random() - 0.5) * 0.035;
        this.fireProjectile(enemy, desired + spread, 610, 37, 380);
        enemy.fireCooldown = 0.35 + Math.random() * 0.12;
        enemy.flux = Math.min(enemy.maxFlux, enemy.flux + 18);
      }
    }
  }

  fireProjectile(owner: Ship, angle: number, speed: number, damage: number, range: number) {
    const muzzle = 38 * owner.size;
    const pos = {
      x: owner.pos.x + Math.cos(angle) * muzzle,
      y: owner.pos.y + Math.sin(angle) * muzzle,
    };
    const view = new Graphics()
      .circle(0, 0, owner.faction === 'player' ? 3.1 : 2.7)
      .fill({ color: owner.faction === 'player' ? 0x9fe7ff : 0xff997e })
      .rect(-15, -1.2, 15, 2.4)
      .fill({ color: owner.faction === 'player' ? 0x4bbcff : 0xff5f45, alpha: 0.65 });
    view.rotation = angle;
    view.position.set(pos.x, pos.y);
    this.effects.addChild(view);

    this.projectiles.push({
      view,
      pos,
      vel: { x: Math.cos(angle) * speed + owner.vel.x, y: Math.sin(angle) * speed + owner.vel.y },
      life: range / speed + 0.35,
      damage,
      owner,
    });
  }

  updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.view.position.set(p.pos.x, p.pos.y);

      const targets = p.owner.faction === 'player' ? this.enemies : [this.player];
      let hit = false;
      for (const target of targets) {
        if (!target.alive) continue;
        const radius = 46 * target.size;
        if (Math.hypot(p.pos.x - target.pos.x, p.pos.y - target.pos.y) <= radius) {
          target.applyDamage(p.damage);
          this.spawnImpact(p.pos.x, p.pos.y, target.shieldActive);
          hit = true;
          break;
        }
      }

      if (hit || p.life <= 0) {
        p.view.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  spawnImpact(x: number, y: number, shield: boolean) {
    const flash = new Graphics()
      .circle(0, 0, shield ? 15 : 10)
      .fill({ color: shield ? 0x80dfff : 0xffc06c, alpha: 0.8 });
    flash.position.set(x, y);
    this.effects.addChild(flash);

    let life = 0.18;
    const fade = (ticker: { deltaMS: number }) => {
      life -= ticker.deltaMS / 1000;
      flash.alpha = clamp(life / 0.18, 0, 1);
      flash.scale.set(1 + (0.18 - life) * 4);
      if (life <= 0) {
        this.app.ticker.remove(fade);
        flash.destroy();
      }
    };
    this.app.ticker.add(fade);
  }

  updateCamera() {
    const screenWidth = this.app.renderer.width / this.app.renderer.resolution;
    const screenHeight = this.app.renderer.height / this.app.renderer.resolution;
    this.world.scale.set(this.zoom);
    this.world.position.set(
      screenWidth / 2 - this.player.pos.x * this.zoom,
      screenHeight / 2 - this.player.pos.y * this.zoom,
    );
  }

  updateHud() {
    const fluxPct = Math.round((this.player.flux / this.player.maxFlux) * 100);
    const hullPct = Math.round((this.player.hullHp / this.player.maxHullHp) * 100);
    this.fluxText.text = `FLUX  ${fluxPct}%${this.player.overloaded > 0 ? '  OVERLOAD' : ''}`;
    this.hullText.text = `HULL  ${hullPct}%`;

    let nearest: Ship | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const d = Math.hypot(enemy.pos.x - this.player.pos.x, enemy.pos.y - this.player.pos.y);
      if (d < nearestDistance) {
        nearest = enemy;
        nearestDistance = d;
      }
      enemy.targetRing.alpha = 0;
    }

    if (nearest) {
      nearest.targetRing.alpha = 0.65;
      this.targetText.text = `TARGET  ${Math.round(nearestDistance)}m · HULL ${Math.round((nearest.hullHp / nearest.maxHullHp) * 100)}% · FLUX ${Math.round((nearest.flux / nearest.maxFlux) * 100)}%`;
    } else {
      this.targetText.text = 'TARGET  keine aktiven Kontakte';
    }
  }
}

const demo = new CombatDemo();
void demo.init();
