
export const ORNAMENT_BASE = `
A high-end, handcrafted Christmas ornament made of glossy sculpted porcelain and resin.
Refined vintage European holiday aesthetics.
Hanging from a deep burgundy satin ribbon tied in a bow.

Background: A softly blurred, cozy Christmas setting with warm golden bokeh lights, 
deep green pine needles, and glowing fairy lights in the background.
Cinematic lighting, shallow depth of field, macro photography focus on the ornament.

Material: The character and object look like a single, unified 3D glossy figurine.
Reflections: Soft golden studio highlights reflecting naturally on the curved surfaces.
`;

export const IDENTITY_RULES = `
CRITICAL INSTRUCTION: Integrate the user's input character as a 3D miniature figurine.

1. FACE & IDENTITY (STRICT):
- FORCE FRONT VIEW: The character MUST face forward looking directly at the camera. NO back views, NO side profiles, NO 3/4 angle.
- Preserve the exact facial features, expression, and eye shape of the input PFP.
- Preserve distinctive accessories exactly (glasses/crown/hat/helmet). Do NOT remove them.
- Preserve the PFP’s overall vibe and recognizable silhouette.

2. MATERIAL CONVERSION (STRICT):
- Convert the 2D image into a glossy 3D painted figurine texture.
- Do NOT just paste the flat image; it must look like a sculpted object (hand-painted toy / collectible figurine).
- Do NOT change the character’s material style beyond “glossy 3D painted figurine.”

3. COLOR (STRICT):
- Retain the character's original main colors (hair/skin/fur/primary body colors).
- Do NOT recolor the character. Do NOT introduce a new dominant palette.

4. OUTFIT & BODY READABILITY (STRICT):
- The character must have a readable full-body outfit structure (TOP + BOTTOM separation).
- If the PFP already implies clothing: preserve the clothing mood and adapt it into the figurine sculpt.
- If the PFP has no clear clothing (mascot/simple body):
  - Create a two-piece outfit (top + bottom) that matches the PFP’s existing colors and mood (NO new palette).
  - Always add footwear (boots/shoes) consistent with the PFP palette.
  - Keep it subtle and “in-universe” for that PFP (not random cosplay).
- PROPORTION RULE: Keep the original PFP’s age/proportion vibe. Do NOT turn into a baby/toddler/chibi.
- Keep normal limb length and body-to-head ratio (no oversized head).
- GENDER RULE: If the character’s gender is ambiguous, keep styling neutral/unisex (no exaggerated masculine/feminine body cues).

5. HOLIDAY ACCENTS (ALLOWED, BUT MUST RESPECT COLOR RULES):
- You may add subtle Santa/holiday accents ONLY as small accessories and trims (e.g., white fur trim, tiny holly pin, small festive stitching).
- If adding a hat: it must not replace existing headgear. Add it as an accessory layer ONLY if it does not conflict.
- Any added accessories must stay within the character’s original color palette (no forced red suit).

6. PROPS (OPTIONAL, ALLOWED WITH CONSTRAINTS):
- The character may hold:
  - a BIG gift sack worn on the back/shoulder (large, clearly visible), and/or
  - a small golden bell.
- Props must be integrated as sculpted 3D elements (not flat overlays).
- Props should not overpower the character’s identity.

7. TEXT NOTE:
- If the original PFP contains text on clothing, treat it as hand-painted/engraved and keep it subtle; readability is not guaranteed.
`;


export const NEGATIVE_PROMPT = `
Avoid these elements:
back view, side view, looking away, rear shot,
realistic human skin texture, hairy/furry noise, felt fabric texture,
flat 2D sticker look, paper cutout, floating head, distorted face,
extra limbs, bad anatomy, watermark, signature, caption, logo,
blurry main subject, grayscale, low resolution,
babyish proportions, chibi, toddler body, oversized head, short limbs.
`;


export const ORNAMENT_STYLES: Record<string, string> = {
 santa: `
Style: Luxury Santa Edition (identity-first).

ABSOLUTE RULE (MOST IMPORTANT):
- Keep the user's PFP identity EXACTLY (same character species, face, eyes, mouth, markings, accessories).
- Do NOT replace the character with a different animal or mascot.
- Do NOT change the head shape or simplify into a generic cute face.

Material:
- Premium collectible sculpture made of glossy porcelain/resin.
- NOT plush, NOT fuzzy, NOT fabric-looking.

Outfit:
- High-quality red velvet Santa suit with clean white fur trim.
- Sculpted resin look, sharp edges, premium finish.
- Keep the original PFP character proportions and design language.

HEADGEAR RULE (OVERRIDE):
- ALWAYS add a classic red Santa hat.
- If the character already has a hat, helmet, hood, crown, or headpiece:
  the Santa hat is worn ON TOP OF the existing headgear.
- The Santa hat may be slightly tilted, layered, or clipped on.
- Do NOT remove or replace the original headgear.


FACE DETAILS (STRICT):
- Preserve glasses, facial jewelry, eye shape, expression, and markings exactly.

PROP DETAIL (VERY IMPORTANT):
- A LARGE rustic gift sack is worn ON THE BACK, clearly strapped like a backpack.
- The sack is oversized, heavy-looking, and filled with wrapped presents.
- Material: warm brown leather/wood texture, sculpted as part of the ornament.
- The gift sack must NOT be held in hand — it is fully back-mounted.

EXTRA PROP:
- The character is ALSO holding a small shiny golden bell in one hand.
- The bell is metallic gold, reflective, and clearly visible.

Pose:
- Front-facing, standing.
- Stable, collectible figurine posture.

Feet:
- Shiny black leather Santa boots.

Vibe:
- High-end Christmas ornament.
- Premium collectible toy.
- Warm festive lighting, studio-quality render.
`,

  tree: `
Style: Cute Tiered Tree Costume.
The character is wearing a rounded, three-tiered Christmas tree outfit (puffy layers like a snowman, but tree-shaped).
Material: Glossy Deep Green Ceramic/Resin.
NECK: A large, festive Red Satin Ribbon Bow tied just below the character's face.
BODY DETAILS: The tree layers are decorated with colorful metallic ornament balls and gold tinsel molded into the suit.
HEADGEAR RULE: If the character is already wearing a hat, KEEP IT. IF NOT, add a bright Golden Star topper on their head.
FEET: Cute glossy boots sticking out from the bottom tier.
Pose: Standing with arms sticking out from the middle tier, looking adorable and festive.
Vibe: High-end collectible vinyl toy, cute mascot, festive.
`,

  angel: `
Style: Angel Ornament.
Transform the character into a cute angel figurine with glossy white ceramic wings and a golden halo.
The character is wearing a flowing robe with gold accents.
Pose: Floating gently, hands clasped together or holding a small star, with feet dangling.
Vibe: Ethereal, peaceful, and holy.
`,

  nutcracker: `
Style: Nutcracker Soldier Ornament.
Transform the character into a nutcracker-style wooden/resin figure.
Body: Wearing a traditional red soldier uniform with gold buttons, epaulettes, and black boots.
Pose: Standing upright in a stiff but cute soldier stance.
The character's head replaces the nutcracker's head, preserving the PFP's identity.
Vibe: Classic, disciplined, traditional toy.
`,

  cane: `
Style: Candy Cane Elegance.
A large, glossy red-and-white striped candy cane.
Pose: The character stands elegantly next to the candy cane, holding it like a staff or leaning one arm against it coolly.
Proportions: Realistic figurine proportions (not chibi/baby).
Texture: Smooth porcelain with gold accents.
Vibe: Stylish, sophisticated, classic holiday.
`,

globe: `
Style: Snow Globe Ornament (upper-body focus, premium collectible).

Structure:
- A clear spherical glass snow globe with realistic thickness and reflections.
- Gold-accented deep burgundy base with subtle metallic trim.

Character (STRICT):
- The user's character appears as a 3D miniature figurine, UPPER BODY ONLY (bust).
- Front-facing, centered, neutral/unisex styling if gender is ambiguous.
- Preserve exact PFP identity (face, eyes, expression, accessories, colors).
- Glossy painted porcelain/resin material (not plush, not fabric).

Text Element (IMPORTANT – PHYSICAL OBJECT):
- Below the character’s upper body, inside the globe, place a solid sculpted text object reading:
  “2026”
- The text is NOT flat text.
- Material: metallic gold, embossed, slightly beveled edges.
- Finish: polished gold with soft reflections (luxury ornament quality).
- Mounted on a small snowy pedestal or integrated base plate.
- The text must feel like part of the sculpture, not floating, not printed.

Environment:
- Fine white snow particles floating naturally inside the globe.
- Snow accumulates lightly on the base and around the “2026” text.

Lighting:
- Warm, soft holiday lighting.
- Subtle highlights on glass curvature and gold text.

Vibe:
- Elegant, timeless, museum-grade Christmas ornament.
- Quiet, emotional, keepsake-like.
`,


  horse: `
Style: Rocking Horse Ornament.
A glossy red vintage rocking horse with gold saddle details.
Pose: The character is riding the rocking horse, sitting securely in the saddle.
Hands are holding the handles or the horse's neck.
Vibe: Nostalgic, dynamic, toy-like.
- NO CHIBI / NO BABY PROPORTIONS: Avoid toddler-like pose, avoid oversized head, keep mature/normal figurine proportions.
- Pose: confident seated rider posture, upright torso, clear shoulder line (not hunched baby sit).
negative_prompt: "chibi, baby, toddler, childlike proportions, big head, stubby limbs, kawaii baby, infant"

`,
};