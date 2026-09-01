# AGENTS.md

## Projektziel

`ssproto` ist ein Web-Prototyp für taktischen 2D-Weltraumkampf mit hoher visueller Lesbarkeit und tiefer Simulation. Starsector dient nur als Designreferenz; Assets, Namen und konkrete Inhalte werden nicht kopiert.

## Technische Regeln

- TypeScript strict.
- PixiJS ausschließlich im Rendering-/UI-Layer.
- Simulation muss ohne DOM und ohne PixiJS ausführbar sein.
- Gameplay verwendet einen Fixed Timestep.
- Keine allgemeine Physics Engine ohne vorherige Architekturentscheidung.
- Gameplay-Daten für Schiffe/Waffen datengetrieben halten.
- Partikel und rein visuelle Effekte dürfen keine Gameplay-Logik beeinflussen.
- Keine großen Refactorings zusammen mit neuen Features, außer das Issue verlangt es ausdrücklich.

## Workflow

- Ein Issue pro klar abgegrenztem Arbeitspaket.
- Feature-Branch von aktuellem `main`.
- Vor PR: `npm install` und `npm run build` erfolgreich.
- PR beschreibt Verhalten, Architekturänderungen und manuelle Testschritte.
- PR soll das zugehörige Issue mit `Closes #...` referenzieren.

## Qualitätsziele

Priorität:

1. korrektes Combat-Verhalten
2. visuelle Lesbarkeit des Simulationszustands
3. saubere Architektur
4. Performance
5. dekorativer Polish

Keine Platzhaltermechanik als dauerhaftes System etablieren. Prototyp-Code darf kompakt sein, muss aber spätestens beim Ausbau in die dokumentierte Zielarchitektur überführt werden.
