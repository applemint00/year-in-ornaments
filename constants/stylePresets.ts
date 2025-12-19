
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
- **FORCE FRONT VIEW**: The character MUST face forward looking directly at the camera. NO back views, NO side profiles.
- Preserve the exact facial features, expression, and eye shape of the input PFP.
- If it's an animal, keep the species and fur pattern visible from the front.
- If it's a human/anime, keep the hairstyle and distinctive accessories.

2. MATERIAL CONVERSION:
- Convert the 2D image into a "glossy 3D painted figurine" texture.
- Do NOT just paste the flat image. Make it look like a sculpted object.

3. COLOR:
- Retain the character's original main colors (hair, skin, fur).
`;

export const NEGATIVE_PROMPT = `
Avoid these elements:
back view, side view, looking away, rear shot,
realistic human skin texture, hairy/furry noise, felt fabric texture,
flat 2D sticker look, paper cutout, floating head, distorted face,
extra limbs, bad anatomy, text, watermark, blurry main subject,
grayscale, low resolution, babyish proportions (unless specified).
`;

export const ORNAMENT_STYLES: Record<string, string> = {
  santa: `
Style: Luxury Santa Edition.
The character is wearing a high-quality Red Velvet Santa Suit with white fur trim.
Material: Sculpted glossy porcelain/resin (not fuzzy fabric).
HEADGEAR RULE: If the character is already wearing a hat, helmet, or crown, KEEP IT and add frost or a holly berry accent. IF NOT, add a classic Red Santa Hat.
FACE DETAILS: Strictly preserve glasses, piercings, and facial jewelry.
FEET: Wearing shiny Black Leather Boots.
Pose: Standing front-facing, holding a golden bell or toy sack.
Vibe: Premium collectible, warm, festive.
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
Style: Snow Globe Ornament.
A spherical glass snow globe with a gold-accented burgundy base.
Inside the glass: The character stands as a tiny figurine, surrounded by swirling white snow particles.
The glass has realistic reflections.
Vibe: Magical, enclosed, winter wonderland.
`,

  horse: `
Style: Rocking Horse Ornament.
A glossy red vintage rocking horse with gold saddle details.
Pose: The character is riding the rocking horse, sitting securely in the saddle.
Hands are holding the handles or the horse's neck.
Vibe: Nostalgic, dynamic, toy-like.
`,
};
