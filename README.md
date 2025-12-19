# Monad Ornament Studio 🎄

Turn your PFP into a 3D Christmas Ornament using Gemini Vision AI.

## 📍 Checkpoint 1: Local Setup

Follow these steps to run the project locally.

### 1. Install Dependencies
Open your terminal in this folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the root directory and add your API key:
```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
*(Do not share this file or commit it to GitHub)*

### 3. Add Assets (Optional but Recommended)
For the best experience, ensure these files exist in your `public` folder:
- `public/hand_card.png` (For the wallet entry animation)
- `public/textures/snow_normal.png` (For the 3D snow floor)
- `public/textures/README.md` (Instructions provided)

### 4. Run Development Server
```bash
npm run dev
```
Open the localhost URL provided in the terminal (usually http://localhost:5173).

## Features
- **Wallet Entry:** Cool guestlist animation.
- **Gemini AI:** Transforms 2D images into 3D-style ornaments via `gemini-2.5-flash-image`.
- **Arc/Circle Wallet:** Simulation mode included for minting flow.
- **3D Tree:** Interactive React Three Fiber scene.
