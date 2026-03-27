import React, { useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import "./canvas-preview.css";

const getDimensions = (label) => {
  if (!label) return { w: 12, h: 12 };
  const match = label.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return { w: 12, h: 12 };
  return { w: parseInt(match[1], 10), h: parseInt(match[2], 10) };
};

const REAL_SCALE = 0.02;
const REAL_DEPTH_CM = 2.3;

const CanvasPreview = ({ medida, precio }) => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const scaleAnimRef = useRef(null);
  const groupRef = useRef(null);
  const baseSizeRef = useRef({ w: 12 * REAL_SCALE, h: 12 * REAL_SCALE });

  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    targetRotX: 0.15,
    targetRotY: -0.3,
    rotX: 0.15,
    rotY: -0.3,
  });

  const { w, h } = useMemo(() => getDimensions(medida), [medida]);

  // 1. Setup Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    const bw = 12 * REAL_SCALE;
    const bh = 12 * REAL_SCALE;
    const depth = REAL_DEPTH_CM * REAL_SCALE;
    baseSizeRef.current = { w: bw, h: bh };

    const canvasGroup = new THREE.Group();
    groupRef.current = canvasGroup;
    scene.add(canvasGroup);

    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x9c7b4f,
      roughness: 0.8,
      metalness: 0.1,
    });
    const canvasMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 1.0,
    });

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bh, depth),
      woodMaterial
    );
    frame.castShadow = true;
    canvasGroup.add(frame);

    const canvasFront = new THREE.Mesh(
      new THREE.PlaneGeometry(bw, bh),
      canvasMaterial
    );
    canvasFront.position.z = depth / 2 + 0.005;
    canvasGroup.add(canvasFront);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.1 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -bh / 2 - 0.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const drag = dragRef.current;
      drag.rotX += (drag.targetRotX - drag.rotX) * 0.1;
      drag.rotY += (drag.targetRotY - drag.rotY) * 0.1;
      canvasGroup.rotation.x = drag.rotX;
      canvasGroup.rotation.y = drag.rotY;
      shadowPlane.position.y = -(bh * canvasGroup.scale.y) / 2 - 0.15;
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameRef.current);
      cancelAnimationFrame(scaleAnimRef.current);
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []);

  // 2. Animacion de escala al cambiar medida
  useEffect(() => {
    if (!groupRef.current) return;
    const targetScaleX = (w * REAL_SCALE) / baseSizeRef.current.w;
    const targetScaleY = (h * REAL_SCALE) / baseSizeRef.current.h;

    cancelAnimationFrame(scaleAnimRef.current);

    const step = () => {
      const g = groupRef.current;
      if (!g) return;
      g.scale.x += (targetScaleX - g.scale.x) * 0.1;
      g.scale.y += (targetScaleY - g.scale.y) * 0.1;
      const doneX = Math.abs(targetScaleX - g.scale.x) < 0.001;
      const doneY = Math.abs(targetScaleY - g.scale.y) < 0.001;
      if (!doneX || !doneY) {
        scaleAnimRef.current = requestAnimationFrame(step);
      } else {
        g.scale.x = targetScaleX;
        g.scale.y = targetScaleY;
      }
    };

    scaleAnimRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(scaleAnimRef.current);
  }, [w, h]);

  // 3. Handlers de arrastre
  const startDrag = useCallback((x, y) => {
    dragRef.current.active = true;
    dragRef.current.lastX = x;
    dragRef.current.lastY = y;
  }, []);

  const moveDrag = useCallback((x, y) => {
    if (!dragRef.current.active) return;
    const dx = x - dragRef.current.lastX;
    const dy = y - dragRef.current.lastY;
    dragRef.current.targetRotY += dx * 0.01;
    dragRef.current.targetRotX = Math.max(
      -0.6,
      Math.min(0.6, dragRef.current.targetRotX + dy * 0.01)
    );
    dragRef.current.lastX = x;
    dragRef.current.lastY = y;
  }, []);

  const stopDrag = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // 4. touchmove con passive:false para preventDefault en iOS
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [moveDrag]);

  // 5. JSX
  return (
    <div className="canvas-wrapper">
      {precio > 0 && (
        <div className="canvas-price-tag">
          \${precio.toFixed(2)} <span>c/u</span>
        </div>
      )}
      <div
        ref={mountRef}
        className="canvas-threejs"
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={stopDrag}
      />
      <p className="canvas-hint">Arrastra para rotar - {w}x{h}cm</p>
    </div>
  );
};

export default CanvasPreview;