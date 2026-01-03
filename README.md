# Earth Physics Sandbox 🌍

A high-performance falling-sand physics simulator running dynamically in the browser. The simulation features realistic cellular automata physics with over 18 different material types including solids, liquids, gases, and energy particles.

![Sandbox Preview](/screenshot/image.png)

## ✨ Features

### Advanced Physics Engine

- **Density Separation**: Materials sort themselves by density (e.g., Oil floats on Water, Sand sinks).
- **Powder Dynamics**: Sand and Dirt pile up at natural angles of repose.
- **Fluid Mechanics**: Liquids flow to fill available space and equalize pressure.
- **Thermodynamics**: Heat transfer and state changes (Ice melts, Water evaporates).

### Dynamic Material System

Over 18 materials to experiment with:

- **Solids**: Stone, Dirt, Sand, Clay, Metal, Ice
- **Liquids**: Water, Mud, Oil, Lava
- **Gases**: Steam, Smoke, Gas
- **Organic**: Grass, Plants, Wood, Charcoal
- **Energy**: Fire, Electricity, Explosion

### Complex Interactions

Discover hidden chemical reactions:

- `Sand` + `Water` → `Mud`
- `Lava` + `Water` → `Stone` + `Steam`
- `Fire` + `Wood` → `Charcoal` + `Smoke`
- `Electricity` conducts through `Metal` and `Water`
- `Gas` + `Fire` → `Explosion` 💥

## 🚀 Getting Started

### Prerequisites

Because this project uses ES Modules (`import/export`), it must be served via a local web server (opening `index.html` directly will not work due to CORS policies).

### Installation

1. Clone the repository or download the files.
2. Open the project folder in your terminal.
3. Start a local server.

**Using Node.js / npx:**

```bash
npx serve .
```

**Using Python:**

```bash
# Python 3
python -m http.server 3000
```

4. Open your browser to `http://localhost:3000`

## 🎮 Controls

| Control               | Action                           |
| --------------------- | -------------------------------- |
| **Left Click + Drag** | Draw material                    |
| **Mouse Wheel**       | Adjust brush size                |
| **Space**             | Pause / Play simulation          |
| **`[` / `]`**         | Decrease / Increase brush size   |
| **`1` - `5`**         | Quick select material categories |
| **`R`**               | Reset simulation                 |

## 🛠️ Technical Details

- **Engine**: Custom cellular automata engine using chunk-based processing for performance.
- **Rendering**: Canvas 2D API with direct `ImageData` manipulation (no overhead from individual draw calls).
- **Optimization**:
  - Dirty rectangle rendering (only updates changed areas).
  - Bitwise color handling.
  - Efficient neighbor lookups.

## 📝 License

This project is open source and available for personal and educational use.
