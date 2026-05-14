'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { elements, Element, ElementCategory } from '@/lib/elements';

interface ThreeSphereProps {
  onElementClick: (element: Element) => void;
}

const categoryColors: Record<ElementCategory, string> = {
  'alkali metal': '#ef4444',
  'alkaline earth metal': '#f97316',
  'transition metal': '#eab308',
  'post-transition metal': '#14b8a6',
  'metalloid': '#10b981',
  'reactive nonmetal': '#3b82f6',
  'noble gas': '#ec4899',
  'halogen': '#a855f7',
  'lanthanide': '#6366f1',
  'actinide': '#06b6d4',
  'unknown': '#52525b',
};

export default function ThreeSphere({ onElementClick }: ThreeSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 800;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(500, 500, 500);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    // Create element labels
    const sprites: THREE.Sprite[] = [];
    const radius = 400;

    elements.forEach((el, i) => {
      // Create texture for the label
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card Background
      ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
      ctx.fillRect(0, 0, 128, 128);
      
      // Border
      ctx.strokeStyle = categoryColors[el.category];
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 124, 124);

      // Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(el.symbol, 64, 75);

      // Number
      ctx.font = '20px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(el.number.toString(), 25, 25);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);

      // Position on sphere
      const phi = Math.acos(-1 + (2 * i) / elements.length);
      const theta = Math.sqrt(elements.length * Math.PI) * phi;

      sprite.position.setFromSphericalCoords(radius, phi, theta);
      sprite.scale.set(60, 60, 1);
      
      // Custom data for raycasting
      sprite.userData = { element: el };
      
      group.add(sprite);
      sprites.push(sprite);
    });

    // Interaction (Raycasting)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);

      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Sprite;
        onElementClick(object.userData.element);
      }
    };

    renderer.domElement.addEventListener('click', onClick);

    // Animation
    let animationFrameId: number;
    const animate = () => {
      group.rotation.y += 0.005;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      scene.clear();
      renderer.dispose();
    };
  }, [onElementClick]);

  return (
    <div ref={containerRef} className="w-full h-[800px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
    </div>
  );
}
