import { env } from "../../../env";

export const buildPrompt = (
  keywords: string[],
): string => {
  const cleanKeywords = keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, env.SERVICES?.THUMBNAIL_GENERATOR?.MAX_KEYWORDS ?? 3);

  const keywordPhrase = cleanKeywords.join(", ");

  const prompt = `
minimalist app icon, flat vector illustration, simple geometric shape representing ${keywordPhrase}
modern corporate UI design, clean lines, bold shapes,
centered composition, isolated object,
2D icon, no perspective, no depth,
limited color palette, high contrast,
white or transparent background,
SVG style, Figma UI icon style
  `.trim();

  return prompt;
};

export const NEGATIVE_PROMPT = `
photorealistic, 3D, realistic lighting, shadows, gradients,
textures, bevel, emboss, gloss,
illustration, painting, sketch, hand drawn,
complex shapes, thin lines, tiny details,
background pattern, scenery,
text, letters, numbers, watermark, logo text,
blurry, low resolution, noise, artifacts
`.trim();
