import { ImagePromptInput } from '@/types';
import { LOGO_PALETTE_PRESETS } from './logo-prompts';

export interface LogoMockupPreset {
  id: string;
  label: string;
  category: 'Digital & Apps' | 'Print & Paper' | 'Retail & Outdoor' | 'Apparel & Merch';
  iconName: string;
  description: string;
  aspectRatio: string;
  generatePrompt: (input: ImagePromptInput) => string;
}

export const LOGO_MOCKUP_PRESETS: LogoMockupPreset[] = [
  {
    id: 'mobile-app-icon',
    label: 'iOS / Android App Icon',
    category: 'Digital & Apps',
    iconName: 'Smartphone',
    description: 'Clean rounded-squircle mobile app icon centered on a high-end smartphone OLED lock screen.',
    aspectRatio: '1:1',
    generatePrompt: (input) => {
      const brand = input.brandName?.trim() || input.subject || 'brand mark';
      const palette = LOGO_PALETTE_PRESETS.find((p) => p.id === input.palette);
      const colorDesc = palette ? palette.hint : 'restrained modern palette';
      return `Photorealistic 3D product shot of a premium mobile app icon for "${brand}". The app icon is an Apple iOS continuous squircle, featuring the minimalist vector logo mark in ${colorDesc} on a matte dark titanium glass surface. Floating slightly above a modern smartphone OLED screen with soft ambient reflections, studio rim lighting, 8k resolution, razor-sharp focus, shallow depth of field --ar 1:1 --style raw`;
    },
  },
  {
    id: 'stationery-foil-business-card',
    label: 'Stationery & Foil Business Card',
    category: 'Print & Paper',
    iconName: 'Layers',
    description: '600gsm heavy cotton business card with metallic hot-foil stamping on travertine stone.',
    aspectRatio: '16:9',
    generatePrompt: (input) => {
      const brand = input.brandName?.trim() || input.subject || 'brand mark';
      return `Luxury brand stationery mockup for "${brand}". Premium 600gsm extra-thick uncoated cotton business cards resting on an Italian travertine stone surface. The brand logo is rendered with delicate metallic gold foil debossing with tactile raised texture. Elegant side lighting from a nearby window casting soft elongated shadows, macro 100mm lens, ultra-shallow depth of field, authentic paper fiber micro-detail --ar 16:9 --style raw`;
    },
  },
  {
    id: 'storefront-blade-sign',
    label: 'Architectural Storefront Blade Sign',
    category: 'Retail & Outdoor',
    iconName: 'Square',
    description: 'Matte black metal blade sign illuminated by warm spotlight on a raw architectural concrete facade.',
    aspectRatio: '16:9',
    generatePrompt: (input) => {
      const brand = input.brandName?.trim() || input.subject || 'brand mark';
      return `Architectural exterior photograph of a flagship boutique storefront for "${brand}". A minimalist circular matte black metal blade sign mounted on raw architectural concrete. The brand logo "${brand}" is precision laser-cut and illuminated by a discreet warm 3000K overhead spotlight. Dusk blue-hour atmosphere, moody street reflections, 35mm documentary photography, sharp geometric lines --ar 16:9 --style raw`;
    },
  },
  {
    id: 'luxury-rigid-packaging',
    label: 'Luxury Rigid Packaging Box',
    category: 'Print & Paper',
    iconName: 'Sparkles',
    description: 'Rigid luxury matte gift box with spot-UV debossed logo and grosgrain ribbon.',
    aspectRatio: '4:5',
    generatePrompt: (input) => {
      const brand = input.brandName?.trim() || input.subject || 'brand mark';
      return `High-end commercial packaging photography of a bespoke rigid presentation box for "${brand}". Matte midnight-slate textured cardboard box with the brand logo elegantly stamped with glossy spot-UV varnish, catching crisp specular highlights. Surrounded by shallow depth of field, studio softbox lighting with silver bounce fill, clean commercial catalog quality --ar 4:5 --style raw`;
    },
  },
  {
    id: 'embroidered-hoodie-patch',
    label: 'Embroidered Apparel & Hoodie',
    category: 'Apparel & Merch',
    iconName: 'Crown',
    description: 'Micro-stitched high-density thread embroidery patch on heavy 450gsm organic cotton hoodie.',
    aspectRatio: '1:1',
    generatePrompt: (input) => {
      const brand = input.brandName?.trim() || input.subject || 'brand mark';
      return `Extreme macro photograph of high-density textile thread embroidery on the left chest of a heavy 450gsm organic cotton hoodie for "${brand}". The brand logo is intricately stitched with high-tensile silk thread, showing individual embroidery loops and tactile weave texture. Raking studio side light accentuating fabric grain, 85mm macro lens, ultra-sharp detail --ar 1:1 --style raw`;
    },
  },
];
