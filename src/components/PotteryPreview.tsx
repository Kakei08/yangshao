import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Loader2 } from 'lucide-react';

interface PotteryPreviewProps {
  modelUrl?: string;
  autoRotate?: boolean;
  potteryColor?: string;
  patternScale?: number;
}

export interface PotteryPreviewHandle {
  updateTexture: (canvas: HTMLCanvasElement) => void;
}

const PotteryPreview = forwardRef<PotteryPreviewHandle, PotteryPreviewProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const potteryRef = useRef<THREE.Mesh | THREE.Group | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const potteryColorRef = useRef(props.potteryColor);

  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/bgpic/3.jpg";
    img.onload = () => {
      bgImgRef.current = img;
      setBgLoaded(true);
    };
  }, []);

  // When background loads or color changes, we need the parent to re-project if possible, 
  // but we don't have the canvas. We can wait for parent to call updateTexture.

  useEffect(() => {
    potteryColorRef.current = props.potteryColor;
  }, [props.potteryColor]);

  useEffect(() => {
    if (potteryRef.current && props.potteryColor) {
      const insideColor = new THREE.Color(props.potteryColor).multiplyScalar(0.85);
      const outsideColor = new THREE.Color(props.potteryColor);
      
      potteryRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.isInsideMesh) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color.copy(insideColor);
            mat.needsUpdate = true;
          } else {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(m => {
              const mat = m as THREE.MeshStandardMaterial;
              if (!mat.map) {
                mat.color.copy(outsideColor);
                mat.needsUpdate = true;
              }
            });
          }
        }
      });
    }
  }, [props.potteryColor]);

  useImperativeHandle(ref, () => ({
    updateTexture: (canvas: HTMLCanvasElement) => {
      if (!potteryRef.current) return;

      const texCanvasSize = 2048;
      const texCanvas = document.createElement('canvas');
      texCanvas.width = texCanvasSize;
      texCanvas.height = texCanvasSize;
      const ctx = texCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = potteryColorRef.current || '#E6D5C3';
      ctx.fillRect(0, 0, texCanvasSize, texCanvasSize);
      
      if (bgImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(bgImgRef.current, 0, 0, texCanvasSize, texCanvasSize);
        ctx.restore();
      }

      const BAND_TOP = 0.1;
      const BAND_BOTTOM = 0.7;
      const BAND_HEIGHT = BAND_BOTTOM - BAND_TOP;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const box = new THREE.Box3().setFromObject(potteryRef.current);
      const size = box.getSize(new THREE.Vector3());
      const diameter = Math.max(size.x, size.z);
      const circumference = Math.PI * diameter;
      const physicalHeight = size.y;
      const physicalBandHeight = physicalHeight * BAND_HEIGHT;
      
      const canvasAspect = canvas.width / canvas.height;
      
      const scaleFactor = props.patternScale || 1.0;
      const minN = circumference / (physicalBandHeight * canvasAspect);
      
      const targetN = minN / scaleFactor;
      const tilesX = Math.max(1, Math.round(targetN));
      
      const drawW = texCanvasSize / tilesX;
      const drawnPhysicalHeight = (circumference / tilesX) / canvasAspect;
      const drawH = (drawnPhysicalHeight / physicalHeight) * texCanvasSize;
      
      const bandCenterY = texCanvasSize * BAND_TOP + (texCanvasSize * BAND_HEIGHT) / 2;
      const startY = bandCenterY - drawH / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, texCanvasSize * BAND_TOP, texCanvasSize, texCanvasSize * BAND_HEIGHT);
      ctx.clip();

      for (let i = 0; i < tilesX; i++) {
        ctx.drawImage(
          canvas, 
          0, 0, canvas.width, canvas.height,
          i * drawW, startY, drawW, drawH
        );
      }

      ctx.restore();

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      
      if (rendererRef.current) {
        texture.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
      }
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;

      potteryRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const mat = material as THREE.MeshStandardMaterial;
          mat.map = texture;
          mat.color.set(0xffffff);
          mat.transparent = false;
          mat.opacity = 1.0;
          
          const baseColor = new THREE.Color(potteryColorRef.current || '#E6D5C3');
          const r = baseColor.r.toFixed(5);
          const g = baseColor.g.toFixed(5);
          const b = baseColor.b.toFixed(5);
          
          mat.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              `#include <common>
               varying vec3 vMyWorldPos;
               varying vec3 vMyWorldNorm;`
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
               vMyWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
               vMyWorldNorm = normalize((modelMatrix * vec4(normal, 0.0)).xyz);`
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <common>',
              `#include <common>
               varying vec3 vMyWorldPos;
               varying vec3 vMyWorldNorm;`
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_fragment>',
              `
               #ifdef USE_MAP
                 float angle = atan(vMyWorldPos.x, vMyWorldPos.z);
                 float u = (angle / (2.0 * 3.14159265359)) + 0.5;
                 float v = vMyWorldPos.y / ${physicalHeight.toFixed(5)} + 0.5;
                 vec2 myUv = vec2(u, v);
                 
                 vec4 sampledDiffuseColor = texture2D( map, myUv );
                 diffuseColor *= sampledDiffuseColor;
                 
                 vec2 pos2d = vec2(vMyWorldPos.x, vMyWorldPos.z);
                 vec2 norm2d = vec2(vMyWorldNorm.x, vMyWorldNorm.z);
                 if (dot(pos2d, norm2d) <= 0.01) {
                   diffuseColor = vec4(${r}, ${g}, ${b}, opacity);
                 }
               #endif`
            );
          };
          mat.customProgramCacheKey = () => 'inside_cull_' + baseColor.getHexString();
          mat.needsUpdate = true;
        }
      });
      textureRef.current = texture;
    }
  }));

  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !!props.autoRotate;
    }
  }, [props.autoRotate]);

  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const width = canvasContainer.clientWidth || 800;
    const height = canvasContainer.clientHeight || 600;
    const aspect = width / height;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    camera.position.set(0, 2, 10);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    while (canvasContainer.firstChild) {
      canvasContainer.removeChild(canvasContainer.firstChild);
    }
    canvasContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    const topLight = new THREE.PointLight(0xffffff, 1.5);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    const camLight = new THREE.PointLight(0xffffff, 1.0);
    camera.add(camLight);
    scene.add(camera);

    let currentModelUrl = props.modelUrl || '/model.gltf';
    
    setIsLoading(true);
    
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    let isLoaded = false;

    let loadTimeout = setTimeout(() => {
      if (!isLoaded) {
        setIsLoading(false);
      }
    }, 10000);

    try {
      loader.load(
        currentModelUrl,
        (gltf) => {
          if (!gltf || !gltf.scene) {
            return;
          }
          isLoaded = true;
          clearTimeout(loadTimeout);
          const model = gltf.scene;

          try {
            // Calculate bounding box on the original model to keep transforms intact
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // Re-center model
            model.position.set(
              model.position.x - center.x,
              model.position.y - center.y,
              model.position.z - center.z
            );
            
            const centeredWrapper = new THREE.Group();
            centeredWrapper.add(model);
            
            let maxDim = Math.max(size.x, size.y, size.z);
            if (isNaN(maxDim) || maxDim <= 0) maxDim = 1;
            
            const targetSize = 4.5;
            const scale = targetSize / maxDim;
            centeredWrapper.scale.setScalar(scale);

            // Setup materials on all meshes
            centeredWrapper.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.frustumCulled = false;
                
                const geometry = mesh.geometry;
                if (geometry && !geometry.attributes.normal) {
                  try { geometry.computeVertexNormals(); } catch(e) {}
                }

                if (mesh.material) {
                  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                  materials.forEach(m => {
                    const mat = m as THREE.MeshStandardMaterial;
                    mat.side = THREE.DoubleSide;
                    mat.roughness = 0.6;
                    mat.metalness = 0.1;
                    mat.transparent = false;
                    mat.opacity = 1.0;
                    mat.color.set(potteryColorRef.current || 0xE6D5C3);
                    if (textureRef.current) {
                      mat.map = textureRef.current;
                      mat.color.set(0xffffff);
                    } else {
                      mat.map = null;
                    }
                    mat.needsUpdate = true;
                  });
                }
              }
            });

            if (potteryRef.current && potteryRef.current.parent === scene) {
              scene.remove(potteryRef.current);
            }
            
            scene.add(centeredWrapper);
            potteryRef.current = centeredWrapper;
          } catch (err) {
            console.error('Error processing model meshes:', err);
          } finally {
            setIsLoading(false);
          }
        },
        undefined,
        (error) => {
          isLoaded = true;
          clearTimeout(loadTimeout);
          setIsLoading(false);
        }
      );
    } catch (e) {
      isLoaded = true;
      clearTimeout(loadTimeout);
      setIsLoading(false);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.autoRotate = !!props.autoRotate;
    controls.autoRotateSpeed = 2.0;

    const handleResize = () => {
      if (!canvasContainer) return;
      const w = canvasContainer.clientWidth;
      const h = canvasContainer.clientHeight;
      
      requestAnimationFrame(() => {
        if (!canvasContainer) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvasContainer);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      try {
        if (controlsRef.current) controlsRef.current.update();
        renderer.render(scene, camera);
      } catch (e) {
        cancelAnimationFrame(animationFrameId);
      }
    };
    animate();

    return () => {
      isLoaded = true;
      clearTimeout(loadTimeout);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      try { renderer.dispose(); } catch (e) {}
      try { dracoLoader.dispose(); } catch (e) {}
      if (canvasContainer && renderer.domElement.parentNode === canvasContainer) {
        try { canvasContainer.removeChild(renderer.domElement); } catch (e) {}
      }
    };
  }, [props.modelUrl]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden rounded-2xl shadow-inner border border-stone-200"
      style={{
        backgroundColor: 'transparent',
        backgroundImage: 'url("/assets/3d/potterybg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div ref={canvasContainerRef} className="absolute inset-0 z-0" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#9F2B24]" />
          <p className="font-serif-sc tracking-widest">模型加载中...</p>
        </div>
      )}
    </div>
  );
});

PotteryPreview.displayName = 'PotteryPreview';

export default PotteryPreview;
