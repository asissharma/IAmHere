"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export default function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number>();

  const snippets = useRef<string[]>([
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),
    "{", "}", ";", "#", "<>", "()", "=>", "=", "+", "-", "*", "/", ":", ".",
    "if", "else", "while", "for", "return", "let", "const", "int", "void",
    "helloWorld()", "printf()", "#include", "class", "public", "static",
  ]).current;

  const createTextSprite = useCallback((text: string, color = "#00ffcc") => {
    const canvas = document.createElement("canvas");
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.font = "64px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(material);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // === Scene Setup ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const pointLight = new THREE.PointLight(0x00ffcc, 1);
    pointLight.position.set(50, 50, 100);
    scene.add(pointLight);

    // Groups for batch updates
    const spriteGroup = new THREE.Group();
    const textGroup = new THREE.Group();
    scene.add(spriteGroup, textGroup);

    const velocityMap = new WeakMap<THREE.Object3D, THREE.Vector3>();
    const meteorFlag = new WeakMap<THREE.Object3D, boolean>();

    // === Sprite Particles ===
    for (let i = 0; i < 800; i++) {
      const sprite = createTextSprite(snippets[Math.floor(Math.random() * snippets.length)]);
      sprite.position.set((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600);
      sprite.scale.set(10, 10, 1);
      spriteGroup.add(sprite);

      velocityMap.set(sprite, new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3));
      meteorFlag.set(sprite, false);
    }

    // === 3D Text Particles ===
    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      for (let i = 0; i < 200; i++) {
        const text = snippets[Math.floor(Math.random() * snippets.length)];
        const geo = new TextGeometry(text, { font, size: 2, height: 0.05 });
        geo.center();

        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x00ffcc }));
        mesh.position.set((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400);

        textGroup.add(mesh);
        velocityMap.set(mesh, new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3));
        meteorFlag.set(mesh, false);
      }
    });

    // Interactivity
    let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onClick = () => {
      [...spriteGroup.children, ...textGroup.children].forEach((obj) => {
        velocityMap.get(obj)!.add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      targetRotX += (mouseY * 0.2 - targetRotX) * 0.05;
      targetRotY += (mouseX * 0.2 - targetRotY) * 0.05;
      scene.rotation.x = targetRotX;
      scene.rotation.y = targetRotY;

      [...spriteGroup.children, ...textGroup.children].forEach((obj) => {
        const velocity = velocityMap.get(obj)!;
        obj.position.add(velocity);

        if (!meteorFlag.get(obj) && Math.random() < 0.002) {
          velocity.set((Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1, -3 - Math.random() * 5);
          meteorFlag.set(obj, true);
        }
        if (obj.position.length() > 500) {
          obj.position.set((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, 300);
          velocity.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
          meteorFlag.set(obj, false);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId.current!);
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material as THREE.Material;
          mat.dispose();
        }
      });
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      containerRef.current!.innerHTML = "";
    };
  }, [createTextSprite, snippets]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}
