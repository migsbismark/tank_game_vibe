
# Tank Artillery Game – Software Specification

## 1. Overview

### 1.1 Purpose

The purpose of this software is to implement a **2D turn-based artillery tank game** playable in a web browser. The player controls one tank and competes against AI-controlled tanks. Each tank takes turns firing projectiles using angle and power controls. Terrain can block shots and is destructible.

The game follows gameplay concepts similar to classic artillery games such as Scorched Earth and Worms.

### 1.2 Platform

* Web Browser
* Desktop focus (keyboard/mouse)

### 1.3 Technology Stack

| Component              | Technology                |
| ---------------------- | ------------------------- |
| Rendering              | Three.js                  |
| Programming Language   | JavaScript                |
| Physics                | Custom physics simulation |
| Terrain Representation | Heightmap array           |
| Graphics               | Simple geometric meshes   |

---

# 2. Gameplay Overview

### Game Flow

1. Player selects:

   * Number of tanks (2–5)
   * AI difficulty
2. Game generates random terrain.
3. Tanks are placed randomly on terrain.
4. Tanks take turns shooting in round-robin order.
5. Each tank fires one projectile per turn.
6. Terrain and tanks take damage from explosions.
7. Destroyed tanks are removed after exploding.
8. Round ends when only one tank remains.
9. Multiple rounds are played per match.

---

# 3. Functional Requirements

## 3.1 Tank System

Each tank must include:

| Property | Description     |
| -------- | --------------- |
| position | x,y coordinate  |
| health   | starting HP     |
| angle    | firing angle    |
| power    | firing strength |
| alive    | boolean state   |

### Tank Behavior

* Tanks **cannot move**
* Tanks can **aim and shoot**
* Each tank gets **one shot per turn**
* Tanks are destroyed when **health ≤ 0**

### Tank Explosion

When destroyed:

* Tank explodes
* Explosion causes **area damage**
* Terrain deformation occurs

---

# 4. Terrain System

## 4.1 Terrain Representation

Terrain is represented as:

```
heightmap[x] = terrain height
```

Example:

```
[12, 15, 18, 20, 19, 17, 14, 10]
```

### Terrain Generation

Random terrain generated using noise or randomized hills.

Example algorithm:

```
height[x] = baseHeight + randomVariation
```

---

## 4.2 Terrain Deformation

Explosions create **craters**.

Algorithm:

```
for each terrain point within explosion radius:
    distance = distance(point, explosionCenter)
    deformation = explosionPower * (1 - distance/radius)
    height[x] -= deformation
```

Terrain deformation rules:

* Terrain absorbs projectile impact
* Craters reduce terrain height
* Tanks may fall if terrain under them changes

---

# 5. Projectile System

## 5.1 Firing Mechanics

Player controls:

* Angle (degrees)
* Power (force)

Projectile initial velocity:

```
vx = power * cos(angle)
vy = power * sin(angle)
```

Gravity applied each frame:

```
vy = vy - gravity * deltaTime
```

Position update:

```
x = x + vx * deltaTime
y = y + vy * deltaTime
```

---

## 5.2 Collision Detection

Projectile stops when:

1. Hits terrain
2. Hits tank
3. Leaves map boundary

---

# 6. Damage System

## 6.1 Explosion Damage

Explosion affects all tanks within radius.

Damage formula:

```
damage = maxDamage * (1 - distance/radius)
```

Terrain deformation also occurs.

---

## 7. Turn System

Turn order follows **round-robin scheduling**.

Example with 4 tanks:

```
Tank1 → Tank2 → Tank3 → Tank4 → Tank1 ...
```

Turn steps:

1. Tank aims
2. Tank fires projectile
3. Projectile simulation runs
4. Explosion resolves
5. Check tank deaths
6. Next tank turn

---

# 8. Artificial Intelligence

AI tanks use **physics-based aiming**.

AI algorithm:

1. Select a target tank
2. Estimate distance
3. Calculate approximate angle
4. Adjust power
5. Fire projectile

Basic approach:

```
angle ≈ arctan(distance / heightDifference)
power ≈ distance * difficultyModifier
```

Difficulty settings affect:

| Difficulty | Behavior           |
| ---------- | ------------------ |
| Easy       | Large aiming error |
| Medium     | Moderate error     |
| Hard       | Small error        |

Random noise added:

```
angle += random(-error, error)
power += random(-error, error)
```

---

# 9. Rendering System

Graphics implemented using Three.js.

### Scene Elements

| Object     | Implementation                |
| ---------- | ----------------------------- |
| Terrain    | Mesh generated from heightmap |
| Tanks      | Simple boxes + turret         |
| Projectile | Sphere                        |
| Explosions | Particle effect               |

Camera:

* Fixed **side view**
* Orthographic camera recommended

---

# 10. User Interface

### Player Controls

| Control          | Function     |
| ---------------- | ------------ |
| Arrow Up/Down    | Adjust angle |
| Arrow Left/Right | Adjust power |
| Spacebar         | Fire         |

### HUD Elements

Display:

* Tank health
* Current angle
* Current power
* Current turn

---

# 11. Game Configuration

Player can configure:

| Setting         | Range                |
| --------------- | -------------------- |
| Number of tanks | 2–5                  |
| AI difficulty   | Easy / Medium / Hard |

---

# 12. Game End Conditions

Round ends when:

```
aliveTanks == 1
```

Winner = last tank alive.

Match consists of **multiple rounds**.

---

# 13. Non-Functional Requirements

### Performance

* 60 FPS target
* Efficient projectile simulation

### Compatibility

* Chrome
* Firefox
* Edge
* Safari

### Maintainability

* Modular JavaScript architecture
* Separate systems:

  * Physics
  * Terrain
  * AI
  * Rendering

---

# 14. Suggested Architecture

```
Game
 ├── TerrainSystem
 ├── TankSystem
 ├── ProjectileSystem
 ├── TurnManager
 ├── AISystem
 ├── PhysicsEngine
 └── Renderer (Three.js)
```

---

# 15. Example Game Loop

```
while(gameRunning):

    currentTank = TurnManager.getCurrentTank()

    if currentTank.isPlayer:
        waitForPlayerInput()

    else:
        AI.takeShot()

    simulateProjectile()

    resolveExplosion()

    updateTerrain()

    removeDestroyedTanks()

    TurnManager.next()
```

---