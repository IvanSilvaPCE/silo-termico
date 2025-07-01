
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const TopoArmazem = ({ onArcoSelecionado, arcoAtual }) => {
    const containerRef = useRef(null);
    const [dadosPendulos, setDadosPendulos] = useState(null);
    const [arcoSelecionado, setArcoSelecionado] = useState(1);
    const [celulaSelecionada, setCelulaSelecionada] = useState(1);
    const [layoutTopo, setLayoutTopo] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    // Carregar dados reais da rota /pendulos
    useEffect(() => {
        const carregarDadosPendulos = async () => {
            try {
                setCarregando(true);
                setErro(null);
                
                const response = await fetch('/api/pendulos');
                if (!response.ok) {
                    throw new Error(`Erro ao carregar dados: ${response.status}`);
                }
                
                const dados = await response.json();
                setDadosPendulos(dados.pendulos);

                // Gerar layout baseado nos dados reais
                const layout = gerarLayoutTopoComDadosReais(dados.pendulos);
                setLayoutTopo(layout);

            } catch (error) {
                console.error('Erro ao carregar dados dos pêndulos:', error);
                setErro(error.message);
                
                // Fallback para dados de exemplo em caso de erro
                const dadosExemplo = gerarDadosExemplo();
                setDadosPendulos(dadosExemplo);
                const layout = gerarLayoutTopoComDadosReais(dadosExemplo);
                setLayoutTopo(layout);
            } finally {
                setCarregando(false);
            }
        };

        carregarDadosPendulos();
        
        // Atualizar dados a cada 30 segundos
        const interval = setInterval(carregarDadosPendulos, 30000);
        return () => clearInterval(interval);
    }, []);

    // Atualizar quando arco atual mudar
    useEffect(() => {
        if (arcoAtual && arcoAtual !== arcoSelecionado) {
            setArcoSelecionado(arcoAtual);
            if (layoutTopo) {
                // Atualizar célula baseada no arco selecionado
                const celula = layoutTopo[arcoAtual]?.celula || 1;
                setCelulaSelecionada(celula);
            }
        }
    }, [arcoAtual, layoutTopo]);

    // Atualizar SVG quando dados mudarem
    useEffect(() => {
        if (!layoutTopo || !dadosTopo) return;

        const container = containerRef.current;
        if (!container) return;

        criarSVGTopo();
    }, [layoutTopo, dadosTopo, arcoSelecionado, celulaSelecionada]);

    function gerarLayoutTopoComDadosReais(pendulos) {
        if (!pendulos) return null;

        const totalPendulos = Object.keys(pendulos).length;
        const pendulosPorFileira = Math.ceil(totalPendulos / 3); // 3 células
        const larguraTotal = 600;
        const larguraCelula = (larguraTotal - 20) / 3; // 20px para margens

        const layout = {
            celulas: {
                tamanho_svg: [larguraTotal, 388],
                fundo: [5, 49, larguraTotal - 10, 256],
                "1": [10, 50, larguraCelula - 10, 254],
                "2": [10 + larguraCelula, 50, larguraCelula - 10, 254], 
                "3": [10 + larguraCelula * 2, 50, larguraCelula - 10, 254]
            },
            aeradores: {
                "1": [65, 0, 1],
                "2": [154, 0, 1],
                "3": [240, 0, 1],
                "4": [329, 0, 1],
                "5": [416, 0, 1],
                "6": [65, 305, 0],
                "7": [154, 305, 0],
                "8": [240, 305, 0],
                "9": [329, 305, 0],
                "10": [416, 305, 0]
            }
        };

        // Distribuir pêndulos nas células e criar "arcos" (grupos de pêndulos)
        const pendulosArray = Object.entries(pendulos);
        let arcoAtual = 1;
        let posX = 25;
        const espacamentoArco = 25;

        for (let i = 0; i < pendulosArray.length; i += 3) {
            const pendulosDoArco = pendulosArray.slice(i, i + 3);
            const celula = Math.ceil(arcoAtual / Math.ceil(totalPendulos / 9)) || 1; // Distribuir em 3 células

            layout[arcoAtual] = {
                celula: Math.min(celula, 3),
                pos_x: posX,
                pendulos: pendulosDoArco.map(([id, dados]) => ({
                    id: parseInt(id),
                    temperatura: dados[3], // 4º elemento é a temperatura
                    alarme: dados[0],      // 1º elemento é alarme
                    preAlarme: dados[1],   // 2º elemento é pré-alarme
                    ativo: dados[2]        // 3º elemento é ativo
                }))
            };

            posX += espacamentoArco;
            arcoAtual++;
        }

        return layout;
    }

    function gerarDadosExemplo() {
        const dadosExemplo = {};
        for (let i = 1; i <= 57; i++) {
            dadosExemplo[i] = [
                false, // alarme
                false, // pré-alarme
                true,  // ativo
                20 + Math.random() * 15 // temperatura
            ];
        }
        return dadosExemplo;
    }

    function criarSVGTopo() {
        const container = containerRef.current;
        const svgExistente = container.querySelector("#des_topo_armazem");
        if (svgExistente) svgExistente.remove();

        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.setAttribute("id", "des_topo_armazem");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "400px");
        svgEl.setAttribute("viewBox", `0 0 ${layoutTopo.celulas.tamanho_svg[0]} ${layoutTopo.celulas.tamanho_svg[1]}`);
        svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px; shape-rendering:geometricPrecision; text-rendering:geometricPrecision;");
        
        container.appendChild(svgEl);

        // Desenhar elementos
        desenharFundo();
        desenharCelulas();
        desenharArcos();
        desenharAeradores();
        
        // Aplicar seleções
        atualizarSelecoes();
        atualizarVisualizacaoPendulos();

        // Adicionar eventos de clique
        adicionarEventosClique();
    }

    function desenharFundo() {
        const svgEl = document.getElementById("des_topo_armazem");
        const fundo = layoutTopo.celulas.fundo;
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("id", "rec_celula0");
        rect.setAttribute("x", fundo[0]);
        rect.setAttribute("y", fundo[1]);
        rect.setAttribute("width", fundo[2]);
        rect.setAttribute("height", fundo[3]);
        rect.setAttribute("fill", "#B3B3B3");
        rect.setAttribute("stroke-width", "2");
        rect.setAttribute("rx", "5");
        rect.setAttribute("ry", "5");
        
        svgEl.appendChild(rect);
    }

    function desenharCelulas() {
        const svgEl = document.getElementById("des_topo_armazem");
        
        for (let celula = 1; celula <= 3; celula++) {
            const celulaData = layoutTopo.celulas[celula.toString()];
            
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("id", `rec_celula${celula}`);
            rect.setAttribute("x", celulaData[0]);
            rect.setAttribute("y", celulaData[1]);
            rect.setAttribute("width", celulaData[2]);
            rect.setAttribute("height", celulaData[3]);
            rect.setAttribute("fill", "#B3B3B3");
            rect.setAttribute("stroke", "#B3B3B3");
            rect.setAttribute("stroke-width", "2");
            rect.setAttribute("rx", "5");
            rect.setAttribute("ry", "5");
            rect.style.cursor = "pointer";
            
            svgEl.appendChild(rect);
        }
    }

    function desenharArcos() {
        const svgEl = document.getElementById("des_topo_armazem");
        
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoData = layoutTopo[key];
                desenharArco(parseInt(key), arcoData);
            }
        });
    }

    function desenharArco(idArco, dadosArco) {
        const svgEl = document.getElementById("des_topo_armazem");
        const posX = dadosArco.pos_x;
        
        // Grupo do arco
        const grupoArco = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupoArco.setAttribute("id", `arco_${idArco}`);
        grupoArco.style.cursor = "pointer";
        
        // Retângulo de seleção
        const rectSelecao = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectSelecao.setAttribute("id", `rec_arco_${idArco}`);
        rectSelecao.setAttribute("x", posX - 8.5);
        rectSelecao.setAttribute("y", 49);
        rectSelecao.setAttribute("width", 17);
        rectSelecao.setAttribute("height", 254);
        rectSelecao.setAttribute("fill", "#B3B3B3");
        
        // Botão superior
        const botaoSup = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        botaoSup.setAttribute("id", `arco${idArco}_botsup`);
        botaoSup.setAttribute("x", posX - 8.5);
        botaoSup.setAttribute("y", 41);
        botaoSup.setAttribute("width", 17);
        botaoSup.setAttribute("height", 17);
        botaoSup.setAttribute("rx", 4.2);
        botaoSup.setAttribute("ry", 4.2);
        botaoSup.setAttribute("fill", "#999999");
        
        // Texto botão superior
        const textoSup = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textoSup.setAttribute("x", posX);
        textoSup.setAttribute("y", 49.5);
        textoSup.setAttribute("text-anchor", "middle");
        textoSup.setAttribute("dominant-baseline", "central");
        textoSup.setAttribute("font-weight", "bold");
        textoSup.setAttribute("font-size", "10.5");
        textoSup.setAttribute("font-family", "Arial");
        textoSup.setAttribute("fill", "white");
        textoSup.textContent = idArco;
        
        // Botão inferior
        const botaoInf = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        botaoInf.setAttribute("id", `arco${idArco}_botinf`);
        botaoInf.setAttribute("x", posX - 8.5);
        botaoInf.setAttribute("y", 295);
        botaoInf.setAttribute("width", 17);
        botaoInf.setAttribute("height", 17);
        botaoInf.setAttribute("rx", 4.2);
        botaoInf.setAttribute("ry", 4.2);
        botaoInf.setAttribute("fill", "#999999");
        
        // Texto botão inferior
        const textoInf = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textoInf.setAttribute("x", posX);
        textoInf.setAttribute("y", 303.5);
        textoInf.setAttribute("text-anchor", "middle");
        textoInf.setAttribute("dominant-baseline", "central");
        textoInf.setAttribute("font-weight", "bold");
        textoInf.setAttribute("font-size", "10.5");
        textoInf.setAttribute("font-family", "Arial");
        textoInf.setAttribute("fill", "white");
        textoInf.textContent = idArco;
        
        grupoArco.appendChild(rectSelecao);
        grupoArco.appendChild(botaoSup);
        grupoArco.appendChild(textoSup);
        grupoArco.appendChild(botaoInf);
        grupoArco.appendChild(textoInf);
        
        // Desenhar pêndulos do arco
        if (dadosArco.pendulos) {
            dadosArco.pendulos.forEach((pendulo, index) => {
                const posY = 80 + (index * 60); // Distribuir verticalmente
                const cabo = desenharPendulo(pendulo, posX, posY);
                grupoArco.appendChild(cabo);
            });
        }
        
        document.getElementById("des_topo_armazem").appendChild(grupoArco);
    }

    function desenharPendulo(pendulo, posX, posY) {
        const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupo.setAttribute("id", `pendulo_${pendulo.id}`);
        grupo.style.cursor = "pointer";
        
        // Cor baseada na temperatura
        const temperatura = pendulo.temperatura;
        let corFundo = corFaixaExata(temperatura);
        
        // Se não está ativo, usar cor cinza
        if (!pendulo.ativo || temperatura === 0) {
            corFundo = "#c7c7c7";
        }
        
        // Círculo do pêndulo
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("id", `c_pendulo_${pendulo.id}`);
        circulo.setAttribute("cx", posX);
        circulo.setAttribute("cy", posY);
        circulo.setAttribute("r", 12);
        circulo.setAttribute("fill", corFundo);
        circulo.setAttribute("stroke", "black");
        circulo.setAttribute("stroke-width", "0.8");
        
        // Texto do pêndulo (temperatura)
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("id", `t_pendulo_${pendulo.id}`);
        texto.setAttribute("x", posX);
        texto.setAttribute("y", posY - 2);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "central");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "6");
        texto.setAttribute("font-family", "Arial");
        texto.setAttribute("fill", temperatura >= 30 ? "white" : "black");
        texto.textContent = temperatura === 0 ? "OFF" : `${temperatura}°`;
        
        // Número do pêndulo abaixo
        const numeroTexto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        numeroTexto.setAttribute("x", posX);
        numeroTexto.setAttribute("y", posY + 5);
        numeroTexto.setAttribute("text-anchor", "middle");
        numeroTexto.setAttribute("dominant-baseline", "central");
        numeroTexto.setAttribute("font-weight", "bold");
        numeroTexto.setAttribute("font-size", "5");
        numeroTexto.setAttribute("font-family", "Arial");
        numeroTexto.setAttribute("fill", temperatura >= 30 ? "white" : "black");
        numeroTexto.textContent = `P${pendulo.id}`;
        
        // Círculo de alarme (se houver)
        if (pendulo.alarme) {
            const circuloAlarme = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circuloAlarme.setAttribute("cx", posX);
            circuloAlarme.setAttribute("cy", posY);
            circuloAlarme.setAttribute("r", 15);
            circuloAlarme.setAttribute("fill", "red");
            circuloAlarme.setAttribute("fill-opacity", "0.6");
            
            const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animacao.setAttribute("attributeName", "r");
            animacao.setAttribute("begin", "0s");
            animacao.setAttribute("dur", "1s");
            animacao.setAttribute("from", "15");
            animacao.setAttribute("to", "10");
            animacao.setAttribute("repeatCount", "indefinite");
            circuloAlarme.appendChild(animacao);
            
            grupo.appendChild(circuloAlarme);
        }
        
        grupo.appendChild(circulo);
        grupo.appendChild(texto);
        grupo.appendChild(numeroTexto);
        
        return grupo;
    }

    function desenharAeradores() {
        const svgEl = document.getElementById("des_topo_armazem");
        
        Object.entries(layoutTopo.aeradores).forEach(([id, dados]) => {
            const [posX, posY, textoAcima] = dados;
            desenharAerador(parseInt(id), posX, posY, textoAcima);
        });
    }

    function desenharAerador(idAerador, posX, posY, textoAcima) {
        const svgEl = document.getElementById("des_topo_armazem");
        
        const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupo.setAttribute("id", `aerador_${idAerador}`);
        grupo.setAttribute("transform", `translate(${posX - 70}, ${posY})`);
        
        // Círculo principal
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("id", `fundo_aerador_${idAerador}`);
        circulo.setAttribute("cx", 86.35);
        circulo.setAttribute("cy", 24);
        circulo.setAttribute("r", 10.5);
        circulo.setAttribute("fill", "#c5c5c5");
        
        // Retângulo do nome
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", 73.5);
        rect.setAttribute("y", textoAcima ? 2 : 36);
        rect.setAttribute("width", 25);
        rect.setAttribute("height", 10);
        rect.setAttribute("rx", 6.4);
        rect.setAttribute("ry", 5);
        rect.setAttribute("fill", "#3A78FD");
        
        // Texto do nome
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", 86);
        texto.setAttribute("y", textoAcima ? 7 : 41);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "central");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "6.5");
        texto.setAttribute("font-family", "Arial");
        texto.setAttribute("fill", "white");
        texto.textContent = `AE-${idAerador}`;
        
        // Blade (simplificado)
        const blade = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        blade.setAttribute("cx", 86.35);
        blade.setAttribute("cy", 24);
        blade.setAttribute("r", 8);
        blade.setAttribute("fill", "none");
        blade.setAttribute("stroke", "white");
        blade.setAttribute("stroke-width", 2);
        
        grupo.appendChild(circulo);
        grupo.appendChild(rect);
        grupo.appendChild(texto);
        grupo.appendChild(blade);
        
        svgEl.appendChild(grupo);
    }

    function atualizarSelecoes() {
        if (!layoutTopo) return;
        
        // Atualizar seleção de células
        for (let celula = 1; celula <= 3; celula++) {
            const elemento = document.getElementById(`rec_celula${celula}`);
            if (elemento) {
                if (celula === celulaSelecionada) {
                    elemento.setAttribute("fill", "#E6E6E6");
                    elemento.setAttribute("stroke", "#438AF6");
                } else {
                    elemento.setAttribute("fill", "#B3B3B3");
                    elemento.setAttribute("stroke", "#B3B3B3");
                }
            }
        }
        
        // Atualizar seleção de arcos
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoNum = parseInt(key);
                const arcoData = layoutTopo[key];
                
                // Retângulo de seleção do arco
                const rectArco = document.getElementById(`rec_arco_${arcoNum}`);
                if (rectArco) {
                    if (arcoNum === arcoSelecionado) {
                        rectArco.setAttribute("fill", "#438AF6");
                    } else if (arcoData.celula === celulaSelecionada) {
                        rectArco.setAttribute("fill", "#E6E6E6");
                    } else {
                        rectArco.setAttribute("fill", "#B3B3B3");
                    }
                }
                
                // Botões do arco
                const botaoSup = document.getElementById(`arco${arcoNum}_botsup`);
                const botaoInf = document.getElementById(`arco${arcoNum}_botinf`);
                if (botaoSup && botaoInf) {
                    const cor = arcoNum === arcoSelecionado ? "#33CC33" : "#999999";
                    botaoSup.setAttribute("fill", cor);
                    botaoInf.setAttribute("fill", cor);
                }
            }
        });
    }

    function atualizarVisualizacaoPendulos() {
        if (!dadosPendulos || !layoutTopo) return;
        
        // Atualizar cada arco e seus pêndulos
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoData = layoutTopo[key];
                if (arcoData.pendulos) {
                    arcoData.pendulos.forEach(pendulo => {
                        const dadosAtuais = dadosPendulos[pendulo.id];
                        if (dadosAtuais) {
                            const temperatura = dadosAtuais[3];
                            const alarme = dadosAtuais[0];
                            const ativo = dadosAtuais[2];
                            
                            const circulo = document.getElementById(`c_pendulo_${pendulo.id}`);
                            const texto = document.getElementById(`t_pendulo_${pendulo.id}`);
                            
                            if (circulo && texto) {
                                // Definir cor baseada na temperatura
                                let cor = corFaixaExata(temperatura);
                                let corTexto = temperatura >= 30 ? "white" : "black";
                                
                                if (!ativo || temperatura === 0) {
                                    cor = "#c7c7c7";
                                    corTexto = "black";
                                }
                                
                                circulo.setAttribute("fill", cor);
                                texto.setAttribute("fill", corTexto);
                                texto.textContent = temperatura === 0 ? "OFF" : `${temperatura}°`;
                            }
                        }
                    });
                }
            }
        });
    }

    function corFaixaExata(temp) {
        if (temp < 12) return "#0384fc";
        else if (temp < 15) return "#03e8fc";
        else if (temp < 17) return "#03fcbe";
        else if (temp < 21) return "#07fc03";
        else if (temp < 25) return "#c3ff00";
        else if (temp < 27) return "#fcf803";
        else if (temp < 30) return "#ffb300";
        else if (temp < 35) return "#ff2200";
        else if (temp < 50) return "#ff0090";
        else return "#f700ff";
    }

    function adicionarEventosClique() {
        const svgEl = document.getElementById("des_topo_armazem");
        if (!svgEl) return;
        
        svgEl.addEventListener('click', (evento) => {
            const elemento = evento.target;
            const grupo = elemento.parentElement;
            
            if (grupo && grupo.id) {
                const [tipo, numero] = grupo.id.split('_');
                
                if (tipo === 'arco') {
                    const novoArco = parseInt(numero);
                    setArcoSelecionado(novoArco);
                    if (layoutTopo[novoArco]) {
                        setCelulaSelecionada(layoutTopo[novoArco].celula);
                    }
                    if (onArcoSelecionado) {
                        onArcoSelecionado(novoArco);
                    }
                } else if (tipo === 'cabo') {
                    // Encontrar qual arco pertence este cabo
                    const caboNum = parseInt(numero);
                    Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
                        if (arcoKey !== 'celulas' && arcoKey !== 'aeradores') {
                            if (arcoData.sensores && arcoData.sensores[caboNum]) {
                                const novoArco = parseInt(arcoKey);
                                setArcoSelecionado(novoArco);
                                setCelulaSelecionada(arcoData.celula);
                                if (onArcoSelecionado) {
                                    onArcoSelecionado(novoArco);
                                }
                            }
                        }
                    });
                }
                
                // Atualizar visualização
                setTimeout(() => {
                    atualizarSelecoes();
                }, 50);
            }
            
            // Clique em células
            if (elemento.id && elemento.id.startsWith('rec_celula')) {
                const numeroCelula = parseInt(elemento.id.replace('rec_celula', ''));
                if (numeroCelula > 0) {
                    setCelulaSelecionada(numeroCelula);
                    setTimeout(() => {
                        atualizarSelecoes();
                    }, 50);
                }
            }
        });
    }

    if (carregando || !dadosPendulos || !layoutTopo) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando vista de topo...</span>
                </div>
                {erro && (
                    <div className="alert alert-warning mt-2">
                        <small>Usando dados de exemplo: {erro}</small>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container-fluid p-2">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0">Vista de Topo - Armazém (Layout Retangular)</h6>
                        </div>
                        <div className="card-body">
                            <div 
                                ref={containerRef} 
                                className="d-flex justify-content-center"
                                style={{ minHeight: '400px' }}
                            />
                            
                            <div className="mt-3">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Arco Selecionado: {arcoSelecionado}</small>
                                            <div className="mt-1">
                                                <small>
                                                    Célula: {celulaSelecionada}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Controles:</small>
                                            <div className="mt-1">
                                                <small>
                                                    • Clique nos arcos para selecioná-los<br/>
                                                    • Clique nos pêndulos para selecionar o arco<br/>
                                                    • Clique nas células para selecioná-las
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Dados Reais:</small>
                                            <div className="mt-1">
                                                <small>
                                                    {Object.keys(dadosPendulos).length} pêndulos<br/>
                                                    {Object.values(dadosPendulos).filter(p => p[0]).length} em alarme<br/>
                                                    {Object.values(dadosPendulos).filter(p => p[2]).length} ativos
                                                    {erro && <><br/><span className="text-warning">⚠ Dados de exemplo</span></>}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopoArmazem;
