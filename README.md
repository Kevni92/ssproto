# ssproto

Webbasierter 2D-Weltraumkampf-Prototyp, inspiriert von den Designprinzipien komplexer taktischer Spiele wie Starsector – mit eigener Grafik, eigenen Schiffen und eigener Implementierung.

## Ziel

Der Prototyp soll zeigen, dass ein tiefes 2D-Kampfsystem im Browser visuell überzeugend und performant umgesetzt werden kann.

Kernziele:

- träge, schiffsabhängige Bewegung
- frei drehende Waffen
- Projektil- und Beam-Waffen
- geometrische Schilde
- Flux-/Energiemanagement
- lokale Panzerung
- EMP- und Subsystemschäden
- Fighter/Raketen in späteren Milestones
- starke 2D-Effekte mit Glow, Partikeln und Damage Feedback
- Desktop-Steuerung zuerst, Touch-Steuerung später

## Tech-Stack

- TypeScript
- Vite
- PixiJS 8 / WebGL2
- eigene deterministische Combat-Simulation
- keine externe Physics Engine

## Lokaler Start

```bash
npm install
npm run dev
```

## Steuerung

- `W/S` – vorwärts / rückwärts
- `A/D` – drehen
- `Q/E` – strafen
- Maus – zielen
- Linksklick – feuern
- Rechtsklick – Schild halten
- `V` – Flux venten
- Mausrad – Zoom

## Architektur

Siehe [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) und [`docs/COMBAT_CONCEPT.md`](docs/COMBAT_CONCEPT.md).

## Status

Milestone 0: technische Combat-Sandbox und Rendering-Grundlage.
