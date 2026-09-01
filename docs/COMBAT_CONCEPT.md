# Combat-Konzept

## Zielbild

Der Kampf soll visuell sofort verständlich, mechanisch aber tief sein. Der Spieler steuert ein träges 2D-Schiff mit eigener Masse, Drehträgheit, Waffenwinkeln, Schildzustand und Energiemanagement.

## Bewegung

Schiffe besitzen mindestens:

- Position / Geschwindigkeit
- Rotation / Rotationsgeschwindigkeit
- Vorwärts- und Rückwärtsbeschleunigung
- Strafe-Beschleunigung
- Maximalgeschwindigkeit
- Turn Acceleration / Max Turn Rate

Größe und Klasse sollen sich deutlich im Handling unterscheiden.

## Schild

Schilde sind geometrische Schutzbereiche, keine zusätzliche HP-Leiste.

Parameter:

- Radius
- Arc/Winkel
- Ausrichtung
- Aktivierungszeit
- Flux Upkeep
- Damage-to-Flux-Effizienz

Treffer werden zunächst gegen den Schildbogen geprüft, danach gegen Armor/Hull.

## Flux

Flux bildet gleichzeitig Waffenbelastung, Schildbelastung und taktische Handlungsfreiheit ab.

- Waffen erzeugen Flux.
- Aktive Schilde erzeugen Flux.
- Schildtreffer erzeugen besonders viel Flux.
- Flux wird ohne Schild langsam dissipiert.
- Venting dissipiert schneller, macht das Schiff aber verwundbar.
- Volles Flux löst Overload aus.

Später wird zwischen Soft Flux und Hard Flux unterschieden.

## Armor

Ziel ist ein lokales Armor Grid statt einer einzigen Armor-HP-Leiste.

Erster Ausbau:

- Grid über der lokalen Schiffssilhouette
- Treffer beschädigen Einschlagzelle und Nachbarzellen
- große Einzeltreffer sind effizienter gegen starke Panzerung
- bereits beschädigte Seiten können taktisch weggehalten werden

Visuell werden beschädigte Bereiche über Decals, Glut, Funken und lokale Verfärbung dargestellt.

## Damage Pipeline

```text
Projectile/Beam
  -> Shield intersection?
     -> Shield damage / Flux
  -> Armor cell(s)
     -> Armor mitigation / Armor damage
  -> Hull
     -> Hull damage
  -> optional EMP/subsystem damage
```

## Subsysteme

Geplante Subsysteme:

- Engines
- Weapon Mounts
- optional Sensor/Control Core

EMP kann Subsysteme temporär deaktivieren. Direkte Treffer können dauerhafteren Schaden verursachen.

## Waffenfamilien

Der erste vollständige Combat-Slice soll mindestens enthalten:

1. Autocannon – schnell, kinetisch, gut gegen Schild
2. Heavy Cannon – langsam, hoher Armor-Schaden
3. Pulse Weapon – universelle Energieprojektile
4. Beam – Hitscan/continuous
5. Ion Weapon – EMP/SubSystem-Fokus
6. Torpedo – langsam, begrenzte Munition, hoher Burst

## Schadenstypen

Geplante Basistypen:

- Kinetic: stark gegen Shield, schwächer gegen Armor
- Explosive: schwächer gegen Shield, stark gegen Armor
- Energy: neutral
- Fragmentation: stark gegen ungeschützte leichte Ziele/Subkomponenten
- EMP: hauptsächlich Systemschaden

## Visuelle Rückmeldung

Jeder relevante Zustand benötigt eine eigene visuelle Sprache:

- Engine Thrust -> Glow + Exhaust
- Shield Hit -> lokaler Shield Flash
- High Flux -> HUD + stärkere Schiffsemissionen
- Venting -> deutlich sichtbare Energieabgabe
- Overload -> elektrische Entladung / Shield Collapse
- Armor Hit -> Sparks / Debris / Damage Decal
- EMP -> Arc zum getroffenen Subsystem
- Disabled Engine -> fehlender Engine Glow / Funken
- Destroyed Ship -> mehrstufige Explosion statt einfachem Sprite-Verschwinden

## Kamera

- Spieler bleibt grob im Fokus.
- Mausrad zoomt weich.
- Später Look-Ahead in Zielrichtung.
- Große Schlachten benötigen weiteren Zoom als Duelle.

## MVP-Abgrenzung

Nicht Teil des ersten Combat-Prototyps:

- Kampagnenkarte
- Handel/Wirtschaft
- Flottenmanagement
- Persistenz
- Multiplayer
- prozedurale Galaxie

Der erste Prototyp ist ausschließlich eine hochwertige Combat-Sandbox.
