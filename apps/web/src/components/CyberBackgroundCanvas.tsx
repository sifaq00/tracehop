'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function CyberBackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
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
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Pure, Sleek 3D Undulating Cyber Wave Grid (Smooth Continuous Wireframe)
    const gridWidth = 200;
    const gridDepth = 140;
    const gridSegmentsX = 75;
    const gridSegmentsY = 55;
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
        uColorDeep: { value: new THREE.Color('#4c1d95') }, // Deep purple
        uColorVibrant: { value: new THREE.Color('#9333ea') }, // Neon violet
        uColorCyan: { value: new THREE.Color('#38bdf8') }, // Cyber cyan crest
        uColorAmber: { value: new THREE.Color('#ff7a29') }, // Warm amber highlight
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vElevation;
        varying float vDist;

        void main() {
          vec3 pos = position;

          // Rolling multi-frequency sine wave
          float wave1 = sin(pos.x * 0.06 + uTime * 0.8) * cos(pos.z * 0.05 + uTime * 0.6) * 3.2;
          float wave2 = sin(pos.x * 0.12 - uTime * 1.0 + pos.z * 0.08) * 1.6;
          float wave3 = cos(pos.x * 0.03 + pos.z * 0.04 + uTime * 0.4) * 2.0;

          // Mouse ripple elevation
          float mouseDist = length(pos.xz - uMouse * vec2(40.0, 30.0));
          float mouseWave = sin(mouseDist * 0.18 - uTime * 2.0) * exp(-mouseDist * 0.04) * 3.5;

          pos.y += wave1 + wave2 + wave3 + mouseWave;

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
          // Radial fade out towards boundary edges
          float edgeAlpha = smoothstep(95.0, 20.0, vDist);

          // Elevation color gradient
          float heightFactor = smoothstep(-3.0, 4.0, vElevation);
          vec3 baseColor = mix(uColorDeep, uColorVibrant, heightFactor);

          // Peak crest highlights (cyan and amber)
          float cyanCrest = smoothstep(2.0, 4.5, vElevation);
          float amberCrest = smoothstep(3.5, 6.0, vElevation);
          vec3 finalColor = mix(baseColor, uColorCyan, cyanCrest * 0.6);
          finalColor = mix(finalColor, uColorAmber, amberCrest * 0.7);

          // Visible yet elegant transparency (0.16 to 0.44)
          float alpha = (0.16 + heightFactor * 0.28) * edgeAlpha;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    const waveMesh = new THREE.Mesh(planeGeometry, waveMaterial);
    scene.add(waveMesh);

    // 3. Mouse Parallax Handler
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 4. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 5. Animation Loop with High-Precision performance.now()
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = (performance.now() - startTime) * 0.001;

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Update shader uniforms
      waveMaterial.uniforms.uTime.value = elapsed;
      waveMaterial.uniforms.uMouse.value.set(targetX, targetY);

      // Camera tilt parallax
      camera.position.x = targetX * 4.5;
      camera.position.y = 12 + targetY * 2.5;
      camera.lookAt(0, -2, -15);

      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
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
