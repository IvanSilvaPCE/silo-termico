import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const TesteOBJ = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const largura = containerRef.current.clientWidth;
        const altura = containerRef.current.clientHeight;

        const cena = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, largura / altura, 0.1, 1000);
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);

        const renderizador = new THREE.WebGLRenderer({ antialias: true });
        renderizador.setSize(largura, altura);
        renderizador.setClearColor(0xcccccc); // fundo cinza
        containerRef.current.appendChild(renderizador.domElement);

        // OrbitControls (depois do renderizador)
        const controles = new OrbitControls(camera, renderizador.domElement);
        controles.enableDamping = true;

        // Luz ambiente
        const luzAmbiente = new THREE.AmbientLight(0xffffff, 1);
        cena.add(luzAmbiente);

        // Luz direcional
        const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.5);
        luzDirecional.position.set(10, 10, 10);
        cena.add(luzDirecional);

        // Grade e plano
        const grade = new THREE.GridHelper(20, 20);
        cena.add(grade);

        const plano = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide })
        );
        plano.rotation.x = Math.PI / 2;
        cena.add(plano);

        // Carrega .mtl e .obj
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('/modelos/');
        mtlLoader.load('projeto.mtl', (materiais) => {
            materiais.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materiais);
            objLoader.setPath('/modelos/');
            objLoader.load('projeto.obj', (obj) => {
                console.log("✅ Modelo carregado:", obj);

                obj.position.set(0, 0, 0);
                obj.scale.set(0.05, 0.05, 0.05);
                obj.rotation.x = -Math.PI / 2;

                // obj.traverse((child) => {
                //     if (child.isMesh) {
                //         child.material = new THREE.MeshNormalMaterial();
                //     }
                // });

                obj.traverse((child) => {
                    if (
                        child.isMesh &&
                        (
                            child.name.includes("Paredes__Parede básica__Genérico - 200 mm__291706") ||
                            child.name.includes("Paredes__Parede básica__Genérico - 200 mm__291707")
                        )
                    ) {
                        child.material.transparent = true;
                        child.material.opacity = 0.1;
                        child.material.depthWrite = false; // garante melhor efeito visual
                        child.material.side = THREE.DoubleSide;
                    }
                });

                cena.add(obj);

            });
        });

        const animate = () => {
            requestAnimationFrame(animate);
            controles.update();
            renderizador.render(cena, camera);
        };
        animate();

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, []);


    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100vh', backgroundColor: '#ccc' }}
        />
    );
};

export default TesteOBJ;
