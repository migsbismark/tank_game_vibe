```markdown
# Tank Artillery Game – Implementation TODO List

This TODO list breaks the project into **incremental features ordered from easiest to hardest**.  
Each feature includes **clear acceptance criteria** so it is easy to verify when the task is complete.

---

# Phase 1 — Project Setup

## 1. Initialize Project ✅
Create a basic web project that loads a Three.js scene.

**Tasks**
- [x] Create project folder structure
- [x] Add HTML entry page
- [x] Install/load Three.js
- [x] Create render loop

**Acceptance Criteria**
- [x] Opening `index.html` loads without errors
- [x] A Three.js scene renders in the browser
- [x] A camera and renderer are initialized
- [x] The render loop runs continuously

---

## 2. Implement Side-View Camera ✅
Set up a fixed camera for a 2D artillery-style view.

**Tasks**
- [x] Add orthographic camera
- [x] Position camera for side view
- [x] Lock camera movement

**Acceptance Criteria**
- [x] Scene renders in a side-view perspective
- [x] Camera does not move during gameplay
- [x] World coordinates map clearly to screen space

---

# Phase 2 — Terrain

## 3. Implement Terrain Heightmap Data Structure ✅

**Tasks**
- [x] Create heightmap array
- [x] Define terrain width and resolution
- [x] Create helper functions to read terrain height

**Acceptance Criteria**
- [x] Terrain heightmap array exists
- [x] Heights can be queried using `getHeight(x)`
- [x] Terrain width and resolution are configurable

---

## 4. Render Terrain Mesh ✅

**Tasks**
- [x] Generate mesh geometry from heightmap
- [x] Render terrain using Three.js

**Acceptance Criteria**
- [x] Terrain appears on screen
- [x] Terrain matches the heightmap values
- [x] Terrain fills the playable area

---

## 5. Random Terrain Generation ✅

**Tasks**
- [x] Generate hills using random height variation
- [x] Smooth terrain for natural slopes

**Acceptance Criteria**
- [x] Terrain is different each round
- [x] Terrain contains hills and valleys
- [x] Terrain never generates impossible vertical walls

---

# Phase 3 — Tanks

## 6. Create Tank Entity ✅

**Tasks**
- [x] Define tank class/object
- [x] Add properties:
  - position
  - health
  - angle
  - power
  - alive

**Acceptance Criteria**
- [x] Tank objects can be instantiated
- [x] Tanks have default health
- [x] Tank properties can be modified

---

## 7. Render Tank ✅

**Tasks**
- [x] Represent tank using simple shapes
- [x] Position tank on terrain surface

**Acceptance Criteria**
- [x] Tank mesh appears on terrain
- [x] Tank stays aligned with terrain height
- [x] Tank renders consistently in the scene

---

## 8. Spawn Tanks Randomly ✅

**Tasks**
- [x] Randomly select valid terrain positions
- [x] Avoid overlapping tanks
- [x] Ensure tanks spawn above terrain

**Acceptance Criteria**
- [x] Tanks spawn in random locations
- [x] Tanks never overlap
- [x] Tanks always appear on terrain

---

## 9. Player Tank Identification ✅

**Tasks**
- [x] Assign one tank as player-controlled
- [x] Distinguish player tank visually

**Acceptance Criteria**
- [x] Player tank is clearly identifiable
- [x] Player tank receives input
- [x] Other tanks are AI-controlled

---

# Phase 4 — Player Controls

## 10. Implement Angle Controls ✅

**Tasks**
- [x] Add keyboard input
- [x] Adjust turret angle

**Acceptance Criteria**
- [x] Player can increase/decrease firing angle
- [x] Angle value updates in real time
- [x] Angle stays within valid range

---

## 11. Implement Power Controls ✅

**Tasks**
- [x] Add input for shot power

**Acceptance Criteria**
- [x] Player can increase/decrease shot power
- Power value is displayed
- Power stays within defined limits

---

# Phase 5 — Projectile System

## 12. Create Projectile Object ✅

**Tasks**
- [x] Define projectile entity
- [x] Store velocity and position

**Acceptance Criteria**
- [x] Projectile can be spawned
- [x] Projectile has position and velocity
- [x] Projectile can be rendered

---

## 13. Implement Projectile Physics ✅

**Tasks**
- [x] Apply velocity
- [x] Apply gravity
- [x] Update projectile position each frame

**Acceptance Criteria**
- [x] Projectile follows a curved trajectory
- [x] Gravity affects projectile motion
- [x] Projectile moves smoothly

---

## 14. Fire Projectile ✅

**Tasks**
- [x] Convert angle and power into velocity
- [x] Spawn projectile on player action

**Acceptance Criteria**
- [x] Pressing fire launches projectile
- [x] Projectile originates from tank
- [x] Angle and power affect trajectory

---

# Phase 6 — Collision

## 15. Terrain Collision Detection ✅

**Tasks**
- [x] Detect when projectile hits terrain
- [x] Stop projectile motion

**Acceptance Criteria**
- [x] Projectile stops on terrain contact
- [x] Impact location is detected correctly

---

## 16. Tank Collision Detection ✅

**Tasks**
- [x] Detect projectile hitting tanks

**Acceptance Criteria**
- [x] Projectile hitting tank triggers explosion
- [x] Tank health is reduced

---

# Phase 7 — Explosions and Damage

## 17. Explosion Effect ✅

**Tasks**
- [x] Create explosion event
- [x] Display visual effect

**Acceptance Criteria**
- [x] Explosion occurs on impact
- [x] Explosion location matches impact

---

## 18. Tank Damage System ✅

**Tasks**
- [x] Apply damage within explosion radius
- [x] Reduce tank health

**Acceptance Criteria**
- [x] Tanks within radius lose health
- [x] Damage decreases with distance
- [x] Tanks outside radius are unaffected

---

## 19. Terrain Deformation ✅

**Tasks**
- [x] Modify terrain heightmap near explosion
- [x] Update terrain mesh

**Acceptance Criteria**
- [x] Explosion creates visible crater
- [x] Terrain mesh updates dynamically
- [x] Crater size depends on explosion power

---

## 20. Tank Destruction ✅

**Tasks**
- [x] Detect health ≤ 0
- [x] Trigger destruction explosion
- [x] Remove tank

**Acceptance Criteria**
- [x] Destroyed tank explodes
- [x] Tank disappears after explosion
- [x] Destruction explosion damages nearby tanks

---

# Phase 8 — Turn System

## 21. Implement Turn Manager ✅

**Tasks**
- [x] Track tank turn order
- [x] Move to next tank after shot resolves

**Acceptance Criteria**
- [x] Tanks act one at a time
- [x] Turn order cycles correctly
- [x] Destroyed tanks are skipped

---

## 22. Restrict Actions to Active Tank ✅

**Tasks**
- [x] Allow only active tank to shoot

**Acceptance Criteria**
- [x] Player cannot shoot outside their turn
- [x] AI tanks shoot only during their turn

---

# Phase 9 — AI

## 23. AI Target Selection ✅

**Tasks**
- [x] Select a random enemy tank

**Acceptance Criteria**
- [x] AI targets only alive tanks
- [x] AI never targets itself

---

## 24. AI Aiming ✅

**Tasks**
- [x] Estimate angle and power using physics approximation

**Acceptance Criteria**
- [x] AI projectiles travel toward target
- [x] AI shots can miss

---

## 25. AI Difficulty Levels ✅

**Tasks**
- [x] Add aim error based on difficulty

**Acceptance Criteria**
- [x] Easy AI misses frequently
- [x] Medium AI sometimes hits
- [x] Hard AI hits more consistently

---

# Phase 10 — Game Rules

## 26. Round End Detection ✅

**Tasks**
- [x] Check number of tanks alive

**Acceptance Criteria**
- [x] Round ends when one tank remains
- [x] Winner is declared

---

## 27. Multi-Round Match ✅

**Tasks**
- [x] Reset terrain
- [x] Respawn tanks
- [x] Track rounds

**Acceptance Criteria**
- [x] New terrain generated each round
- [x] Tanks reset correctly
- [x] Multiple rounds can be played

---

# Phase 11 — UI

## 28. HUD Display ✅

**Tasks**
- [x] Display:
  - current tank
  - angle
  - power
  - health

**Acceptance Criteria**
- [x] HUD updates in real time
- [x] HUD shows current player stats

---

## 29. Game Setup Screen ✅

**Tasks**
- [x] Select number of tanks
- [x] Select AI difficulty

**Acceptance Criteria**
- [x] Player can configure match settings
- [x] Settings apply to gameplay

---

# Phase 12 — Polish

## 30. Tank Stability After Terrain Change ✅

**Tasks**
- [x] Tanks fall if terrain below them changes

**Acceptance Criteria**
- [x] Tanks settle on terrain after explosions
- [x] Tanks never float in air

---

## 31. Basic Explosion Particles ✅

**Tasks**
- [x] Add visual particle effects

**Acceptance Criteria**
- [x] Explosion looks visually clear
- [x] Effect disappears after short time

---

# Final Milestone

## 32. Full Playable Game ✅

**Acceptance Criteria**

- [x] Player can configure match
- [x] Random terrain generates
- [x] Tanks spawn randomly
- [x] Turn-based firing works
- [x] Terrain deforms
- [x] Tanks take damage
- [x] Tanks explode when destroyed
- [x] AI competes with player
- [x] Last tank alive wins
- [x] Multiple rounds function correctly

---
