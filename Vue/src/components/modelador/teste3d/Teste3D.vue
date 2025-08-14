
<template>
  <div ref="container" style="width:100%;height:100vh;"></div>
</template>

<script>
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default {
  name: "Teste3D",
  mounted() {
    this.iniciarCena();
  },
  methods: {
    async iniciarCena() {
      const largura = window.innerWidth;
      const altura = window.innerHeight;

      // Criar cena
      const cena = new THREE.Scene();
      cena.background = new THREE.Color(0x87CEEB);

      // Criar câmera
      const camera = new THREE.PerspectiveCamera(60, largura / altura, 0.1, 2000);
      camera.position.set(15, 10, 15);

      // Criar renderizador
      const renderizador = new THREE.WebGLRenderer({ antialias: true });
      renderizador.setSize(largura, altura);
      renderizador.setPixelRatio(window.devicePixelRatio);
      renderizador.shadowMap.enabled = true;
      renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
      this.$refs.container.appendChild(renderizador.domElement);

      // OrbitControls
      const controles = new OrbitControls(camera, renderizador.domElement);
      controles.enableDamping = true;
      controles.dampingFactor = 0.05;
      controles.target.set(0, 0, 0);
      controles.minDistance = 2;
      controles.maxDistance = 100;
      controles.autoRotate = false;

      // Luzes
      const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
      cena.add(luzAmbiente);

      const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
      luzDirecional.position.set(50, 100, 50);
      luzDirecional.castShadow = true;
      luzDirecional.shadow.mapSize.width = 2048;
      luzDirecional.shadow.mapSize.height = 2048;
      luzDirecional.shadow.camera.near = 0.5;
      luzDirecional.shadow.camera.far = 500;
      cena.add(luzDirecional);

      // Grade no chão
      const grade = new THREE.GridHelper(100, 50, 0x888888, 0xcccccc);
      grade.position.set(0, 0, 0);
      cena.add(grade);

      // Chão
      const geometriaChao = new THREE.PlaneGeometry(200, 200);
      const materialChao = new THREE.MeshLambertMaterial({ color: 0x999999, transparent: true, opacity: 0.3 });
      const chao = new THREE.Mesh(geometriaChao, materialChao);
      chao.rotation.x = -Math.PI / 2;
      chao.position.set(0, -0.1, 0);
      chao.receiveShadow = true;
      cena.add(chao);

      try {
        // Carregar modelo 3D
        await this.carregarModelo(cena);
      } catch (error) {
        console.error('Erro ao carregar modelo:', error);
        // Criar um cubo simples se não conseguir carregar o modelo
        this.criarCuboAlternativo(cena);
      }

      // Loop de animação
      const animar = () => {
        requestAnimationFrame(animar);
        controles.update();
        renderizador.render(cena, camera);
      };
      animar();

      // Redimensionar janela
      window.addEventListener("resize", () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderizador.setSize(w, h);
      });
    },

    async carregarModelo(cena) {
      return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        
        // Carregar materiais primeiro
        mtlLoader.load(
          new URL('./projeto.mtl', import.meta.url).href,
          (materiais) => {
            materiais.preload();
            
            // Carregar objeto
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materiais);
            
            objLoader.load(
              new URL('./projeto.obj', import.meta.url).href,
              (objeto) => {
                // Processar o modelo
                objeto.traverse((child) => {
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Melhorar o material se necessário
                    if (child.material) {
                      child.material.side = THREE.DoubleSide;
                    }
                  }
                });

                // Calcular bounding box para centralizar
                const box = new THREE.Box3().setFromObject(objeto);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // CONTROLES MANUAIS DE POSIÇÃO - ALTERE AQUI:
                const posicaoManualX = 700;    // Mover para direita (+) ou esquerda (-)
                const posicaoManualY = -640;   // Mover para baixo (-) ou cima (+)
                const posicaoManualZ = -500;    // Mover para frente (+) ou trás (-)
                
                // Posicionar o objeto no centro da cena (0,0,0)
                objeto.position.set(-center.x, -center.y, -center.z);
                
                // Escalar o objeto para um tamanho apropriado
                const maxDimension = Math.max(size.x, size.y, size.z);
                let scale = 1;
                if (maxDimension > 0) {
                  scale = 20 / maxDimension; // Escalar para ter 20 unidades de tamanho máximo
                }
                objeto.scale.setScalar(scale);
                
                // Após escalar, recalcular o centro e reposicionar
                box.setFromObject(objeto);
                const newCenter = box.getCenter(new THREE.Vector3());
                objeto.position.set(-newCenter.x, -newCenter.y, -newCenter.z);
                
                // Aplicar ajustes manuais de posição
                objeto.position.x += posicaoManualX;
                objeto.position.y += posicaoManualY;
                objeto.position.z += posicaoManualZ;
                
                console.log('Modelo centralizado em:', objeto.position);
                console.log('Tamanho do modelo:', size);
                
                cena.add(objeto);
                console.log('Modelo carregado com sucesso!');
                resolve();
              },
              (progresso) => {
                console.log('Carregando modelo...', (progresso.loaded / progresso.total * 100) + '%');
              },
              (erro) => {
                console.error('Erro ao carregar OBJ:', erro);
                reject(erro);
              }
            );
          },
          (progresso) => {
            console.log('Carregando materiais...', (progresso.loaded / progresso.total * 100) + '%');
          },
          (erro) => {
            console.error('Erro ao carregar MTL:', erro);
            reject(erro);
          }
        );
      });
    },

    criarCuboAlternativo(cena) {
      // Criar um cubo simples como alternativa
      const geometria = new THREE.BoxGeometry(5, 5, 5);
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const cubo = new THREE.Mesh(geometria, material);
      cubo.position.set(0, 2.5, 0);
      cubo.castShadow = true;
      cubo.receiveShadow = true;
      cena.add(cubo);
      
      console.log('Modelo alternativo (cubo) criado');
    }
  }
};
</script>

<style scoped>
div {
  overflow: hidden;
}
</style>
