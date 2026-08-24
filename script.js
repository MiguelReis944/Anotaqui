
let quillTarefa, quillAnotacao;
let filtros = [];
let tarefas = [];
let anotacoes = [];
let abredoFiltro = false;
let abredo = true;
let filtroAbredo = true;
let menuTravado = false;
let tarefaEmEdicao = null;
let anotacaoEmEdicao = null;
let tutorasAbredo = false;

class Tarefa {
    constructor(materia, titulo, descricao, data, status = "pendente") {
        this.materia = materia;
        this.titulo = titulo;
        this.descricao = descricao;
        this.data = data;
        this.status = status
    }
}

class Anotacao {
    constructor(titulo, descricao) {
        this.titulo = titulo;
        this.descricao = descricao;
    }
}

function inicializarEditores() {
    const Size = Quill.import('formats/size');
    Size.whitelist = ['small', false, 'large', 'huge'];
    Quill.register(Size, true);
    quillTarefa = new Quill('#descricao-tarefa-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }]
            ]
        },
        placeholder: 'Digite a descrição da tarefa...'
    });

    quillAnotacao = new Quill('#descricao-anotacao-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }]
            ]
        },
        placeholder: 'Digite a descrição da anotação...'
    });

    quillTarefa.on('text-change', function () {
        document.getElementById('descricao-tarefa').value = quillTarefa.root.innerHTML;
    });

    quillAnotacao.on('text-change', function () {
        document.getElementById('descricao-anotacao').value = quillAnotacao.root.innerHTML;
    });
}

function salvarProgresso() {
    document.getElementById('descricao-tarefa').value = quillTarefa.root.innerHTML;
    document.getElementById('descricao-anotacao').value = quillAnotacao.root.innerHTML;

    const progresso = {
        tarefas,
        anotacoes,
        filtros
    };
    localStorage.setItem("anotakiSave", JSON.stringify(progresso));
}

function carregarProgresso() {
    try {
        const dados = JSON.parse(localStorage.getItem("anotakiSave"));
        if (!dados) return;

        tarefas = Array.isArray(dados.tarefas) ? dados.tarefas.map(t => new Tarefa(t.materia, t.titulo, t.descricao, t.data, t.status)) : [];
        anotacoes = Array.isArray(dados.anotacoes) ? dados.anotacoes.map(a => new Anotacao(a.titulo, a.descricao)) : [];
        filtros = Array.isArray(dados.filtros) ? dados.filtros : [];

        atualizarFiltros();
        carregarTarefas();
        carregarAnotacoes();
        gerarMiniCalendario()
        numeroTarefas()
    } catch (e) {
        console.error("Erro ao carregar progresso:", e);
    }
}

function resetarProgresso() {
    mostrarPopup(
        "Resetar Progresso",
        "Tem certeza que deseja apagar todo o progresso?",
        "confirmacao",
        () => {
            localStorage.removeItem("anotakiSave");
            localStorage.removeItem('tabelaNotas');
            localStorage.removeItem('horarioAulas');
            location.reload();
        }
    );
}


function opM() {
    if (menuTravado) return;
    if (abredo) {
        document.getElementsByClassName("esquerda")[0].style.left = "-39%";
        document.getElementsByClassName("opcoes")[0].style.left = "1%";
        document.getElementsByClassName("direita")[0].style.left = "5%";
        document.getElementsByClassName("direita")[0].style.width = "95%";
        document.getElementsByClassName("seta-que-roda")[0].style.transform = "scaleX(-1)";
        abredo = false;
    } else {
        document.getElementsByClassName("esquerda")[0].style.left = "0%";
        document.getElementsByClassName("opcoes")[0].style.left = "40%";
        document.getElementsByClassName("direita")[0].style.left = "45%";
        document.getElementsByClassName("direita")[0].style.width = "55%";
        document.getElementsByClassName("seta-que-roda")[0].style.transform = "scaleX(1)";
        abredo = true;
    }
}
function opD() {
    abredo = true;
    opM();
    menuTravado = true;
    document.getElementById("secTarefas").style.display = "block";
    document.getElementById("secAnotacoes").style.display = "none";
    document.getElementById("adD").style.backgroundColor = "var(--fundoPrincipal)";
    document.getElementById("adT").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adA").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adH").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adN").style.backgroundColor = "var(--fundoTerciario)";

    document.getElementById("adD").style.borderRight = "var(--corPrincipal)";
    document.getElementById("adD").style.borderRightWidth = "1.25vh";
    document.getElementById("adD").style.borderRightStyle = "solid";
    document.getElementById("adT").style.borderRight = "none";
    document.getElementById("adT").style.borderRightWidth = "none";
    document.getElementById("adT").style.borderRightStyle = "none";
    document.getElementById("adA").style.borderRight = "none";
    document.getElementById("adA").style.borderRightWidth = "none";
    document.getElementById("adA").style.borderRightStyle = "none";
    document.getElementById("adH").style.borderRight = "none";
    document.getElementById("adH").style.borderRightWidth = "none";
    document.getElementById("adH").style.borderRightStyle = "none";
    document.getElementById("adN").style.borderRight = "none";
    document.getElementById("adN").style.borderRightWidth = "none";
    document.getElementById("adN").style.borderRightStyle = "none";

    document.getElementById("dashboardPai").style.display = "block";
    document.getElementById("tarefasPai").style.display = "none";
    document.getElementById("anotacoesPai").style.display = "none";
    document.getElementById("horarioPai").style.display = "none";
    document.getElementById("notasPai").style.display = "none";
    document.getElementById("configPai").style.display = "none";

    const filtroAtivo = document.querySelector('.botao-filtro.ativo');
    const tipoFiltro = filtroAtivo ? filtroAtivo.getAttribute('onclick').match(/'([^']+)'/)[1] : 'todas';
    gerarMiniCalendario();
    aplicarFiltros(tipoFiltro);
}
function opT() {
    menuTravado = false;
    abredo = false;
    opM();
    document.getElementById("secTarefas").style.display = "block";
    document.getElementById("secAnotacoes").style.display = "none";
    document.getElementById("adD").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adT").style.backgroundColor = "var(--fundoPrincipal)";
    document.getElementById("adA").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adH").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adN").style.backgroundColor = "var(--fundoTerciario)";

    document.getElementById("adD").style.borderRight = "none";
    document.getElementById("adD").style.borderRightWidth = "none";
    document.getElementById("adD").style.borderRightStyle = "none";
    document.getElementById("adT").style.borderRight = "var(--corPrincipal)";
    document.getElementById("adT").style.borderRightWidth = "1.25vh";
    document.getElementById("adT").style.borderRightStyle = "solid";
    document.getElementById("adA").style.borderRight = "none";
    document.getElementById("adA").style.borderRightWidth = "none";
    document.getElementById("adA").style.borderRightStyle = "none";
    document.getElementById("adH").style.borderRight = "none";
    document.getElementById("adH").style.borderRightWidth = "none";
    document.getElementById("adH").style.borderRightStyle = "none";
    document.getElementById("adN").style.borderRight = "none";
    document.getElementById("adN").style.borderRightWidth = "none";
    document.getElementById("adN").style.borderRightStyle = "none";

    document.getElementById("dashboardPai").style.display = "none";
    document.getElementById("tarefasPai").style.display = "block";
    document.getElementById("anotacoesPai").style.display = "none";
    document.getElementById("horarioPai").style.display = "none";
    document.getElementById("notasPai").style.display = "none";
    document.getElementById("configPai").style.display = "none";

    const filtroAtivo = document.querySelector('.botao-filtro.ativo');
    const tipoFiltro = filtroAtivo ? filtroAtivo.getAttribute('onclick').match(/'([^']+)'/)[1] : 'todas';
    aplicarFiltros(tipoFiltro);
}

function opA() {
    menuTravado = false;
    abredo = false;
    opM();
    document.getElementById("secTarefas").style.display = "none";
    document.getElementById("secAnotacoes").style.display = "block";
    document.getElementById("adD").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adT").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adA").style.backgroundColor = "var(--fundoPrincipal)";
    document.getElementById("adH").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adN").style.backgroundColor = "var(--fundoTerciario)";

    document.getElementById("adD").style.borderRight = "none";
    document.getElementById("adD").style.borderRightWidth = "none";
    document.getElementById("adD").style.borderRightStyle = "none";
    document.getElementById("adT").style.borderRight = "none";
    document.getElementById("adT").style.borderRightWidth = "none";
    document.getElementById("adT").style.borderRightStyle = "none";
    document.getElementById("adA").style.borderRight = "#8b12c4";
    document.getElementById("adA").style.borderRightWidth = "1.25vh";
    document.getElementById("adA").style.borderRightStyle = "solid";
    document.getElementById("adH").style.borderRight = "none";
    document.getElementById("adH").style.borderRightWidth = "none";
    document.getElementById("adH").style.borderRightStyle = "none";
    document.getElementById("adN").style.borderRight = "none";
    document.getElementById("adN").style.borderRightWidth = "none";
    document.getElementById("adN").style.borderRightStyle = "none";

    document.getElementById("dashboardPai").style.display = "none";
    document.getElementById("tarefasPai").style.display = "none";
    document.getElementById("anotacoesPai").style.display = "block";
    document.getElementById("horarioPai").style.display = "none";
    document.getElementById("notasPai").style.display = "none";
    document.getElementById("configPai").style.display = "none";
}

function opH() {
    abredo = true;
    opM();
    menuTravado = true;
    document.getElementById("secTarefas").style.display = "none";
    document.getElementById("secAnotacoes").style.display = "none";
    document.getElementById("adD").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adT").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adA").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adH").style.backgroundColor = "var(--fundoPrincipal)";
    document.getElementById("adN").style.backgroundColor = "var(--fundoTerciario)";

    document.getElementById("adD").style.borderRight = "none";
    document.getElementById("adD").style.borderRightWidth = "none";
    document.getElementById("adD").style.borderRightStyle = "none";
    document.getElementById("adT").style.borderRight = "none";
    document.getElementById("adT").style.borderRightWidth = "none";
    document.getElementById("adT").style.borderRightStyle = "none";
    document.getElementById("adA").style.borderRight = "none";
    document.getElementById("adA").style.borderRightWidth = "none";
    document.getElementById("adA").style.borderRightStyle = "none";
    document.getElementById("adH").style.borderRight = "#8b12c4";
    document.getElementById("adH").style.borderRightWidth = "1.25vh";
    document.getElementById("adH").style.borderRightStyle = "solid";
    document.getElementById("adN").style.borderRight = "none";
    document.getElementById("adN").style.borderRightWidth = "none";
    document.getElementById("adN").style.borderRightStyle = "none";

    document.getElementById("dashboardPai").style.display = "none";
    document.getElementById("tarefasPai").style.display = "none";
    document.getElementById("anotacoesPai").style.display = "none";
    document.getElementById("horarioPai").style.display = "block";
    document.getElementById("notasPai").style.display = "none";
    document.getElementById("configPai").style.display = "none";
}
function opN() {
    abredo = true;
    opM();
    menuTravado = true;
    document.getElementById("secTarefas").style.display = "none";
    document.getElementById("secAnotacoes").style.display = "none";
    document.getElementById("adD").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adT").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adA").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adH").style.backgroundColor = "var(--fundoTerciario)";
    document.getElementById("adN").style.backgroundColor = "var(--fundoPrincipal)";

    document.getElementById("adD").style.borderRight = "none";
    document.getElementById("adD").style.borderRightWidth = "none";
    document.getElementById("adD").style.borderRightStyle = "none";
    document.getElementById("adT").style.borderRight = "none";
    document.getElementById("adT").style.borderRightWidth = "none";
    document.getElementById("adT").style.borderRightStyle = "none";
    document.getElementById("adA").style.borderRight = "none";
    document.getElementById("adA").style.borderRightWidth = "none";
    document.getElementById("adA").style.borderRightStyle = "none";
    document.getElementById("adH").style.borderRight = "none";
    document.getElementById("adH").style.borderRightWidth = "none";
    document.getElementById("adH").style.borderRightStyle = "none";
    document.getElementById("adN").style.borderRight = "var(--corPrincipal)";
    document.getElementById("adN").style.borderRightWidth = "1.25vh";
    document.getElementById("adN").style.borderRightStyle = "solid";

    document.getElementById("dashboardPai").style.display = "none";
    document.getElementById("tarefasPai").style.display = "none";
    document.getElementById("anotacoesPai").style.display = "none";
    document.getElementById("horarioPai").style.display = "none";
    document.getElementById("notasPai").style.display = "block";
    document.getElementById("configPai").style.display = "none";
}
function opC() {
    abredo = true;
    opM();
    menuTravado = true;
    document.getElementById("dashboardPai").style.display = "none";
    document.getElementById("tarefasPai").style.display = "none";
    document.getElementById("anotacoesPai").style.display = "none";
    document.getElementById("horarioPai").style.display = "none";
    document.getElementById("notasPai").style.display = "none";
    document.getElementById("configPai").style.display = "block";
}
function opF() {
    if (abredoFiltro) {
        document.getElementsByClassName("filtroPai")[0].style.left = "96vw";
        document.getElementById("status").style.display = "block"
        abredoFiltro = false;
    } else {
        document.getElementsByClassName("filtroPai")[0].style.left = "75vw";
        document.getElementById("status").style.display = "none"
        abredoFiltro = true;
    }
}

function criarTarefa() {
    const materia = document.getElementById("materia-tarefa").value.trim();
    const titulo = document.getElementById("titulo-tarefa").value.trim();
    const descricao = quillTarefa.root.innerHTML.trim();
    const data = document.getElementById("vencimento-tarefa").value.trim();

    if (!materia || !titulo) {
        mostrarPopup("Erro", "Preencha a matéria e o título da tarefa.", "alerta");
        return;
    }

    let dataFormatada = "Data não estipulada";
    if (data) {
        const [ano, mes, dia] = data.split("-");
        dataFormatada = `${dia}/${mes}/${ano}`;
    }

    const novaTarefa = new Tarefa(materia, titulo, descricao, dataFormatada, "pendente");

    if (tarefaEmEdicao !== null) {
        const tarefaAntiga = tarefas[tarefaEmEdicao];
        const materiaAntiga = tarefaAntiga.materia;

        tarefas[tarefaEmEdicao] = novaTarefa;
        tarefaEmEdicao = null;

        if (materia !== materiaAntiga) {
            if (!filtros.includes(materia)) {
                filtros.push(materia);
            }

            const aindaUsaAntiga = tarefas.some(t => t.materia === materiaAntiga);
            if (!aindaUsaAntiga) {
                filtros = filtros.filter(f => f !== materiaAntiga);
            }
        }
    } else {
        tarefas.push(novaTarefa);
        if (!filtros.includes(materia)) {
            filtros.push(materia);
        }
    }

    filtros.sort((a, b) => a.localeCompare(b));

    carregarTarefas();
    atualizarFiltros();
    salvarProgresso();
}


function carregarTarefas(filtroStatus = 'todas') {
    const container = document.getElementById('tarefas');
    container.innerHTML = '';
    ordenarTarefasPorData();

    const checkboxes = document.querySelectorAll("#listaFiltros input[type='checkbox']");
    const materiasSelecionadas = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.nextElementSibling.textContent);

    const agora = new Date();

    tarefas.forEach(t => {
        const materiaIncluida = materiasSelecionadas.length === 0 || materiasSelecionadas.includes(t.materia);
        let mostrar = materiaIncluida;

        let dataTarefa = null;
        let emAtraso = false;
        let pendente = false;

        if (t.data && t.data !== "Data não estipulada") {
            const [dia, mes, ano] = t.data.split('/');
            dataTarefa = new Date(`${ano}-${mes}-${dia}T23:59:59`);
            emAtraso = dataTarefa < agora && t.status !== "concluido";
            pendente = dataTarefa >= agora && t.status !== "concluido";
        }

        let tipoOnClick = "";
        let tipoImg = "";
        let botaoEditar = ""

        if (filtroStatus === 'pendente') {
            tipoOnClick = "confirmarConclusao(this)";
            tipoImg = "https://cdn-icons-png.freepik.com/256/1721/1721539.png?ga=GA1.1.1916518656.1749926656";
            botaoEditar = '<button class="edit-btn" onclick="editarTarefa(this)"><img src="https://cdn-icons-png.freepik.com/256/1168/1168658.png?ga=GA1.1.1916518656.1749926656" alt=""></button>'
            mostrar = mostrar && pendente;

        } else if (filtroStatus === 'atraso') {
            tipoOnClick = "confirmarConclusao(this)";
            tipoImg = "https://cdn-icons-png.freepik.com/256/1721/1721539.png?ga=GA1.1.1916518656.1749926656";
            botaoEditar = '<button class="edit-btn" onclick="editarTarefa(this)"><img src="https://cdn-icons-png.freepik.com/256/1168/1168658.png?ga=GA1.1.1916518656.1749926656" alt=""></button>'
            mostrar = mostrar && emAtraso;

        } else if (filtroStatus === 'concluido') {
            tipoOnClick = "excluirTarefa(this)";
            // Coloquei uma imagem de "-" pranão ser tão agressivo como um x vermelho.
            // Mas qualquer coisa o x tá aqui: https://cdn-icons-png.freepik.com/256/1168/1168643.png?ga=GA1.1.1916518656.1749926656
            tipoImg = "https://cdn-icons-png.freepik.com/256/1721/1721541.png?ga=GA1.1.1916518656.1749926656";
            botaoEditar = '<button class="edit-btn" onclick="editarTarefa(this)"><img src="https://cdn-icons-png.freepik.com/256/1168/1168658.png?ga=GA1.1.1916518656.1749926656" alt=""></button>'
            mostrar = mostrar && t.status === 'concluido';

        } else if (filtroStatus === 'todas') {
            tipoOnClick = "confirmarConclusao(this)";
            tipoImg = "https://cdn-icons-png.freepik.com/256/1721/1721539.png?ga=GA1.1.1916518656.1749926656";
            botaoEditar = '<button class="edit-btn" onclick="editarTarefa(this)"><img src="https://cdn-icons-png.freepik.com/256/1168/1168658.png?ga=GA1.1.1916518656.1749926656" alt=""></button>'
            mostrar = mostrar && t.status !== 'concluido';
        }

        if (!mostrar) return;

        const tarefa = document.createElement("div");
        tarefa.className = "tarefa";
        tarefa.innerHTML = `
        <h2>${t.materia}</h2><br>
        <h1>${t.titulo}</h1><br>
        <div class="descricao-formatada">${t.descricao}</div><br>
        <h3>${tarefaEmAtraso(t.data, t.status)}</h3>
        ${botaoEditar}
        <button class="delete-btn" onclick="${tipoOnClick}">
            <img src="${tipoImg}" alt="">
        </button>`;
        container.appendChild(tarefa);
    });


    document.getElementById("materia-tarefa").value = "";
    document.getElementById("titulo-tarefa").value = "";
    quillTarefa.root.innerHTML = "";
    document.getElementById("vencimento-tarefa").value = "";
    if (!container.querySelector(".tarefa")) {
        let mensagem = "Você não tem tarefas.";
        switch (filtroStatus) {
            case 'pendente':
                mensagem = "Você não tem tarefas pendentes.";
                break;
            case 'atraso':
                mensagem = "Você não tem tarefas em atraso.";
                break;
            case 'concluido':
                mensagem = "Você não tem tarefas concluídas.";
                break;
            case 'todas':
            default:
                mensagem = "Você não tem tarefas ativas.";
                break;
        }
        container.innerHTML = `<div><h3>${mensagem}</h3></div>`;
    }
    salvarProgresso();
}




function editarTarefa(button) {
    const tarefaDiv = button.closest('.tarefa');
    if (!tarefaDiv) return;

    const materia = tarefaDiv.querySelector('h2')?.innerText || "";
    const titulo = tarefaDiv.querySelector('h1')?.innerText || "";
    const descricao = tarefaDiv.querySelector('.descricao-formatada')?.innerHTML || "";
    const dataTexto = tarefaDiv.querySelector('h3')?.innerText || "";

    let dataFormatada = "Data não estipulada";
    if (dataTexto.includes("Tarefa de") && dataTexto.includes("já concluida")) {
        const dataParte = dataTexto.replace("Tarefa de", "").replace("já concluida", "").trim();
        if (dataParte !== "Data não estipulada") {
            const [dia, mes, ano] = dataParte.split('/');
            dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
    } else if (dataTexto.includes("Concluir até:")) {
        const dataParte = dataTexto.replace("Concluir até:", "").trim();
        if (dataParte !== "Data não estipulada") {
            const [dia, mes, ano] = dataParte.split('/');
            dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
    } else if (dataTexto.includes("Tarefa em atraso:")) {
        const dataParte = dataTexto.replace("Tarefa em atraso:", "").trim();
        if (dataParte !== "Data não estipulada") {
            const [dia, mes, ano] = dataParte.split('/');
            dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
    }

    document.getElementById('materia-tarefa').value = materia;
    document.getElementById('titulo-tarefa').value = titulo;
    quillTarefa.root.innerHTML = descricao;
    document.getElementById('vencimento-tarefa').value = dataFormatada;

    if (document.getElementById("secTarefas").style.display !== "block") {
        opT();
    }

    const index = tarefas.findIndex(t =>
        t.materia === materia &&
        t.titulo === titulo &&
        t.descricao === descricao
    );

    if (index !== -1) {
        tarefaEmEdicao = index;
    }
}

function excluirTarefa(button) {
    const divTarefa = button.parentElement;
    const titulo = divTarefa.querySelector("h1").innerText;
    const materia = divTarefa.querySelector("h2").innerText;
    const descricao = divTarefa.querySelector(".descricao-formatada").innerHTML;

    mostrarPopup("Excluir Tarefa", `Tem certeza que deseja excluir "${titulo}"?`, "confirmacao", () => {
        const index = tarefas.findIndex(t =>
            t.titulo === titulo &&
            t.materia === materia &&
            t.descricao === descricao
        );

        if (index !== -1) tarefas.splice(index, 1);
        carregarTarefas();

        const aindaTemMateria = tarefas.some(t => t.materia === materia);
        if (!aindaTemMateria) {
            const indexFiltro = filtros.indexOf(materia);
            if (indexFiltro !== -1) {
                filtros.splice(indexFiltro, 1);
                atualizarFiltros();
            }
        }

        salvarProgresso();
    });
}


function criarAnotacao() {
    const titulo = document.getElementById("titulo-anotacao").value.trim();
    const descricao = document.getElementById("descricao-anotacao").value;

    if (!descricao) {
        mostrarPopup("Erro", "Você precisa preencher a descrição da anotação.", "alerta");
        return;
    }
    if (!titulo) {
        mostrarPopup("Erro", "Você precisa preencher o título da anotação.", "alerta");
        return;
    }

    if (anotacaoEmEdicao !== null) {
        anotacoes[anotacaoEmEdicao] = new Anotacao(titulo, descricao);
        anotacaoEmEdicao = null;
    } else {
        anotacoes.push(new Anotacao(titulo, descricao));
    }
    carregarAnotacoes();
    salvarProgresso();
}

function carregarAnotacoes() {
    const container = document.getElementById('anotacoes');
    container.innerHTML = '';
    anotacoes.forEach(a => {
        const anotacao = document.createElement("div");
        anotacao.className = "tarefa";
        anotacao.innerHTML = `
            <h1>${a.titulo}</h1><br>
            <div class="descricao-formatada">${a.descricao}</div>
            <button class="edit-btn" onclick="editarAnotacao(this)">
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" alt="">
            </button>
            <button class="delete-btn" onclick="excluirAnotacao(this)">
                <img src="https://cdn-icons-png.freepik.com/512/1721/1721537.png" alt="">
            </button>`;
        container.appendChild(anotacao);
    });

    document.getElementById("titulo-anotacao").value = "";
    quillAnotacao.root.innerHTML = "";
    if (!container.querySelector(".tarefa")) {
        container.innerHTML = '<div><h3>Você não tem anotações.</h3></div>';
    }
    salvarProgresso();
}

function editarAnotacao(button) {
    const anotacaoDiv = button.closest('.tarefa');
    const titulo = anotacaoDiv.querySelector('h1')?.innerText || "";
    const descricao = anotacaoDiv.querySelector('.descricao-formatada')?.innerHTML || "";

    document.getElementById('titulo-anotacao').value = titulo;
    quillAnotacao.root.innerHTML = descricao;

    if (document.getElementById("secAnotacoes").style.display !== "block") {
        opA();
    }

    const index = anotacoes.findIndex(a =>
        a.titulo === titulo &&
        a.descricao === descricao
    );

    if (index !== -1) {
        anotacaoEmEdicao = index;
    }
}

function excluirAnotacao(button) {
    const divAnotacao = button.parentElement;
    const titulo = divAnotacao.querySelector("h1").innerText;
    const descricao = divAnotacao.querySelector(".descricao-formatada").innerHTML;

    mostrarPopup("Excluir Anotação", `Tem certeza que deseja excluir "${titulo}"?`, "confirmacao", () => {
        const index = anotacoes.findIndex(a =>
            a.titulo === titulo &&
            a.descricao === descricao
        );

        if (index !== -1) anotacoes.splice(index, 1);
        carregarAnotacoes();
        salvarProgresso();
    });
}

function filtrarTarefas(tipo) {
    document.querySelectorAll('.botao-filtro').forEach(botao => {
        botao.classList.remove('ativo');
    });
    event.target.classList.add('ativo');
    aplicarFiltros(tipo);
}

function aplicarFiltros(tipoFiltro = 'todas') {
    const checkboxes = document.querySelectorAll("#listaFiltros input[type='checkbox']");
    const materiasSelecionadas = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.nextElementSibling.textContent);

    const tarefasDOM = document.querySelectorAll(".tarefa");
    const agora = new Date();

    tarefasDOM.forEach(tarefa => {
        const materiaEl = tarefa.querySelector("h2");
        if (!materiaEl) return;

        const materia = materiaEl.innerText;
        const dataTexto = tarefa.querySelector("h3").innerText;

        const emAtraso = dataTexto.includes("Tarefa em atraso");
        const filtroMateria = materiasSelecionadas.length === 0 || materiasSelecionadas.includes(materia);

        let filtroStatus = true;
        if (tipoFiltro === 'pendentes') {
            filtroStatus = !emAtraso && !dataTexto.includes("Data não estipulada");
        } else if (tipoFiltro === 'atraso') {
            filtroStatus = emAtraso;
        }

        if (filtroMateria && filtroStatus) {
            tarefa.style.display = "block";
        } else {
            tarefa.style.display = "none";
        }
    });
}

function atualizarFiltros() {
    const filtrosDiv = document.getElementById("listaFiltros");
    filtrosDiv.innerHTML = "";
    const filtrosHigienizados = new Set(filtros);
    filtrosHigienizados.forEach(f => {
        const div = document.createElement("div");
        div.innerHTML = `<input type="checkbox" name="filtro-${f.toLowerCase()}" id="filtro-${f.toLowerCase()}"><label for="filtro-${f.toLowerCase()}">${f.toLowerCase()}</label>`;
        div.style.padding = "8px";
        filtrosDiv.appendChild(div);

        div.querySelector("input").addEventListener("change", () => {
            const filtroAtivo = document.querySelector('.botao-filtro.ativo');
            const tipoFiltro = filtroAtivo ? filtroAtivo.getAttribute('onclick').match(/'([^']+)'/)[1] : 'todas';
            aplicarFiltros(tipoFiltro);
        });
    });
    limparFiltro();
}

function limparFiltro() {
    const filtrosDiv = document.getElementById("listaFiltros");
    const checkboxes = filtrosDiv.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);

    const filtroAtivo = document.querySelector('.botao-filtro.ativo');
    const tipoFiltro = filtroAtivo ? filtroAtivo.getAttribute('onclick').match(/'([^']+)'/)[1] : 'todas';
    aplicarFiltros(tipoFiltro);
}

function formatarTexto(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatarData(data) {
    let dataHigienizada = data.trim();

    if (!dataHigienizada) {
        return "Data não estipulada";
    }

    const filtro = /^\d{4}-\d{2}-\d{2}$/;
    if (filtro.test(dataHigienizada)) {
        const partes = dataHigienizada.split("-");
        const dataFormatadaBR = `${partes[2]}/${partes[1]}/${partes[0]}`;
        return dataFormatadaBR;
    } else {
        return "Data não estipulada";
    }
}

function ordenarTarefasPorData() {
    tarefas.sort((a, b) => {
        if (a.data === "Data não estipulada") return 1;
        if (a.data === "Data não estipulada") return 1;

        const [diaA, mesA, anoA] = a.data.split('/');
        const [diaB, mesB, anoB] = b.data.split('/');
        const dataA = new Date(`${anoA}-${mesA}-${diaA}`);
        const dataB = new Date(`${anoB}-${mesB}-${diaB}`);
        return dataA - dataB;
    });
}

function tarefaEmAtraso(dataTexto, status) {
    if (!dataTexto || dataTexto === "Data não estipulada") {
        return "Data não estipulada";
    }

    const [dia, mes, ano] = dataTexto.split('/');
    const data = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    const agora = new Date();
    const dataObj = new Date(data + "T23:59:59");

    if (status === "concluido") {
        return "Tarefa já concluida.";
    }

    if (dataObj < agora) {
        status = "atraso"
        return '<img class="imgAtraso" src="https://cdn-icons-png.freepik.com/256/11820/11820506.png?ga=GA1.1.1916518656.1749926656">Tarefa em atraso: ' + dataTexto;
    } else {
        status = "pendente"
        return "Concluir até: " + dataTexto;
    }
}

function mostrarPopup(titulo, mensagem, tipo = "alerta", acaoConfirmar = null) {
    const popup = document.querySelector(".popup");

    if (tipo === "alerta") {
        popup.innerHTML = `
            <h1>${titulo}</h1>
            <p>${mensagem}</p>
            <button class="delete-btn" onclick="fecharPopup()">
                <img src="https://cdn-icons-png.freepik.com/512/1721/1721537.png" alt="">
            </button>
        `;
    } else if (tipo === "confirmacao") {
        popup.innerHTML = `
            <h1>${titulo}</h1>
            <p>${mensagem}</p>
            <button onclick="fecharPopup()" class="popB">Cancelar</button>
            <button onclick="confirmarAcao()" class="popB">Confirmar</button>
        `;

        window.confirmarAcao = () => {
            if (typeof acaoConfirmar === "function") acaoConfirmar();
            fecharPopup();
        };
    }

    popup.style.display = "block";
}

function fecharPopup() {
    const popup = document.querySelector(".popup");
    popup.style.display = "none";
    popup.innerHTML = "";
    delete window.confirmarAcao;
}

function tutoras() {
    if (tutorasAbredo == false) {
        document.getElementById("tutoras").style.display = "block";
        document.getElementById("tutoras").scrollTop = 0;
        tutorasAbredo = true;
    } else {
        document.getElementById("tutoras").style.display = "none";
        tutorasAbredo = false;
    }
}
function concluirTarefa(button) {
    const tarefaDiv = button.closest('.tarefa');
    if (!tarefaDiv) return;

    const materia = tarefaDiv.querySelector('h2')?.innerText || "";
    const titulo = tarefaDiv.querySelector('h1')?.innerText || "";
    const descricao = tarefaDiv.querySelector('.descricao-formatada')?.innerHTML || "";
    const dataTexto = tarefaDiv.querySelector('h3')?.innerText.replace("Concluir até: ", "").replace("Tarefa em atraso: ", "") || "";
    let dataFormatada = dataTexto;
    if (dataTexto !== "Data não estipulada") {
        const [dia, mes, ano] = dataTexto.split('/');
        dataFormatada = formatarData(`${ano}-${mes}-${dia}`);
    }

    const tarefa = tarefas.find(t =>
        t.materia === materia &&
        t.titulo === titulo &&
        t.data === dataFormatada
    );
    tarefa.status = "concluido"
    carregarTarefas()
}
function desconcluirTarefa(button) {
    const tarefaDiv = button.closest('.tarefa');
    if (!tarefaDiv) return;

    const materia = tarefaDiv.querySelector('h2')?.innerText || "";
    const titulo = tarefaDiv.querySelector('h1')?.innerText || "";
    const descricao = tarefaDiv.querySelector('.descricao-formatada')?.innerHTML || "";
    const tarefa = tarefas.find(t =>
        t.materia === materia &&
        t.titulo === titulo &&
        t.status === "concluido"
    );
    tarefa.status = "pendente"
    carregarTarefas()
}
function confirmarConclusao(button) {
    mostrarPopup(
        "Concluir tarefa",
        "Tem certeza que deseja marcar esta tarefa como concluída?",
        "confirmacao",
        () => concluirTarefa(button)
    );
}

function criarHorario() {
    const numAulas = parseInt(document.getElementById('num-aulas').value);
    if (isNaN(numAulas) || numAulas < 1 || numAulas > 12) {
        alert("Digite um número válido de aulas (1-12)");
        return;
    }

    let tabelaHTML = '<table class="tabela-horarios"><tr><th>Horários</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>';

    for (let i = 1; i <= numAulas; i++) {
        tabelaHTML += `<tr><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>`;
    }

    tabelaHTML += '</table><div style="display: flex;"><button onclick="salvarHorario()" class="botao">Salvar Horário</button><button onclick="excluirHorario()" class="botao"style="margin-left: 3vw;">Excluir Horário</button></div>';
    document.getElementById('tabela-horarios').innerHTML = tabelaHTML;
}

function salvarHorario() {
    const tabela = document.querySelector('#tabela-horarios table');
    if (!tabela) return;

    const dados = [];
    const linhas = tabela.querySelectorAll('tr');
    for (let i = 1; i < linhas.length; i++) {
        const celulas = linhas[i].querySelectorAll('td');
        const linhaDados = Array.from(celulas).map(celula => celula.textContent.trim());
        dados.push(linhaDados);
    }

    localStorage.setItem('horarioAulas', JSON.stringify(dados));
    mostrarPopup("Salvamento concluido", "A edição da sua tabela de horarios foi salva com sucesso", "alerta");
}

function carregarHorario() {
    const dados = localStorage.getItem('horarioAulas');
    if (!dados) return;

    try {
        const linhas = JSON.parse(dados);
        if (!Array.isArray(linhas)) return;

        let tabelaHTML = '<table class="tabela-horarios"><tr><th>Horários</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>';

        linhas.forEach(linha => {
            tabelaHTML += `<tr><td contenteditable="true">${linha[0] || ''}</td>
                    <td contenteditable="true">${linha[1] || ''}</td>
                    <td contenteditable="true">${linha[2] || ''}</td>
                    <td contenteditable="true">${linha[3] || ''}</td>
                    <td contenteditable="true">${linha[4] || ''}</td>
                    <td contenteditable="true">${linha[5] || ''}</td></tr>`;
        });

        tabelaHTML += '</table><div style="display: flex;"><button onclick="salvarHorario()" class="botao">Salvar Horário</button><button onclick="excluirHorario()" class="botao"style="margin-left: 3vw;">Excluir Horário</button></div>';
        document.getElementById('tabela-horarios').innerHTML = tabelaHTML;
    } catch (e) {
        console.error("Erro ao carregar horário:", e);
    }
}
function criarNotas() {
    const numMaterias = parseInt(document.getElementById("num-materias").value);
    const numAvaliacoes = parseInt(document.getElementById("num-avaliacoes").value);

    if (isNaN(numMaterias) || numMaterias < 1 || numMaterias > 20 ||
        isNaN(numAvaliacoes) || numAvaliacoes < 1 || numAvaliacoes > 5) {
        mostrarPopup("Erro", "Digite números válidos (Matérias: 1-20, Avaliações: 1-5)", "alerta");
        return;
    }

    let tabelaHTML = '<table class="tabela-horarios"><tr><th>Matéria</th>';

    for (let i = 1; i <= numAvaliacoes; i++) {
        tabelaHTML += `<th>Avaliação ${i}</th>`;
    }

    tabelaHTML += '<th>Média</th></tr>';

    for (let i = 1; i <= numMaterias; i++) {
        tabelaHTML += `<tr><th contenteditable="true">Matéria ${i}</th>`;

        for (let j = 1; j <= numAvaliacoes; j++) {
            tabelaHTML += '<td contenteditable="true"></td>';
        }

        tabelaHTML += '<td contenteditable="true" class="media"></td></tr>';
    }

    tabelaHTML += '</table><div style="display: flex;"><button onclick="salvarNotas()" class="botao">Salvar Boletim</button><button onclick="excluirNotas()" class="botao"style="margin-left: 3vw;">Excluir Boletim</button></div>';
    document.getElementById("tabela-notas").innerHTML = tabelaHTML;
}

function salvarNotas() {
    const tabela = document.querySelector('#tabela-notas table');
    if (!tabela) return;

    const dados = [];
    const linhas = tabela.querySelectorAll('tr');
    for (let i = 1; i < linhas.length; i++) {
        const celulas = linhas[i].querySelectorAll('th, td');
        const linhaDados = Array.from(celulas).map(celula => celula.textContent.trim());
        dados.push(linhaDados);
    }

    localStorage.setItem('tabelaNotas', JSON.stringify(dados));
    mostrarPopup("Salvamento concluido", "A edição da sua tabela de notas foi salva com sucesso", "alerta");
}

function carregarNotas() {
    const dados = localStorage.getItem('tabelaNotas');
    if (!dados) return;

    try {
        const linhas = JSON.parse(dados);
        if (!Array.isArray(linhas)) return;
        const numAvaliacoes = linhas[0] ? linhas[0].length - 2 : 0;

        let tabelaHTML = '<table class="tabela-horarios"><tr><th>Matéria</th>';

        for (let i = 1; i <= numAvaliacoes; i++) {
            tabelaHTML += `<th>Avaliação ${i}</th>`;
        }

        tabelaHTML += '<th>Média</th></tr>';

        linhas.forEach(linha => {
            tabelaHTML += `<tr><th contenteditable="true">${linha[0] || ''}</th>`;

            for (let j = 1; j <= numAvaliacoes; j++) {
                tabelaHTML += `<td contenteditable="true">${linha[j] || ''}</td>`;
            }

            tabelaHTML += `<td contenteditable="true" class="media">${linha[numAvaliacoes + 1] || ''}</td></tr>`;
        });

        tabelaHTML += '</table><div style="display: flex;"><button onclick="salvarNotas()" class="botao">Salvar Boletim</button><button onclick="excluirNotas()" class="botao"style="margin-left: 3vw;">Excluir Boletim</button></div>';
        document.getElementById("tabela-notas").innerHTML = tabelaHTML;
    } catch (e) {
        console.error("Erro ao carregar notas:", e);
    }
}
function excluirHorario() {
    mostrarPopup("Excluir Horário", "Deseja apagar completamente a tabela de horários?", "confirmacao", () => {
        localStorage.removeItem('horarioAulas');
        document.getElementById('tabela-horarios').innerHTML = `
            <div id="sumiH"><br>
                <label>Quantas aulas você tem por dia?</label><br>
                <input type="number" id="num-aulas" min="1">
                <button onclick="criarHorario()" class="botao">Criar Horário</button>
            </div>`;
    });
}

function excluirNotas() {
    mostrarPopup("Excluir Boletim", "Deseja apagar completamente a tabela de notas?", "confirmacao", () => {
        localStorage.removeItem('tabelaNotas');
        document.getElementById('tabela-notas').innerHTML = `
            <div id="sumiN"><br>
                <label>Quantas materias você tem?</label><br>
                <input type="number" id="num-materias" min="1">
                <label>Quantas avaliações você tem?</label><br>
                <input type="number" id="num-avaliacoes" min="1">
                <button onclick="criarNotas()" class="botao">Criar boletim</button>
            </div>`;
    });
}

function alternarModo() {
    if (modoCoisado === false) {

        modoCoisado = true;
        const cores = document.documentElement;
        cores.style.setProperty('--corPrincipal', '#8b12c4');
        cores.style.setProperty('--corSecundaria', ' #5a0e7e');
        cores.style.setProperty('--fundoPrincipal', '#fafeff');
        cores.style.setProperty('--fundoSecundario', '#dae7e9');
        cores.style.setProperty('--fundoTerciario', '#edf1f1');
        cores.style.setProperty('--tabela', 'white');
        cores.style.setProperty('--textoPrincipal', 'rgba(0, 0, 0, 0.8)');
        cores.style.setProperty('--textoSecundario', 'rgba(0, 0, 0, 0.7)');
        cores.style.setProperty('--textoTerciario', 'rgba(36, 36, 36, 0.8)');
        cores.style.setProperty('--textoClaro', 'white');
        cores.style.setProperty('--corTriangulo: ;', 'transparent transparent transparent #00000041');
        cores.style.setProperty('--inputBordas', '#00000054');
        cores.style.setProperty('--inputBordasSec', '#000000');
        cores.style.setProperty('--tarefasBordas', '#0000007a');
        cores.style.setProperty('--sombras', '#0000007e');
        document.getElementById('modoNoturno').style.filter = "saturate(1)"

    } else {

        modoCoisado = false;
        const cores = document.documentElement;
        cores.style.setProperty('--corPrincipal', '#8b12c4');
        cores.style.setProperty('--corSecundaria', '#5a0e7e');
        cores.style.setProperty('--fundoPrincipal', '#1a252e');
        cores.style.setProperty('--fundoSecundario', '#131b22');
        cores.style.setProperty('--fundoTerciario', '#162129');
        cores.style.setProperty('--tabela', ' black');
        cores.style.setProperty('--textoPrincipal', 'rgba(255, 255, 255, 0.8)');
        cores.style.setProperty('--textoSecundario', 'rgba(255, 255, 255, 0.7)');
        cores.style.setProperty('--textoTerciario', 'rgba(219, 219, 219, 0.8)');
        cores.style.setProperty('--textoClaro', 'black');
        cores.style.setProperty('--corTriangulo: ;', 'transparent transparent transparent rgba(177, 177, 177, 0.897)');
        cores.style.setProperty('--inputBordas', '#ffffff54');
        cores.style.setProperty('--inputBordasSec', '#ffffff');
        cores.style.setProperty('--tarefasBordas', '#9696967a');
        cores.style.setProperty('--sombras', '#0000007e');
        document.getElementById('modoNoturno').style.filter = "saturate(0)"
    }
}
function gerarMiniCalendario() {
    const calendario = document.getElementById("miniCalendario");
    calendario.innerHTML = "";

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const primeiroDia = new Date(ano, mes, 1).getDay();

    for (let i = 0; i < primeiroDia; i++) {
        const vazio = document.createElement("div");
        vazio.className = "dia";
        calendario.appendChild(vazio);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const divDia = document.createElement("div");
        divDia.className = "dia";
        divDia.innerText = dia;

        const dataFormatada = dia.toString().padStart(2, '0') + "/" +
            (mes + 1).toString().padStart(2, '0') + "/" +
            ano;

        const tarefas = recuperarTarefasPorData(dataFormatada);

        if (tarefas.length > 0) {
            const bolinha = document.createElement("div");
            bolinha.className = "bolinha";
            bolinha.innerText = tarefas.length;
            divDia.appendChild(bolinha);
        }

        calendario.appendChild(divDia);
    }
}
function recuperarTarefasPorData(dataDesejada) {
    const dados = JSON.parse(localStorage.getItem("anotakiSave")) || {};
    const tarefas = dados.tarefas || [];

    return tarefas.filter(t => t.data === dataDesejada && t.status !== "concluido");
}
function numeroTarefas() {
    const agora = new Date();
    let totalPendentes = 0;
    let proximas = 0;
    let emAtraso = 0;

    tarefas.forEach(t => {
        if (t.status !== "concluido") {
            if (!t.data || t.data === "Data não estipulada") {
                totalPendentes++;
            } else {
                const [dia, mes, ano] = t.data.split('/');
                const dataTarefa = new Date(`${ano}-${mes}-${dia}T23:59:59`);

                if (dataTarefa < agora) {
                    emAtraso++;
                } else {
                    proximas++;
                }

                totalPendentes++;
            }
        }
    });

    document.querySelector(".nTaT").innerHTML = `<h2>Tarefas Pendentes:</h2><br><h1>${totalPendentes}</h1>`;
    document.querySelector(".nTaP").innerHTML = `<h2>Próximas:</h2><br><h1>${proximas}</h1>`;
    document.querySelector(".nTaA").innerHTML = `<h2>Em Atraso:</h2><br><h1>${emAtraso}</h1>`;
}



document.addEventListener('DOMContentLoaded', function () {
    carregarHorario();
    carregarNotas();
    if (document.getElementById('num-aulas')) {
        document.getElementById('num-aulas').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') criarHorario();
        });
    }

    if (document.getElementById('num-materias')) {
        document.getElementById('num-materias').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') criarNotas();
        });
    }
});

window.onload = () => {
    if (!quillTarefa || !quillAnotacao) {
        inicializarEditores();
    }
    carregarProgresso();
    opD()
    carregarTarefas('todas')
    gerarMiniCalendario()
    numeroTarefas()
};

var modoCoisado = false;
