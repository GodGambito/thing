import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createNoise2D } from 'simplex-noise';
import { Link } from 'react-router-dom';

const ThreeScene = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicialización
    const noise = createNoise2D();
    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const scene = new THREE.Scene();

    // Configuración de la luz
    const light = new THREE.DirectionalLight();
    light.position.set(1, 10, 10);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    scene.add(light);

    // Configuración del plano
    const sz = 55;
    const planeGeometry = new THREE.PlaneGeometry(sz, sz, 333, 333);

    for (let i = 0; i < planeGeometry.attributes.position.array.length; i += 3) {
      let x = planeGeometry.attributes.position.array[i + 0];
      let z = planeGeometry.attributes.position.array[i + 1];
      planeGeometry.attributes.position.array[i + 2] -= noise(x, z) / 10;
    }

    for (let i = 0; i < planeGeometry.attributes.normal.array.length; i++) {
      planeGeometry.attributes.normal.array[i] += Math.random() * 0.4;
    }
    planeGeometry.verticesNeedUpdate = true;

    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Configuración del agente
    const agentMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0e0 });
    const agent = new THREE.Mesh(sphereGeometry, agentMaterial);
    agent.scale.multiplyScalar(0.1);
    agent.position.set(0, 1, 0);
    scene.add(agent);

    // Configuración de objetos instanciados
    const o = new THREE.Object3D();
    for (let i = 0; i < 100; i++) {
      const mesh = new THREE.Mesh(sphereGeometry, agentMaterial);
      const gap = 0.2;
      const rnd = 1 - gap * 2;
      mesh.scale.multiplyScalar(0.1);
      let x = i % 10 - 5 + Math.random() * rnd + gap;
      let z = Math.floor(i / 10) - 5 + Math.random() * rnd + gap;
      mesh.position.set(
        x,
        -noise(x, -z) / 10,
        z
      );
      o.add(mesh);
    }

    //scene.add(o)

    const im = new THREE.InstancedMesh(sphereGeometry, agentMaterial, 20000);
    im.castShadow = true;
    im.receiveShadow = true;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(im);

    // Configuración de la cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(new THREE.Vector3(1, 0, 1));

    // Configuración del renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Configuración del raycaster
    const rc = new THREE.Raycaster();
    const pt = new THREE.Vector2();
    const tmp = new THREE.Object3D();

    // Funciones auxiliares
    const lerp = (a, b, t) => a + (b - a) * t;
    const smoothstep = (edge0, edge1, x) => {
      x = clamp((x - edge0) / (edge1 - edge0));
      return 3 * x ** 2 - 2 * x ** 3;
    };
    const clamp = (x) => Math.max(Math.min(1, x), 0);

    // Animación
    const animate = (t) => {
      if (renderer.getSize(new THREE.Vector2()).width !== window.innerWidth ||
          renderer.getSize(new THREE.Vector2()).height !== window.innerHeight) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }

      rc.setFromCamera(pt, camera);
      const intersects = rc.intersectObjects([plane]);

      if (intersects.length > 0) {
        let x = intersects[0].uv.x * sz - sz / 2;
        let z = sz / 2 - intersects[0].uv.y * sz;

        x = Math.max(-4, Math.min(4, x));
        z = Math.max(-4, Math.min(4, z));

        let dx = x - agent.position.x;
        let dz = z - agent.position.z;
        let speed = 0.1;

        agent.position.x += dx * speed;
        agent.position.z += dz * speed;
        agent.position.y = 1 - clamp(Math.abs(dx)) * 0.5;

        let index = 0;
        const r = 1.5;
        const { x: ax, y: ay, z: az } = agent.position;

        o.children.forEach(child => {
          const { x: cx, y: cy, z: cz } = child.position;
          const d = Math.hypot(cx - ax, cz - az);

          if (!child.active && d < r) {
            child.active = true;
            child.timestamp = Date.now();
          }

          if (child.active && d > r) {
            child.active = false;
            child.timestamp = Date.now();
          }

          if (child.timestamp) {
            const dt = (Date.now() - child.timestamp) / 100;
            let tt;
            if (child.active) {
              tt = Math.min(1, Math.max(0, dt));
            } else {
              tt = 1 - Math.min(1, Math.max(0, dt));
              if (dt > 1) {
                child.timestamp = null;
              }
            }

            let px = lerp(ax, cx, tt);
            let py = lerp(ay - 0.1, cy, tt);
            let pz = lerp(az, cz, tt);

            for (let i = 0; i < 1000; i++) {
              let t = i / 999;
              let x = lerp(px, ax, t);
              let y = lerp(py, ay, smoothstep(0, 0.9, smoothstep(0, 1, t)) ** 0.7);
              let z = lerp(pz, az, t);
              tmp.position.set(x, y, z);
              let k = t * t * t * 0.1 + smoothstep(0, 0.01, t) * 0.1;
              let s = (1 - Math.sin(t * 3.14) ** 0.2) * k + 0.01;
              tmp.scale.set(s, s, s);
              tmp.updateMatrix();
              im.setMatrixAt(index, tmp.matrix);
              index++;
            }
          }
        });

        im.count = index;
        im.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Event Listeners
    const handleMouseMove = (e) => {
      pt.x = (e.clientX / window.innerWidth) * 2 - 1;
      pt.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);

    // Iniciar animación
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div className="relative w-full h-full">
  {/* Botón de navegación */}
  <div className="absolute top-4 w-full flex justify-center z-10">
    <Link
      to="/"
      className="bg-white/50 hover:bg-black/70 text-white py-2 px-4 rounded-md shadow-md transition-all"
      style={{
        textShadow: '0 0 5px rgba(255,255,255,0.8)',
      }}
    >
      Inicio
    </Link>
  </div>

  {/* Contenedor de la escena */}
  <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
</div>;
};

export default ThreeScene;