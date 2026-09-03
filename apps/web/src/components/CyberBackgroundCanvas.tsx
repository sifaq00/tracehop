'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function CyberBackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer (Optimized for low-end GPUs)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 42);
    camera.lookAt(0, -2, -15);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // Huge performance boost on low-end Intel HD Graphics
      powerPreference: 'high-performance',
      precision: 'mediump', // Low memory bandwidth
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1); // Standard 1x DPR prevents GPU fillrate throttling on Celeron
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Optimized 3D Undulating Cyber Wave Grid
    const gridWidth = 200;
    const gridDepth = 140;
    const gridSegmentsX = 36; // Optimized vertex density for high FPS
    const gridSegmentsY = 26;
    const planeGeometry = new THREE.PlaneGeometry(
      gridWidth,
      gridDepth,
      gridSegmentsX,
      gridSegmentsY
    );
    planeGeometry.rotateX(-Math.PI / 2.35);
    planeGeometry.translate(0, -8, -15);

    // Custom Shader for Clean Cyber Violet Wave Grid with Distance Falloff
    const waveMaterial = new THREE.ShaderMaterial({
      transparent: true,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorDeep: { value: new THREE.Color('#4c1d95') },
        uColorVibrant: { value: new THREE.Color('#9333ea') },
        uColorCyan: { value: new THREE.Color('#38bdf8') },
        uColorAmber: { value: new THREE.Color('#ff7a29') },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vElevation;
        varying float vDist;

        void main() {
          vec3 pos = position;
          float wave1 = sin(pos.x * 0.06 + uTime * 0.8) * cos(pos.z * 0.05 + uTime * 0.6) * 3.2;
          float wave2 = sin(pos.x * 0.12 - uTime * 1.0 + pos.z * 0.08) * 1.6;
          pos.y += wave1 + wave2;

          vElevation = pos.y;
          vDist = length(position.xz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorDeep;
        uniform vec3 uColorVibrant;
        uniform vec3 uColorCyan;
        uniform vec3 uColorAmber;
        varying float vElevation;
        varying float vDist;

        void main() {
          float edgeAlpha = smoothstep(95.0, 20.0, vDist);
          float heightFactor = smoothstep(-3.0, 4.0, vElevation);
          vec3 baseColor = mix(uColorDeep, uColorVibrant, heightFactor);

          float cyanCrest = smoothstep(2.0, 4.5, vElevation);
          float amberCrest = smoothstep(3.5, 6.0, vElevation);
          vec3 finalColor = mix(baseColor, uColorCyan, cyanCrest * 0.6);
          finalColor = mix(finalColor, uColorAmber, amberCrest * 0.7);

          float alpha = (0.16 + heightFactor * 0.28) * edgeAlpha;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    const waveMesh = new THREE.Mesh(planeGeometry, waveMaterial);
    scene.add(waveMesh);

    // 3. Mouse Parallax Handler (Throttled)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isVisible = true;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 5. Animation Loop with Visibility & Scroll Culling
    let animId: number;
    const startTime = performance.now();
    let lastRenderTime = 0;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const onScroll = () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 80);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      // 1. Pause completely when tab is hidden or when scrolled past hero
      if (!isVisible || window.scrollY > 900) return;

      // 2. Pause during active scroll motion to free 100% GPU for smooth 60fps scrolling
      if (isScrolling) return;

      // Cap render rate to ~40fps to keep CPU/GPU cold
      if (currentTime - lastRenderTime < 24) return;
      lastRenderTime = currentTime;

      const elapsed = (currentTime - startTime) * 0.0008;

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      waveMaterial.uniforms.uTime.value = elapsed;
      waveMaterial.uniforms.uMouse.value.set(targetX, targetY);

      camera.position.x = targetX * 3.5;
      camera.position.y = 12 + targetY * 2.0;
      camera.lookAt(0, -2, -15);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      planeGeometry.dispose();
      waveMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
