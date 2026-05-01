export interface Pattern {
  id: string; // The primary ID to be used for the image map (e.g., huaban-1, huaban-2)
  categoryId: string; // The category (huaban, jihe, dongwu, xuanwen)
  categoryName: string; // User-facing category name
  name: string; // Variant name
  info: string; // Empty now
  file: string; // File path
  ratio: number;
}

export interface StampItem {
  kind: 'svg';
  x: number;
  y: number;
  sizeH: number;
  rotation: number;
  flipX: boolean;
  alpha: number;
  start: number;
  duration: number;
  patternId: string;
}

export interface LsysSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
}

export interface LsysTree {
  segs: LsysSegment[];
  reveal: number;
  step: number;
  patternId: string;
}

export interface SceneState {
  items: StampItem[];
  bands: { idx: number }[];
  repeat4: { pattern: any; tiles: Set<string> };
  skeleton: any;
  rosettes: any[];
  ifs: { slots: any[]; filled: Set<string>; done: boolean };
  lsys: { trees: Record<string, LsysTree> };
}

export type GenerationMode = 'repeat2' | 'repeat4' | 'shapeGrammar' | 'lsys' | 'ifs';

export const PATTERNS: Pattern[] = [
  // 花瓣纹
  { id: "huaban-1", categoryId: "huaban", categoryName: "花瓣纹", name: "花瓣纹 1-1", info: "", file: "/assests/pattern/花瓣纹1-1.svg", ratio: 1.0 },
  { id: "huaban-2", categoryId: "huaban", categoryName: "花瓣纹", name: "花瓣纹 1-2", info: "", file: "/assests/pattern/花瓣纹1-2.svg", ratio: 1.0 },
  { id: "huaban-3", categoryId: "huaban", categoryName: "花瓣纹", name: "花瓣纹 1-3", info: "", file: "/assests/pattern/花瓣纹1-3.svg", ratio: 1.0 },
  { id: "huaban-4", categoryId: "huaban", categoryName: "花瓣纹", name: "花瓣纹 1-4", info: "", file: "/assests/pattern/花瓣纹1-4.svg", ratio: 1.0 },
  { id: "huaban-5", categoryId: "huaban", categoryName: "花瓣纹", name: "花瓣纹 1-5", info: "", file: "/assests/pattern/花瓣纹1-5.svg", ratio: 1.0 },

  // 几何纹
  { id: "jihe-1", categoryId: "jihe", categoryName: "几何纹", name: "几何纹 1-1", info: "", file: "/assests/pattern/几何纹1-1.svg", ratio: 1.0 },
  { id: "jihe-2", categoryId: "jihe", categoryName: "几何纹", name: "几何纹 1-2", info: "", file: "/assests/pattern/几何纹1-2.svg", ratio: 1.0 },
  { id: "jihe-3", categoryId: "jihe", categoryName: "几何纹", name: "几何纹 1-3", info: "", file: "/assests/pattern/几何纹1-3.svg", ratio: 1.0 },
  { id: "jihe-4", categoryId: "jihe", categoryName: "几何纹", name: "几何纹 1-4", info: "", file: "/assests/pattern/几何纹1-4.svg", ratio: 1.0 },
  { id: "jihe-5", categoryId: "jihe", categoryName: "几何纹", name: "几何纹 1-5", info: "", file: "/assests/pattern/几何纹1-5.svg", ratio: 1.0 },

  // 动物纹
  { id: "dongwu-1", categoryId: "dongwu", categoryName: "动物纹", name: "动物纹 1-1", info: "", file: "/assests/pattern/动物纹1-1.svg", ratio: 1.0 },
  { id: "dongwu-2", categoryId: "dongwu", categoryName: "动物纹", name: "动物纹 1-2", info: "", file: "/assests/pattern/动物纹1-2.svg", ratio: 1.0 },
  { id: "dongwu-3", categoryId: "dongwu", categoryName: "动物纹", name: "动物纹 1-3", info: "", file: "/assests/pattern/动物纹1-3.svg", ratio: 1.0 },
  { id: "dongwu-4", categoryId: "dongwu", categoryName: "动物纹", name: "动物纹 1-4", info: "", file: "/assests/pattern/动物纹1-4.svg", ratio: 1.0 },
  { id: "dongwu-5", categoryId: "dongwu", categoryName: "动物纹", name: "动物纹 1-5", info: "", file: "/assests/pattern/动物纹1-5.svg", ratio: 1.0 },

  // 旋纹
  { id: "xuanwen-1", categoryId: "xuanwen", categoryName: "旋纹", name: "旋纹 1-1", info: "", file: "/assests/pattern/旋纹1-1.svg", ratio: 1.0 },
  { id: "xuanwen-2", categoryId: "xuanwen", categoryName: "旋纹", name: "旋纹 1-2", info: "", file: "/assests/pattern/旋纹1-2.svg", ratio: 1.0 },
  { id: "xuanwen-3", categoryId: "xuanwen", categoryName: "旋纹", name: "旋纹 1-3", info: "", file: "/assests/pattern/旋纹1-3.svg", ratio: 1.0 },
  { id: "xuanwen-4", categoryId: "xuanwen", categoryName: "旋纹", name: "旋纹 1-4", info: "", file: "/assests/pattern/旋纹1-4.svg", ratio: 1.0 },
  { id: "xuanwen-5", categoryId: "xuanwen", categoryName: "旋纹", name: "旋纹 1-5", info: "", file: "/assests/pattern/旋纹1-5.svg", ratio: 1.0 },
];

export const PALETTE = [
  '#9F2B24', // 仰韶红
  '#3A1F15', // 焦褐
  '#67382A',
  '#8F4834',
  '#AC7151',
  '#B9522F',
  '#CE713C',
  '#D6C8CA',
  '#C9A48B',
  '#ECB576',
  '#FFFFFF'  // 白色
];
