# Architektur

## Leitprinzip

Simulation und Darstellung werden strikt getrennt. Der aktuelle Vertical Slice liegt absichtlich noch kompakt in `src/main.ts`; ab dem nächsten Milestone wird er in die unten beschriebenen Systeme zerlegt.

## Zielstruktur

```text
src/
  app/
    GameApp.ts
  simulation/
    CombatWorld.ts
    FixedStepLoop.ts
    spatial/
  entities/
    Ship.ts
    Projectile.ts
    Missile.ts
    Fighter.ts
  combat/
    DamageSystem.ts
    ShieldSystem.ts
    FluxSystem.ts
    ArmorGrid.ts
    SubsystemDamage.ts
  weapons/
    Weapon.ts
    WeaponMount.ts
    weaponTypes/
  ai/
    CombatAI.ts
    Steering.ts
  rendering/
    CombatRenderer.ts
    ShipView.ts
    ProjectileView.ts
    EffectsRenderer.ts
    Camera.ts
  input/
    DesktopInput.ts
    TouchInput.ts
  data/
    ships/
    weapons/
```

## Simulation

- Fixed timestep, Ziel: 60 Hz.
- Rendering darf unabhängig laufen und Zustände interpolieren.
- Simulationsobjekte besitzen keine PixiJS-Abhängigkeit.
- Positionen, Geschwindigkeiten, Winkel und Combat-Zustände liegen ausschließlich in der Simulation.
- Rendering liest Snapshots/Zustände, verändert aber niemals Gameplay-Werte.

## Rendering

PixiJS 8 dient als WebGL2-Compositor. Ziel-Layer:

1. Hintergrund / Nebula / Sterne
2. Distante Partikel
3. Missile Trails
4. Schiffsrümpfe
5. Damage Decals
6. Turrets / Hardpoints
7. Engine Glow / Exhaust
8. Shields
9. Projectiles / Beams
10. Impacts / EMP / Explosionen
11. Tactical Overlays
12. HUD

## Kollisionen

Keine allgemeine Physics Engine. Eigene Combat Queries:

- Segment/Circle für schnelle Projektile
- Shield-Arc-Intersection
- Ship-Hull-Intersection
- Spatial Hash Grid zur Broadphase
- später konvexe Hull-Polygone oder vereinfachte Hit-Zonen

## Performance-Ziele

Desktop-Ziel bei 60 FPS:

- 40+ größere Schiffe
- 200 Fighter
- 100 Raketen
- 1000 aktive Projektile
- mehrere tausend rein visuelle Partikel

Partikel dürfen niemals Teil der Simulation sein.

## Datenmodell

Schiffe und Waffen werden datengetrieben definiert. Gameplay-Code darf keine konkreten Schiffsnamen oder Waffenwerte voraussetzen.

Ein Schiff besteht konzeptionell aus:

- Hull
- Armor Grid
- Flux Capacity / Dissipation
- Shield
- Engines[]
- WeaponMounts[]
- Ship System
- Collision Shape
- Visual Definition

## Qualitätsregel

Neue Effekte sollen möglichst einen Simulationszustand visualisieren. Rein dekorative Effekte sind sekundär. Treffer, Flux, Overload, Engine Damage, EMP und Armor Damage müssen visuell unmittelbar lesbar sein.
