/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Undo2, Redo2, RotateCcw, Download, QrCode, Share2, 
  MoveHorizontal, Grid3X3, Network, TreeDeciduous, Flower2,
  Plus, Minus, Upload, Monitor, Smartphone, Tablet, ChevronDown,
  Box, Sparkles, ChevronRight, ChevronLeft, UploadCloud, Compass,
  Landmark, ArrowLeft, Heart, Star, Brush
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PanelGroup, 
  Panel, 
  PanelResizeHandle 
} from 'react-resizable-panels';
import { cn } from './lib/utils';
import { PATTERNS, PALETTE, Pattern, StampItem, GenerationMode, SceneState, LsysTree } from './types';
import PotteryPreview, { PotteryPreviewHandle } from './components/PotteryPreview';
import { QRCodeSVG } from 'qrcode.react';

const CANVAS_SIZES = [
  { id: 'free', name: '自由尺寸 (自适应)', width: 0, height: 0, icon: <Monitor size={14} /> },
  { id: '2000x3000', name: '2000 × 3000', width: 2000, height: 3000, icon: <Monitor size={14} /> },
  { id: 'mobile', name: '手机屏幕壁纸 2043×4421', width: 2043, height: 4421, icon: <Smartphone size={14} /> },
  { id: 'ipad', name: 'iPad Pro 12.9英寸 3695×3225', width: 3695, height: 3225, icon: <Tablet size={14} /> },
];

const CONFIG = {
  animDuration: 520,
  animStagger: 8,
  maxItems: 260000,

  r2_baseSize: 52,
  r2_stepMul: 1.10,
  r2_rowGapMul: 1.05,
  r2_paddingMul: 0.16,
  r2_bandGapPx: 12,

  r4_motifSizePx: 42,
  r4_tileSizePx: 260,
  r4_motifsPerQuadrant: 3,
  r4_minDistMul: 1.1,
  r4_motifScaleJitter: 0.18,
  r4_motifRotJitterDeg: 18,
  r4_checkerFlip: true,

  sg_targetCellPx: 240,
  sg_marginMul: 0.04,
  sg_marginMin: 14,
  sg_rosetteN: 12,
  sg_rosetteRadiusMul: 0.40,
  sg_petalSizeMul: 0.36,
  sg_safetyMul: 0.48,

  sg_rosetteMinN: 6,
  sg_rosetteMaxN: 12,
  sg_petalGapMul: 0.38,
  sg_flameGapMul: 0.52,

  ifs_marginMul: 0.06,
  ifs_cellTargetPx: 320,
  ifs_gapMul: 0.07,
  ifs_bigRCellMul: 0.30,
  ifs_smallRCellMul: 0.16,
  ifs_snapTolMul: 1.35,
  ifs_lockFilled: true,

  ifs_minBubblePx: 7.5,
  ifs_maxBubblesPerSlot: 700,

  ifs_svgFit: 0.92,
  ifs_svgAlpha: 0.95,
  ifs_svgRotJitter: 0.45,
  ifs_svgFlipProb: 0.35
};

function GalleryPage({ onBack }: { onBack: () => void }) {
  const exhibitionImages = [
    { src: '/assests/exhibition/1.jpg', id: 1019, type: 'NFT', author: '林深见鹿' },
    { src: '/assests/exhibition/2.jpg', id: 1020, type: 'Public', author: '墨染青丝' },
    { src: '/assests/exhibition/3.jpg', id: 1021, type: 'NFT', author: '云端漫步者' },
    { src: '/assests/exhibition/4.jpg', id: 1022, type: 'Public', author: '星空下的陶匠' },
    { src: '/assests/exhibition/5.jpg', id: 1025, type: 'NFT', author: '算法诗人_01' },
    { src: '/assests/exhibition/6.jpg', id: 1026, type: 'Public', author: '青铜时代' },
    { src: '/assests/exhibition/7.jpg', id: 1027, type: 'NFT', author: '数字仰韶_Labs' },
    { src: '/assests/exhibition/1.jpg', id: 1028, type: 'Public', author: '流沙河' },
    { src: '/assests/exhibition/2.jpg', id: 1029, type: 'NFT', author: '极简主义者' },
  ];

  return (
    <div className="w-screen h-screen overflow-y-auto bg-[#f5f5f0] p-8 font-sans text-stone-800 shrink-0">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-stone-50 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-[#9F2B24]"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#9F2B24] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-serif-sc font-bold text-[#9F2B24]">仰韶·重构 | 艺术展厅</h1>
              <p className="text-[10px] text-stone-400 mt-1 tracking-widest uppercase">Algorithmic Pottery Gallery</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => alert('提交作品功能即将上线！')}
          className="flex items-center gap-2 px-6 py-3 bg-[#9F2B24] text-white rounded-full shadow-lg font-bold hover:bg-[#85221c] transition-all hover:scale-105"
        >
          <UploadCloud size={18} /> 提交我的作品
        </button>
      </header>
      <main className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exhibitionImages.map((img, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group flex flex-col relative overflow-hidden">
            {/* "Welcome to collaborate" Ribbon for Public items */}
            {img.type === 'Public' && (
              <div className="absolute top-0 right-0 z-10 pointer-events-none">
                <div className="bg-[#9F2B24] text-white text-[14px] font-bold py-3 px-20 transform rotate-45 translate-x-[35%] translate-y-[25%] shadow-xl border-b border-white/20 whitespace-nowrap tracking-widest text-center flex items-center justify-center">
                  欢迎共同创作
                </div>
              </div>
            )}

            <div className="aspect-[3/4] bg-stone-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
              <img 
                src={img.src} 
                alt={`Artwork ${img.id}`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            <div className="px-2 flex flex-col flex-1">
              <h3 className="font-bold text-sm text-stone-800">重构序列 #{img.id}</h3>
              <div className="flex justify-between items-end mt-auto pt-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-stone-400">由 {img.author} 生成</p>
                  <div className="flex gap-3 items-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); alert('已点赞！'); }}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                      title="点赞"
                    >
                      <Heart size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); alert('已收藏！'); }}
                      className="text-stone-400 hover:text-yellow-500 transition-colors"
                      title="收藏"
                    >
                      <Star size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Single Label */}
                <div className="w-[84px]">
                  {img.type === 'NFT' ? (
                    <div className="w-full py-1.5 bg-black text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-sm flex items-center justify-center gap-1.5">
                      <Sparkles size={10} className="text-yellow-400" />
                      <span>NFT 认证</span>
                    </div>
                  ) : (
                    <div className="w-full py-1.5 bg-[#9F2B24] text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-sm flex items-center justify-center gap-1.5">
                      <Brush size={10} />
                      <span>创作分享</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'gallery'>('editor');

  const [allPatterns, setAllPatterns] = useState<Pattern[]>(() => {
    const saved = localStorage.getItem('yangshao-all-patterns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Pattern[];
        // Always reset built-in patterns from PATTERNS to accommodate variant changes
        const customPatterns = parsed.filter(p => p.categoryId === 'custom' || (!p.categoryId && p.id.startsWith('custom_')));
        
        // Give legacy custom patterns a categoryId
        customPatterns.forEach(p => {
          if (!p.categoryId) {
            p.categoryId = 'custom';
            p.categoryName = '自定义';
          }
        });

        return [...PATTERNS, ...customPatterns];
      } catch (e) {
        return PATTERNS;
      }
    }
    return PATTERNS;
  });

  // Track currently selected variant ID (which represents the active tool to stamp with)
  const [currentPatternId, setCurrentPatternId] = useState(PATTERNS[0].id);

  const [mode, setMode] = useState<GenerationMode>('repeat2');
  
  const getInitialScene = (): SceneState => ({
    items: [],
    bands: [],
    repeat4: { pattern: null, tiles: new Set() },
    skeleton: { cols: 0, rows: 0, nodes: [], cell: 0, rosetteR: 0, petalSize: 0, rosetteN: 12 },
    rosettes: [],
    ifs: { slots: [], filled: new Set(), done: false },
    lsys: { trees: {} }
  });
  
  const [scene, setScene] = useState<SceneState>(getInitialScene());

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global Uncaught Error:', event.error || event.message);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Ignore benign Vite websocket errors
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('websocket')) {
        return;
      }
      if (event.reason && event.reason.message && event.reason.message.includes('websocket')) {
        return;
      }
      console.warn('Global Unhandled Rejection:', event.reason);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const [history, setHistory] = useState<SceneState[]>([]);
  const [redoStack, setRedoStack] = useState<SceneState[]>([]);
  
  const items = scene.items; // For backward compatibility in rendering
  const [bgColor, setBgColor] = useState(PALETTE[0]);
  const [patternColor, setPatternColor] = useState(PALETTE[1]);
  const [patternSizeScale, setPatternSizeScale] = useState(1.0);
  const [rowGapScale, setRowGapScale] = useState(2.0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [is3DPreviewOpen, setIs3DPreviewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(CANVAS_SIZES[0]);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const potteryPreviewRef = useRef<PotteryPreviewHandle>(null);
  const svgImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const tintedSvgsRef = useRef<Record<string, HTMLCanvasElement>>({});
  const bgTextureImgRef = useRef<HTMLImageElement | null>(null);

  // Refs for animation loop to prevent flickering and unnecessary restarts
  const itemsRef = useRef(items);
  const bgColorRef = useRef(bgColor);
  const patternColorRef = useRef(patternColor);
  const patternsMapRef = useRef<Record<string, Pattern>>({});
  const patternSizeScaleRef = useRef(patternSizeScale);
  const rowGapScaleRef = useRef(rowGapScale);
  const selectedSizeRef = useRef(selectedSize);
  const sceneRef = useRef(scene);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);
  useEffect(() => { patternColorRef.current = patternColor; }, [patternColor]);
  useEffect(() => { patternSizeScaleRef.current = patternSizeScale; }, [patternSizeScale]);
  useEffect(() => { rowGapScaleRef.current = rowGapScale; }, [rowGapScale]);
  useEffect(() => { selectedSizeRef.current = selectedSize; }, [selectedSize]);
  useEffect(() => { sceneRef.current = scene; }, [scene]);
  
  useEffect(() => {
    const map: Record<string, Pattern> = {};
    allPatterns.forEach(p => map[p.id] = p);
    patternsMapRef.current = map;
  }, [allPatterns]);

  // Removed noise texture generation

  // Load Background Texture Image
  useEffect(() => {
    const img = new Image();
    img.src = "/assests/bgpic/3.jpg";
    img.onload = () => {
      bgTextureImgRef.current = img;
      if (potteryPreviewRef.current && canvasRef.current) {
        potteryPreviewRef.current.updateTexture(canvasRef.current);
      }
    };
  }, []);

  // Persist all patterns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yangshao-all-patterns', JSON.stringify(allPatterns));
    } catch (e) {
      console.warn('Failed to save patterns to localStorage:', e);
    }
  }, [allPatterns]);

  // Load SVGs
  useEffect(() => {
    allPatterns.forEach(p => {
      // Reload if not loaded or if the file URL has changed
      const existing = svgImagesRef.current[p.id];
      if (existing && (existing.src === p.file || existing.src.endsWith(p.file))) return;
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = p.file;
      img.onload = () => {
        svgImagesRef.current[p.id] = img;
        updateTintedSvg(p.id, patternColor);
      };
    });
  }, [allPatterns]);



  // Update tinted SVGs when color changes
  useEffect(() => {
    Object.keys(svgImagesRef.current).forEach(id => {
      updateTintedSvg(id, patternColor);
    });
  }, [patternColor]);

  const updateTintedSvg = (id: string, color: string) => {
    const img = svgImagesRef.current[id];
    if (!img) return;
    const canvas = document.createElement('canvas');
    // Use naturalWidth for accurate aspect ratio, default to 100
    const w = img.naturalWidth || img.width || 100;
    const h = img.naturalHeight || img.height || 100;
    // Base resolution off a larger dimension for crisper rendering
    const maxDim = Math.max(w, h);
    const scale = maxDim < 500 ? 500 / maxDim : 1; 
    canvas.width = w * scale;
    canvas.height = h * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    tintedSvgsRef.current[id] = canvas;
  };

  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const fileName = file.name.replace('.svg', '');
          
          const tempImg = new Image();
          tempImg.onload = () => {
             const ratio = (tempImg.naturalWidth && tempImg.naturalHeight) 
                ? tempImg.naturalWidth / tempImg.naturalHeight 
                : (tempImg.width / tempImg.height || 1);
            
            setAllPatterns(prev => {
              const existingIndex = prev.findIndex(p => 
                p.name === fileName || p.id === fileName || (fileName === 'huaban' && p.id === 'huaban')
              );

              if (existingIndex !== -1) {
                const updated = [...prev];
                const target = updated[existingIndex];
                updated[existingIndex] = {
                  ...target,
                  file: dataUrl,
                  ratio: ratio,
                };
                // Auto-select the updated pattern
                setTimeout(() => setCurrentPatternId(target.id), 0);
                return updated;
              } else {
                // If no match, add as a new pattern
                const newPattern: Pattern = {
                  id: `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                  categoryId: 'custom',
                  categoryName: '自定义',
                  name: fileName,
                  info: "用户上传的自定义纹样",
                  file: dataUrl,
                  ratio: ratio,
                };
                setTimeout(() => setCurrentPatternId(newPattern.id), 0);
                return [...prev, newPattern];
              }
            });
          };
          tempImg.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  };



  const pushHistory = useCallback((newScene: SceneState) => {
    setHistory(prev => [...prev, scene]);
    setScene(newScene);
    setRedoStack([]);
  }, [scene]);

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(prevRedo => [...prevRedo, scene]);
    setScene(prev);
    setHistory(prevHistory => prevHistory.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prevHistory => [...prevHistory, scene]);
    setScene(next);
    setRedoStack(prevRedo => prevRedo.slice(0, -1));
  };

  const clear = () => {
    pushHistory(getInitialScene());
  };

  const handleSetMode = (newMode: GenerationMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    pushHistory(getInitialScene());
  };

  // Helper functions for generation
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const deg2rad = (d: number) => d * Math.PI / 180;

  const mulberry32 = (seed: number) => {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const seedFromString = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const generateQrCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGeneratingQr(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch('/api/share-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const data = await response.json();
      if (data.id) {
        setQrUrl(`${window.location.origin}/share/${data.id}`);
        setIsQrModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to generate QR code', err);
      alert('生成二维码失败，请稍后再试');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale from CSS pixels to logical coordinates (1000 width)
    const logicalWidth = 1000;
    const scaleToLogical = logicalWidth / rect.width;
    
    const x = (e.clientX - rect.left) * scaleToLogical;
    const y = (e.clientY - rect.top) * scaleToLogical;

    const pattern = allPatterns.find(p => p.id === currentPatternId);
    if (!pattern) return;

    const originalImg = svgImagesRef.current[currentPatternId];
    const realRatio = (originalImg && originalImg.naturalWidth && originalImg.naturalHeight) 
      ? originalImg.naturalWidth / originalImg.naturalHeight 
      : pattern.ratio;

    let newScene = { ...scene, items: [...scene.items] };
    let ok = false;

    const addStampSVG = ({x, y, sizeH, rotation, flipX = false, startOffsetMs = 0, alpha = 1}: any) => {
      if (newScene.items.length >= CONFIG.maxItems) return false;
      newScene.items.push({
        kind: 'svg',
        x, y, sizeH, rotation, flipX, alpha,
        start: performance.now() + startOffsetMs,
        duration: CONFIG.animDuration,
        patternId: currentPatternId
      });
      return true;
    };

    if (mode === 'repeat2') {
      const tileH = CONFIG.r2_baseSize * patternSizeScale;
      const tileW = tileH * realRatio;
      const trackHeight = tileH * 1.6;
      const idx = Math.round(y / trackHeight);

      if (!newScene.bands.some(b => b.idx === idx)) {
        newScene.bands = [...newScene.bands, { idx }];
        const drawY = idx * trackHeight;
        const stepX = tileW * 1.15;
        const phase = ((x % stepX) + stepX) % stepX;
        const startX = phase - stepX;
        const cols = Math.ceil((logicalWidth + stepX * 2) / stepX);

        let k = 0;
        for (let c = 0; c <= cols; c++) {
          const bx = startX + c * stepX;
          addStampSVG({
            x: bx,
            y: drawY,
            sizeH: tileH,
            rotation: (c & 1) ? Math.PI : 0,
            flipX: (c & 1) === 1,
            startOffsetMs: (k++) * CONFIG.animStagger
          });
        }
        ok = true;
      }
    } else if (mode === 'repeat4') {
      const motifSize = CONFIG.r4_motifSizePx * patternSizeScale;
      let tileSize = CONFIG.r4_tileSizePx * patternSizeScale;
      let margin = motifSize * 0.5;
      let minDist = motifSize * CONFIG.r4_minDistMul;

      // ONLY adjust for fish pattern (or highly rectangular patterns) to prevent overlap
      if (pattern.id === 'yuwen' || realRatio > 2.0) {
        const motifW = motifSize * realRatio;
        const maxDim = Math.max(motifW, motifSize);
        tileSize = Math.max(tileSize, maxDim * 1.2);
        margin = Math.max(margin, maxDim * 0.08);
        minDist = Math.max(minDist, maxDim * CONFIG.r4_minDistMul * 0.45);
      }
      
      let p = newScene.repeat4.pattern;
      if (!p) {
        const half = tileSize * 0.5;
        const seeds = [];
        for (let t = 0; t < 2500 && seeds.length < CONFIG.r4_motifsPerQuadrant; t++) {
          const sx = rand(margin, half - margin);
          const sy = rand(margin, half - margin);
          let valid = true;
          for (const s of seeds) {
            const dx = sx - s.x, dy = sy - s.y;
            if (dx * dx + dy * dy < minDist * minDist) { valid = false; break; }
          }
          if (!valid) continue;
          seeds.push({
            x: sx, y: sy,
            scale: rand(1 - CONFIG.r4_motifScaleJitter, 1 + CONFIG.r4_motifScaleJitter),
            rot: deg2rad(rand(-CONFIG.r4_motifRotJitterDeg, CONFIG.r4_motifRotJitterDeg)),
            flipX: Math.random() < 0.35
          });
        }
        p = { originX: null, originY: null, tileSize, seeds };
        newScene.repeat4 = { pattern: p, tiles: new Set() };
      }

      if (p.originX == null || p.originY == null) {
        p.originX = x; p.originY = y;
      }

      const ix = Math.round((x - p.originX) / tileSize);
      const iy = Math.round((y - p.originY) / tileSize);
      const key = `${ix},${iy}`;

      if (!newScene.repeat4.tiles.has(key)) {
        newScene.repeat4.tiles = new Set(newScene.repeat4.tiles).add(key);
        const tileX = p.originX + ix * tileSize - tileSize / 2;
        const tileY = p.originY + iy * tileSize - tileSize / 2;
        const center = { x: tileSize / 2, y: tileSize / 2 };
        const tileFlip = CONFIG.r4_checkerFlip && ((ix + iy) & 1);

        let idx = 0;
        for (const seed of p.seeds) {
          for (let q = 0; q < 4; q++) {
            const ang = q * (Math.PI / 2);
            const cx = seed.x - center.x, cy = seed.y - center.y;
            const c = Math.cos(ang), s = Math.sin(ang);
            let pt = { x: center.x + cx * c - cy * s, y: center.y + cx * s + cy * c };
            let rot = seed.rot + ang;
            let flipX = seed.flipX;

            if (tileFlip) {
              pt = { x: tileSize - pt.x, y: pt.y };
              rot = -rot;
              flipX = !flipX;
            }

            addStampSVG({
              x: tileX + pt.x,
              y: tileY + pt.y,
              sizeH: motifSize * seed.scale,
              rotation: rot,
              flipX,
              startOffsetMs: (idx++) * CONFIG.animStagger
            });
          }
        }
        ok = true;
      }
    } else if (mode === 'shapeGrammar') {
      const isFlame = currentPatternId === 'huoyan';
      const sg = {
        targetCellPx: (isFlame ? 360 : CONFIG.sg_targetCellPx) * patternSizeScale,
        rosetteN: isFlame ? 8 : CONFIG.sg_rosetteN,
        rosetteRadiusMul: isFlame ? 0.52 : CONFIG.sg_rosetteRadiusMul,
        petalSizeMul: isFlame ? 0.38 : CONFIG.sg_petalSizeMul,
        safetyMul: isFlame ? 0.56 : CONFIG.sg_safetyMul,
        gapMul: isFlame ? CONFIG.sg_flameGapMul : CONFIG.sg_petalGapMul
      };

      let skel = newScene.skeleton;
      if (!skel.nodes.length) {
        const h = logicalWidth * (rect.height / rect.width);
        const margin = Math.max(CONFIG.sg_marginMin, Math.min(logicalWidth, h) * CONFIG.sg_marginMul);
        const innerW = Math.max(1, logicalWidth - margin * 2);
        const innerH = Math.max(1, h - margin * 2);
        const cols = Math.max(3, Math.round(innerW / sg.targetCellPx));
        const rows = Math.max(3, Math.round(innerH / sg.targetCellPx));
        const cellW = innerW / cols;
        const cellH = innerH / rows;
        const nodes = [];
        let id = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            nodes.push({ id: id++, r, c, x: margin + (c + 0.5) * cellW, y: margin + (r + 0.5) * cellH });
          }
        }
        const cell = Math.min(cellW, cellH);
        let rosetteR = cell * sg.rosetteRadiusMul;
        let petalSize = cell * sg.petalSizeMul;
        const maxBound = cell * sg.safetyMul;
        if (rosetteR + petalSize * 0.55 > maxBound) {
          const scale = maxBound / (rosetteR + petalSize * 0.55);
          rosetteR *= scale;
          petalSize *= scale;
        }
        
        const petalW = petalSize * realRatio;
        const circumference = 2 * Math.PI * rosetteR;
        const desired = petalW * (1 + sg.gapMul);
        let rosetteN = Math.floor(circumference / desired);
        rosetteN = clamp(rosetteN, CONFIG.sg_rosetteMinN, CONFIG.sg_rosetteMaxN);

        skel = { cols, rows, nodes, cell, rosetteR, petalSize, rosetteN };
        newScene.skeleton = skel;
      }

      let best = null, bestD2 = Infinity;
      for (const n of skel.nodes) {
        const dx = x - n.x, dy = y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) { bestD2 = d2; best = n; }
      }

      if (best && !newScene.rosettes.some(r => r.nodeId === best.id)) {
        const nPetals = skel.rosetteN;
        const baseAngle = ((best.r * 7 + best.c * 3) % nPetals) * (Math.PI * 2 / nPetals) * 0.35;
        newScene.rosettes = [...newScene.rosettes, { nodeId: best.id, baseAngle }];

        for (let k = 0; k < nPetals; k++) {
          const theta = baseAngle + k * (Math.PI * 2 / nPetals);
          addStampSVG({
            x: best.x + Math.cos(theta) * skel.rosetteR,
            y: best.y + Math.sin(theta) * skel.rosetteR,
            sizeH: skel.petalSize,
            rotation: theta,
            flipX: false,
            startOffsetMs: k * CONFIG.animStagger
          });
        }
        ok = true;
      }
    } else if (mode === 'lsys') {
      const h = logicalWidth * (rect.height / rect.width);
      const mx = logicalWidth * 0.06;
      const zoneW = (logicalWidth - mx * 2) / 3;
      const zones = [
        { key: 'left', x0: mx, x1: mx + zoneW },
        { key: 'mid', x0: mx + zoneW, x1: mx + 2 * zoneW },
        { key: 'right', x0: mx + 2 * zoneW, x1: mx + 3 * zoneW },
      ];
      const z = zones.find(z => x >= z.x0 && x <= z.x1) || zones[1];
      
      let t = newScene.lsys.trees[z.key];
      if (t && t.reveal >= t.segs.length) {
        t = undefined; // Force generate new tree if clicked again
      }

      if (!t) {
        const preset = z.key === 'left' 
          ? { depth: 6, baseLen: h * 0.20, lenDecay: 0.70, lenJitter: 0.06, spread: 0.85, branchCount: 2, extraBranchProb: 0.45, branchBias: -0.20, tilt: -0.18, lineW: 1.25, maxSegments: 780, step: 120 }
          : z.key === 'right'
          ? { depth: 6, baseLen: h * 0.20, lenDecay: 0.70, lenJitter: 0.06, spread: 0.75, branchCount: 2, extraBranchProb: 0.35, branchBias: 0.20, tilt: 0.18, lineW: 1.25, maxSegments: 760, step: 120 }
          : { depth: 7, baseLen: h * 0.24, lenDecay: 0.72, lenJitter: 0.05, spread: 0.60, branchCount: 2, extraBranchProb: 0.30, branchBias: 0.0, tilt: 0.0, lineW: 1.35, maxSegments: 900, step: 140 };
        
        const seed = seedFromString('lsys_' + z.key + '_' + Math.random());
        const rng = mulberry32(seed);
        const segs: any[] = [];
        
        const branch = (bx: number, by: number, len: number, ang: number, depth: number) => {
          if (depth <= 0 || len < 2 || segs.length >= preset.maxSegments) return;
          const x2 = bx + Math.cos(ang) * len;
          const y2 = by + Math.sin(ang) * len;
          segs.push({ x1: bx, y1: by, x2, y2, w: preset.lineW * (0.55 + 0.45 * depth / preset.depth) });
          const n = preset.branchCount + (rng() < preset.extraBranchProb ? 1 : 0);
          for (let i = 0; i < n; i++) {
            const bias = (i - (n - 1) / 2) * preset.branchBias;
            const jitter = (rng() * 2 - 1) * preset.spread * 0.35;
            branch(x2, y2, len * (preset.lenDecay + (rng() * 2 - 1) * preset.lenJitter), ang + bias + jitter, depth - 1);
            if (segs.length >= preset.maxSegments) return;
          }
        };
        branch((z.x0 + z.x1) * 0.5, h * 0.93, preset.baseLen, -Math.PI / 2 + preset.tilt, preset.depth);
        t = { segs, reveal: 0, step: preset.step, patternId: currentPatternId };
        newScene.lsys = { trees: { ...newScene.lsys.trees, [z.key]: t } };
      }
      
      if (t.reveal < t.segs.length) {
        newScene.lsys.trees[z.key] = { ...t, reveal: Math.min(t.segs.length, t.reveal + t.step) };
        ok = true;
      }
    } else if (mode === 'ifs') {
      const h = logicalWidth * (rect.height / rect.width);
      let slots = newScene.ifs.slots;
      if (!slots.length) {
        const m = Math.min(logicalWidth, h) * CONFIG.ifs_marginMul;
        const innerW = Math.max(1, logicalWidth - 2 * m);
        const innerH = Math.max(1, h - 2 * m);
        const cols = Math.max(2, Math.round(innerW / (CONFIG.ifs_cellTargetPx * patternSizeScale)));
        const rows = Math.max(2, Math.round(innerH / (CONFIG.ifs_cellTargetPx * patternSizeScale)));
        const cellW = innerW / cols;
        const cellH = innerH / rows;
        const cell = Math.min(cellW, cellH);
        const gap = cell * CONFIG.ifs_gapMul;
        const Rb0 = cell * CONFIG.ifs_bigRCellMul;
        const Rs0 = cell * CONFIG.ifs_smallRCellMul;
        const safe = 0.707 * cell;
        const maxSum = Math.max(1, safe - 0.001);
        const sum = Rb0 + Rs0 + gap;
        const s = sum > maxSum ? (maxSum / sum) : 1.0;
        const bigR = Rb0 * s;
        const smallR = Rs0 * s;

        slots = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            slots.push({ id: `B_${r}_${c}`, x: m + (c + 0.5) * cellW, y: m + (r + 0.5) * cellH, R: bigR, type: 'big' });
          }
        }
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols - 1; c++) {
            slots.push({ id: `S_${r}_${c}`, x: m + (c + 1) * cellW, y: m + (r + 1) * cellH, R: smallR, type: 'small' });
          }
        }
        newScene.ifs = { ...newScene.ifs, slots };
      }

      let best = null, bestD2 = Infinity;
      for (const s of slots) {
        if (CONFIG.ifs_lockFilled && newScene.ifs.filled.has(s.id)) continue;
        const dx = x - s.x, dy = y - s.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) { bestD2 = d2; best = s; }
      }

      if (best) {
        const rng = mulberry32(seedFromString(`ifs_${currentPatternId}_${best.id}_${Math.floor(best.x)}_${Math.floor(best.y)}`));
        const minRNorm = clamp(CONFIG.ifs_minBubblePx / Math.max(1, best.R), 0.006, 0.08);
        
        const Cx = {
          add: (a: any, b: any) => ({ re: a.re + b.re, im: a.im + b.im }),
          sub: (a: any, b: any) => ({ re: a.re - b.re, im: a.im - b.im }),
          mulS: (a: any, s: number) => ({ re: a.re * s, im: a.im * s }),
          divS: (a: any, s: number) => ({ re: a.re / s, im: a.im / s })
        };
        
        const initialApollonian4 = () => {
          const outer = { k: -1, z: { re: 0, im: 0 } };
          const r = 2 * Math.sqrt(3) - 3;
          const d = 1 - r;
          const k = 1 / r;
          const c1 = { k, z: { re: d, im: 0 } };
          const a = 2 * Math.PI / 3;
          const c2 = { k, z: { re: d * Math.cos(a), im: d * Math.sin(a) } };
          const c3 = { k, z: { re: d * Math.cos(-a), im: d * Math.sin(-a) } };
          return [outer, c1, c2, c3];
        };
        
        const oppositeCircle = (q: any[], idx: number) => {
          const ids = [0, 1, 2, 3].filter(i => i !== idx);
          const a = q[ids[0]], b = q[ids[1]], c = q[ids[2]], d = q[idx];
          const S = a.k + b.k + c.k;
          const kNew = 2 * S - d.k;
          const A = Cx.add(Cx.add(Cx.mulS(a.z, a.k), Cx.mulS(b.z, b.k)), Cx.mulS(c.z, c.k));
          const Nnew = Cx.sub(Cx.mulS(A, 2), Cx.mulS(d.z, d.k));
          return { k: kNew, z: Cx.divS(Nnew, kNew) };
        };

        const root = initialApollonian4();
        const circles = [];
        const seen = new Set();
        const keyOf = (ci: any) => `${Math.round(ci.z.re * 20000)},${Math.round(ci.z.im * 20000)},${Math.round((1 / Math.abs(ci.k)) * 20000)}`;
        
        for (let i = 1; i < 4; i++) { circles.push(root[i]); seen.add(keyOf(root[i])); }
        
        const stack = [root];
        while (stack.length && circles.length < CONFIG.ifs_maxBubblesPerSlot) {
          const q = stack.pop()!;
          for (let i = 0; i < 4; i++) {
            const ni = oppositeCircle(q, i);
            const r = 1 / Math.abs(ni.k);
            if (r < minRNorm) continue;
            if (ni.z.re * ni.z.re + ni.z.im * ni.z.im > (1 - r) * (1 - r) + 1e-6) continue;
            const k = keyOf(ni);
            if (seen.has(k)) continue;
            seen.add(k);
            circles.push(ni);
            if (circles.length >= CONFIG.ifs_maxBubblesPerSlot) break;
            const q2 = [...q];
            q2[i] = ni;
            stack.push(q2);
          }
        }

        circles.sort((a, b) => (1 / Math.abs(b.k)) - (1 / Math.abs(a.k)));
        const globalRot = (rng() * 2 - 1) * 0.25;
        const cr = Math.cos(globalRot), sr = Math.sin(globalRot);
        
        let k = 0;
        for (const ci of circles) {
          const rNorm = 1 / Math.abs(ci.k);
          const cx = best.x + (ci.z.re * cr - ci.z.im * sr) * best.R;
          const cy = best.y + (ci.z.re * sr + ci.z.im * cr) * best.R;
          let sizeH = rNorm * best.R * 2 * CONFIG.ifs_svgFit;
          if (realRatio > 1) sizeH /= realRatio;
          sizeH = Math.max(1.5, sizeH);
          
          addStampSVG({
            x: cx, y: cy, sizeH,
            rotation: (rng() * 2 - 1) * CONFIG.ifs_svgRotJitter,
            flipX: rng() < CONFIG.ifs_svgFlipProb,
            alpha: CONFIG.ifs_svgAlpha,
            startOffsetMs: 6 + (k++) * 1.2
          });
          if (k >= CONFIG.ifs_maxBubblesPerSlot) break;
        }
        
        newScene.ifs.filled = new Set(newScene.ifs.filled).add(best.id);
        ok = true;
      }
    }

    if (ok) {
      pushHistory(newScene);
    }
  };

  // Canvas Resize Observer
  useEffect(() => {
    if (!canvasContainerRef.current || !canvasRef.current) return;
    
    const observer = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
      requestAnimationFrame(() => {
        if (!canvasContainerRef.current || !canvasRef.current) return;
        
        if (selectedSizeRef.current.id === 'free') {
          const { clientWidth, clientHeight } = canvasContainerRef.current;
          canvasRef.current.width = clientWidth * 2; // High DPI
          canvasRef.current.height = clientHeight * 2;
        }
      });
    });

    observer.observe(canvasContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update canvas size when selectedSize changes
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;
    if (selectedSize.id !== 'free') {
      canvasRef.current.width = selectedSize.width;
      canvasRef.current.height = selectedSize.height;
    } else {
      const { clientWidth, clientHeight } = canvasContainerRef.current;
      canvasRef.current.width = clientWidth * 2;
      canvasRef.current.height = clientHeight * 2;
    }
  }, [selectedSize]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const now = performance.now();
      const currentItems = itemsRef.current;
      const currentBgColor = bgColorRef.current;
      const patternsMap = patternsMapRef.current;

      ctx.fillStyle = currentBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (bgTextureImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(bgTextureImgRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      currentItems.forEach(item => {
        const img = tintedSvgsRef.current[item.patternId] || svgImagesRef.current[item.patternId];
        if (!img) return;

        const pattern = patternsMap[item.patternId];
        const originalImg = svgImagesRef.current[item.patternId];
        let ratio = pattern?.ratio || 1;
        if (originalImg && originalImg.naturalHeight && originalImg.naturalWidth) {
          ratio = originalImg.naturalWidth / originalImg.naturalHeight;
        }

        const t = Math.min(1, Math.max(0, (now - item.start) / item.duration));
        const ease = 1 - Math.pow(1 - t, 3);
        
        // Scale from logical coordinates (1000 width) to actual canvas pixels
        const scaleToCanvas = canvas.width / 1000;
        
        const drawH = item.sizeH * scaleToCanvas * (0.1 + 0.9 * ease);
        const drawW = drawH * ratio;

        ctx.save();
        ctx.translate(item.x * scaleToCanvas, item.y * scaleToCanvas);
        ctx.rotate(item.rotation);
        if (item.flipX) ctx.scale(-1, 1);
        ctx.globalAlpha = item.alpha * ease;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      });

      // Draw L-systems
      const currentScene = sceneRef.current;
      const lsysTrees = currentScene.lsys.trees;
      ctx.save();
      ctx.strokeStyle = patternColorRef.current;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.95;
      const scaleToCanvas = canvas.width / 1000;
      
      for (const key of ['left', 'mid', 'right']) {
        const t = lsysTrees[key];
        if (!t || !t.segs) continue;
        const pId = t.patternId;
        const img = pId ? (tintedSvgsRef.current[pId] || svgImagesRef.current[pId]) : null;

        for (let i = 0; i < t.reveal; i++) {
          const s = t.segs[i];
          const x1 = s.x1 * scaleToCanvas;
          const y1 = s.y1 * scaleToCanvas;
          const x2 = s.x2 * scaleToCanvas;
          const y2 = s.y2 * scaleToCanvas;

          if (img) {
            const len = Math.hypot(x2 - x1, y2 - y1);
            const ang = Math.atan2(y2 - y1, x2 - x1);
            // We scale up the width heavily so the pattern elements are clearly legible as "leaves/trunks"
            const patW = s.w * scaleToCanvas * 4.0;
            
            ctx.save();
            ctx.translate(x1, y1);
            ctx.rotate(ang);
            // Draw image connecting start to end, expanding out by patW/2 in both normal directions
            ctx.drawImage(img, 0, -patW / 2, len, patW);
            ctx.restore();
          } else {
            ctx.lineWidth = s.w * scaleToCanvas;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // Run once, uses refs for state

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `yangshao-pattern-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePlaceOnPottery = () => {
    try {
      if (canvasRef.current && potteryPreviewRef.current) {
        potteryPreviewRef.current.updateTexture(canvasRef.current);
      }
    } catch (e) {
      console.error('Error projecting to pottery:', e);
    }
  };

  const [modelUrl, setModelUrl] = useState<string | undefined>(undefined);
  const [autoRotate, setAutoRotate] = useState(false);
  const [patternScale, setPatternScale] = useState(1.0);

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.glb') || name.endsWith('.gltf')) {
        const url = URL.createObjectURL(file);
        setModelUrl(url);
      } else {
        alert('请上传 .glb 或 .gltf 格式的 3D 模型文件');
      }
    }
    // Reset input value so the same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#f5f5f0]">
      <motion.div
        className="flex w-[200vw] h-screen"
        animate={{ x: currentView === 'gallery' ? '-100vw' : '0' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Editor View */}
        <div className="w-screen h-screen shrink-0 relative overflow-hidden">
          <div className="h-screen w-full bg-[#f5f5f0] text-stone-800 overflow-hidden font-sans">
            <PanelGroup direction="horizontal">
        {/* Left Sidebar */}
        <Panel defaultSize={20} minSize={15} className="bg-white border-r border-stone-200 flex flex-col shadow-xl z-10">
          <div className="p-6 border-b border-stone-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#9F2B24] rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-900/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-serif-sc font-bold text-[#9F2B24]">仰韶·重构</h1>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">算法艺术 · 陶韵新生</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Pattern Selection */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#9F2B24] rounded-full" /> 1. 选择纹样
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Array.from(new Set(allPatterns.map(p => p.categoryId))).map(catId => {
                  const categoryPatterns = allPatterns.filter(p => p.categoryId === catId);
                  if (categoryPatterns.length === 0) return null;
                  
                  const basePattern = categoryPatterns[0];
                  const isCategoryActive = categoryPatterns.some(p => p.id === currentPatternId);
                  
                  // Find currently active variant in this category
                  const activeVariant = isCategoryActive 
                    ? (categoryPatterns.find(p => p.id === currentPatternId) || basePattern)
                    : basePattern;

                  return (
                    <div key={catId} className="flex flex-col gap-2">
                      {/* Main Category Button */}
                      <button
                        onClick={() => setCurrentPatternId(basePattern.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          isCategoryActive 
                            ? "border-[#9F2B24] bg-red-50 shadow-sm" 
                            : "border-stone-100 hover:border-stone-300 bg-stone-50"
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-stone-200 p-1 flex-shrink-0">
                          {/* Apply dynamic color using a CSS filter trick or mask if it's an SVG.
                              Since they are external SVGs, we'll try to just show them as images for now or use mask-image.
                              We can use mask-image to dynamically color the SVG! */}
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: isCategoryActive ? patternColor : '#57534e', // Use pattern color if active, else dark stone
                              WebkitMaskImage: `url(${basePattern.file})`,
                              WebkitMaskSize: 'contain',
                              WebkitMaskPosition: 'center',
                              WebkitMaskRepeat: 'no-repeat',
                              maskImage: `url(${basePattern.file})`,
                              maskSize: 'contain',
                              maskPosition: 'center',
                              maskRepeat: 'no-repeat'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{basePattern.categoryName}</div>
                          {isCategoryActive && (
                            <div className="text-[10px] text-[#9F2B24] mt-0.5" style={{ color: patternColor }}>已选择: {activeVariant.name}</div>
                          )}
                        </div>
                      </button>

                      {/* Sub-variants (Horizontal List) */}
                      <AnimatePresence>
                        {isCategoryActive && categoryPatterns.length > 1 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-2 overflow-x-auto pb-2 pl-2 scrollbar-none"
                          >
                            {categoryPatterns.map(variant => (
                              <button
                                key={variant.id}
                                onClick={() => setCurrentPatternId(variant.id)}
                                className={cn(
                                  "flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center border transition-all p-1",
                                  currentPatternId === variant.id
                                    ? "shadow-sm border-stone-400"
                                    : "border-stone-200 hover:border-stone-300"
                                )}
                                style={{
                                  borderColor: currentPatternId === variant.id ? patternColor : undefined
                                }}
                                title={variant.name}
                              >
                                <div
                                  className="w-full h-full opacity-80"
                                  style={{
                                    backgroundColor: currentPatternId === variant.id ? patternColor : '#a8a29e', // Use pattern color if selected, else gray
                                    WebkitMaskImage: `url(${variant.file})`,
                                    WebkitMaskSize: 'contain',
                                    WebkitMaskPosition: 'center',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskImage: `url(${variant.file})`,
                                    maskSize: 'contain',
                                    maskPosition: 'center',
                                    maskRepeat: 'no-repeat'
                                  }}
                                />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Size Adjustment */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#9F2B24] rounded-full" /> 2. 纹样大小
              </h2>
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">缩放比例</span>
                  <span className="font-mono text-xs font-bold text-[#9F2B24]">{Math.round(patternSizeScale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="3.0" 
                  step="0.05" 
                  value={patternSizeScale} 
                  onChange={(e) => setPatternSizeScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9F2B24]"
                />
                <div className="flex justify-between text-[8px] text-stone-300 font-bold uppercase tracking-tighter">
                  <span>极小</span>
                  <span>标准 (100%)</span>
                  <span>极大</span>
                </div>
              </div>
            </section>

            {/* Row Gap Adjustment */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#9F2B24] rounded-full" /> 3. 图案行距
              </h2>
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">间距倍数</span>
                  <span className="font-mono text-xs font-bold text-[#9F2B24]">{rowGapScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="1.0" 
                  max="5.0" 
                  step="0.1" 
                  value={rowGapScale} 
                  onChange={(e) => setRowGapScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9F2B24]"
                />
                <div className="flex justify-between text-[8px] text-stone-300 font-bold uppercase tracking-tighter">
                  <span>紧凑</span>
                  <span>标准 (2.0)</span>
                  <span>宽松</span>
                </div>
              </div>
            </section>

            {/* Generation Mode */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#9F2B24] rounded-full" /> 4. 生成模式
              </h2>
              <div className="space-y-2">
                {[
                  { id: 'repeat2', name: '二方连续', icon: <MoveHorizontal size={18} /> },
                  { id: 'repeat4', name: '四方连续', icon: <Grid3X3 size={18} /> },
                  { id: 'shapeGrammar', name: '形状文法', icon: <Network size={18} /> },
                  { id: 'lsys', name: 'L-Systems', icon: <TreeDeciduous size={18} /> },
                  { id: 'ifs', name: 'IFS 分形', icon: <Flower2 size={18} /> },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSetMode(m.id as GenerationMode)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                      mode === m.id 
                        ? "border-[#9F2B24] bg-red-50 text-[#9F2B24]" 
                        : "border-stone-100 hover:border-stone-300 bg-stone-50 text-stone-600"
                    )}
                  >
                    {m.icon}
                    <span className="text-sm font-bold">{m.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Background Image Upload Removed */}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-stone-100 bg-stone-50 grid grid-cols-2 gap-2">
            <button onClick={undo} disabled={history.length === 0} className="flex items-center justify-center gap-2 p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold disabled:opacity-30">
              <Undo2 size={14} /> 撤销
            </button>
            <button onClick={redo} disabled={redoStack.length === 0} className="flex items-center justify-center gap-2 p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold disabled:opacity-30">
              <Redo2 size={14} /> 重做
            </button>
            <button onClick={clear} className="flex items-center justify-center gap-2 p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold">
              <RotateCcw size={14} /> 清空
            </button>
            <button onClick={downloadImage} className="flex items-center justify-center gap-2 p-2 bg-[#9F2B24] text-white rounded-lg text-xs font-bold shadow-lg shadow-red-900/20">
              <Download size={14} /> 保存
            </button>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-stone-200 hover:bg-[#9F2B24] transition-colors cursor-col-resize" />

        {/* Main Canvas Area */}
        <Panel defaultSize={80} minSize={30} className="relative flex flex-col items-center justify-center bg-stone-100 p-8">
          {/* Top Hover Trigger for Color Panel */}
          <div className="absolute top-0 left-0 right-0 h-24 z-30 group">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white shadow-xl transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-4 pointer-events-none group-hover:pointer-events-auto">
              <div className="flex flex-col gap-2 px-3 border-r border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">底色颜色</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {PALETTE.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setBgColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110", 
                        bgColor === c && "ring-2 ring-stone-800 ring-offset-1"
                      )}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 px-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">纹样颜色</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {PALETTE.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setPatternColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110", 
                        patternColor === c && "ring-2 ring-stone-800 ring-offset-1"
                      )}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden min-h-0">
            <div 
              ref={canvasContainerRef}
              className="relative bg-white shadow-2xl rounded-3xl overflow-hidden border-[12px] border-white transition-all duration-300"
              style={selectedSize.id === 'free' ? { 
                width: '100%', 
                height: '100%' 
              } : { 
                aspectRatio: `${selectedSize.width} / ${selectedSize.height}`,
                height: '100%',
                maxWidth: '100%'
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-pointer block"
              />
              <AnimatePresence>
                {items.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#9F2B24] animate-spin-slow flex items-center justify-center">
                      <Plus className="text-[#9F2B24]" />
                    </div>
                    <p className="mt-6 font-serif-sc text-stone-400 tracking-widest">点击画布开始重构</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex gap-4 items-center flex-shrink-0">
            {/* Size Selector */}
            <div 
              className="relative"
              onMouseEnter={() => setIsSizeMenuOpen(true)}
              onMouseLeave={() => setIsSizeMenuOpen(false)}
            >
              <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-lg border border-stone-100 text-sm font-bold hover:bg-stone-50 transition-all">
                {selectedSize.icon} {selectedSize.name} <ChevronDown size={14} />
              </button>
              
              <AnimatePresence>
                {isSizeMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50"
                  >
                    {CANVAS_SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => {
                          setSelectedSize(size);
                          setIsSizeMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:bg-stone-50 transition-colors",
                          selectedSize.id === size.id ? "text-[#9F2B24] bg-red-50" : "text-stone-600"
                        )}
                      >
                        {size.icon}
                        <span className="flex-1 truncate">{size.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={generateQrCode}
              disabled={isGeneratingQr}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-lg border border-stone-100 text-sm font-bold hover:bg-stone-50 transition-all disabled:opacity-50"
            >
              {isGeneratingQr ? (
                <span className="animate-spin text-stone-400"><QrCode size={18} /></span>
              ) : (
                <QrCode size={18} />
              )}
              {isGeneratingQr ? '生成中...' : '下载二维码'}
            </button>
            <button 
              onClick={() => setCurrentView('gallery')}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-lg border border-stone-100 text-sm font-bold hover:bg-stone-50 transition-all"
            >
              <Share2 size={18} /> 分享作品
            </button>
          </div>
        </Panel>
      </PanelGroup>

      {/* 3D Preview Drawer */}
      <div
        className={cn(
          "absolute top-24 right-0 z-40 w-80 h-[600px] bg-white shadow-2xl border-y border-l border-stone-200 rounded-l-3xl transition-transform duration-500 flex flex-col",
          is3DPreviewOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Toggle Tab */}
        <button
          onClick={() => setIs3DPreviewOpen(!is3DPreviewOpen)}
          className="absolute top-1/2 -translate-y-1/2 -left-10 w-10 h-24 bg-white border-y border-l border-stone-200 rounded-l-xl flex items-center justify-center shadow-[-4px_0_12px_rgba(0,0,0,0.05)] text-stone-400 hover:text-[#9F2B24] transition-colors"
        >
          {is3DPreviewOpen ? <ChevronRight size={20} /> : <Box size={20} />}
        </button>

        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2"><Box size={16} className="text-[#9F2B24]"/> 仰韶彩陶 · 3D 预览</h3>
        </div>
        <div 
          className="flex-1 relative min-h-0"
        >
          <PotteryPreview ref={potteryPreviewRef} modelUrl={modelUrl} autoRotate={autoRotate} potteryColor={bgColor} patternScale={patternScale} />
        </div>
        <div className="p-4 border-t border-stone-100 bg-white rounded-bl-3xl space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-stone-600">图案缩放 (自动无缝贴合)</label>
              <span className="text-xs text-stone-400">{patternScale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.1" 
              value={patternScale}
              onChange={(e) => {
                setPatternScale(parseFloat(e.target.value));
                setTimeout(() => {
                  if (potteryPreviewRef.current && canvasRef.current) {
                    potteryPreviewRef.current.updateTexture(canvasRef.current);
                  }
                }, 0);
              }}
              className="w-full accent-[#9F2B24]"
            />
          </div>
          <button
            onClick={handlePlaceOnPottery}
            className="w-full py-3 bg-[#9F2B24] text-white rounded-xl font-bold shadow-lg shadow-red-900/20 hover:bg-[#85221c] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> 投射到陶器
          </button>
        </div>
      </div>

      {/* Gallery Button */}
      <button
        onClick={() => setCurrentView('gallery')}
        className="absolute bottom-8 right-8 z-50 w-14 h-14 bg-[#9F2B24] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-[#85221c] transition-all group"
        title="探索作品展厅"
      >
        <Landmark size={24} className="group-hover:scale-110 transition-transform duration-500" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
          </div>
        </div>

        {/* Gallery View */}
        <GalleryPage onBack={() => setCurrentView('editor')} />
      </motion.div>

      {/* QR Code Modal for Download */}
      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setIsQrModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-stone-100"
            >
              <h3 className="text-xl font-bold text-stone-800 mb-2 font-serif-sc flex items-center gap-2">
                <QrCode className="text-[#9F2B24]" />
                扫码下载图片
              </h3>
              <p className="text-sm text-stone-500 mb-6 text-center">
                使用手机扫描下方二维码，即可在手机上查看并保存您创作的图案。
              </p>
              
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-stone-200 mb-6 flex justify-center">
                <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin />
              </div>
              
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&display=swap');
        .font-serif-sc { font-family: 'Noto Serif SC', serif; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}} />
    </div>
  );
}
