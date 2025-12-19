
import { StyleConfig } from './types';

export const STYLE_OPTIONS: StyleConfig[] = [
  {
    id: 'santa',
    name: 'Santa Claus',
    prompt: "Transform into a premium Santa figurine. KEY DETAILS: Red velvet suit, shiny black boots. INTELLIGENT HEADGEAR: Keeps original hats/crowns if present (adding frost), otherwise adds a Santa hat. Preserves glasses/piercings. High-gloss finish.",
    pose: "Standing jovially, holding a sack over one shoulder, waving or making a shushing gesture.",
    icon: "🎅"
  },
  {
    id: 'tree',
    name: 'Tree Costume',
    prompt: "Transform into a cute 3D figurine wearing a rounded, three-tiered Christmas tree costume. KEY DETAILS: Glossy green layers, a large red ribbon bow right under the chin, and colorful ornaments on the body. Gold star topper (if no hat). Adorable mascot aesthetic.",
    pose: "Standing cutely in a puffy tree suit, arms sticking out.",
    icon: "🎄"
  },
  {
    id: 'nutcracker',
    name: 'The Nutcracker',
    prompt: "Transform the character into a premium 3D wooden nutcracker ornament. KEY DETAILS: Rich varnished walnut wood texture, hand-painted gold leaf accents on the uniform, visible wood grain. The character wears a royal red uniform with golden tassels and a tall black shako hat. Maintain facial identity but with a stylized carved wood aesthetic. Cinematic lighting, Octane render.",
    pose: "Standing rigid at attention in a classic nutcracker stance, arms stiff at sides, sturdy wooden base.",
    icon: "💂"
  },
  {
    id: 'angel',
    name: 'Golden Angel',
    prompt: "Create a divine 3D porcelain angel ornament based on this character. KEY DETAILS: Smooth glossy white ceramic texture with real 24k gold edges and filigree. Fluffy, detailed feathered wings spreading out. A glowing, floating golden halo above the head. Soft, ethereal studio lighting, bokeh background, high fidelity.",
    pose: "Floating gently in the air, hands clasped together in prayer, expression peaceful and serene.",
    icon: "👼"
  },
  {
    id: 'cane',
    name: 'Candy Cane',
    prompt: "Render a sophisticated 3D glossy vinyl or resin character figurine standing with a festive candy cane. KEY DETAILS: The candy cane has a realistic hard-candy gloss. The character wears a stylish winter coat or scarf. Elegant proportions (not chibi). Bright, festive lighting.",
    pose: "Standing confidently, holding the candy cane like a staff or leaning against it.",
    icon: "🍬"
  },
  {
    id: 'globe',
    name: 'Snow Globe',
    prompt: "Encapsulate the character inside a high-quality 3D glass snow globe. KEY DETAILS: Realistic glass refraction and reflection. The character stands inside on a bed of glittering white snow. Golden flakes are suspended in the air around them. The base is an ornate antique gold stand. Magical atmosphere, volumetric lighting.",
    pose: "Standing centrally inside the glass sphere, looking outwards with wonder, hands touching the glass.",
    icon: "🔮"
  },
  {
    id: 'horse',
    name: 'Rocking Horse',
    prompt: "Transform the character into a vintage toy rider on a wooden rocking horse. KEY DETAILS: The rocking horse is painted deep red with gold scrollwork, looking like a classic antique toy. The character is styled as a high-quality figurine sitting on top. polished wood and enamel textures. Studio photography style.",
    pose: "Sitting securely on the saddle, hands holding the handles, frozen in a mid-rocking motion.",
    icon: "🐴"
  }
];

export const MOCK_WALLET_ADDRESS = "0x71C...9A21";
export const MOCK_ARC_GAS_FEE = 0.05; // USDC
