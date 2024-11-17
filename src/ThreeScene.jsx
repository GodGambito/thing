import React, { useEffect, useRef } from "react";
import * as THREE from "three";
//import { SimplexNoise } from "simplex-noise";
import { createNoise2D } from 'simplex-noise';
//const SimplexNoise = (await import('https://cdn.jsdelivr.net/npm/simplex-noise-esm@2.5.0-esm.0/dist-esm/simplex-noise.js')).default;

//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const noise = createNoise2D();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(new THREE.Vector3(1, 0, 1));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight();
    light.position.set(1, 10, 10);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    scene.add(light);

    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const planeGeometry = new THREE.PlaneGeometry(55, 55, 333, 333);

    // Modify plane geometry with noise
    const positionArray = planeGeometry.attributes.position.array;
    for (let i = 0; i < positionArray.length; i += 3) {
      const x = positionArray[i];
      const z = positionArray[i + 1];
      positionArray[i + 2] -= noise(x, z) / 10;
    }
    planeGeometry.attributes.position.needsUpdate = true;

    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const agentMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0e0 });
    const agent = new THREE.Mesh(sphereGeometry, agentMaterial);
    agent.scale.multiplyScalar(0.1);
    agent.position.set(0, 1, 0);
    scene.add(agent);

    const im = new THREE.InstancedMesh(sphereGeometry, agentMaterial, 20000);
    im.castShadow = true;
    im.receiveShadow = true;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(im);

    const rc = new THREE.Raycaster();
    const pt = new THREE.Vector2();
    const tmp = new THREE.Object3D();

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    const onMouseMove = (e) => {
      const { width, height } = renderer.domElement;
      pt.x = (e.offsetX / width) * 2 - 1;
      pt.y = 1 - (e.offsetY / height) * 2;
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    const animate = () => {
      rc.setFromCamera(pt, camera);
      const intersects = rc.intersectObjects([plane]);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        let x = intersect.uv.x * 55 - 55 / 2;
        let z = 55 / 2 - intersect.uv.y * 55;

        x = Math.max(-4, Math.min(4, x));
        z = Math.max(-4, Math.min(4, z));

        const dx = x - agent.position.x;
        const dz = z - agent.position.z;

        const speed = 0.1;
        agent.position.x += dx * speed;
        agent.position.z += dz * speed;
        agent.position.y = 1 - clamp(Math.abs(dx)) * 0.5;

        // Instance mesh updates
        let index = 0;
        const r = 1.5;
        const { x: ax, y: ay, z: az } = agent.position;
        tmp.position.set(ax, ay, az);
        tmp.updateMatrix();
        im.setMatrixAt(index, tmp.matrix);
        im.count = index;
        im.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const clamp = (x) => Math.max(0, Math.min(1, x));
    animate();

    return () => {
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      mountRef.current.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />;
};

export default ThreeScene;
