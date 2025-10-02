// ----- Dados iniciais -----
let usuarios = [
  { id: 1, nome: "João Silva", email: "joao@email.com", status: "Ativo", vendas: 1500 },
  { id: 2, nome: "Maria Souza", email: "maria@email.com", status: "Inativo", vendas: 2300 }
];

const userTable = document.getElementById("userTable");
const filtroStatus = document.getElementById("filtroStatus");
const filtroVendas = document.getElementById("filtroVendas");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");

// ----- Menu -----
document.querySelectorAll(".menu-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".menu-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll(".section").forEach(s => s.classList.add("d-none"));
    document.getElementById("section-" + link.dataset.section).classList.remove("d-none");
  });
});

// ----- Dark Mode -----
const toggleBtn = document.getElementById("toggleDarkMode");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleBtn.innerHTML = document.body.classList.contains("dark-mode") ? "☀️ Light" : "🌙 Dark";
  atualizarGraficos();
});

// ----- Gráficos -----
const ctxVendasUsuarios = document.getElementById("chartVendasUsuarios");
const ctxUsuarios = document.getElementById("chartUsuarios");

let chartVendasUsuarios = new Chart(ctxVendasUsuarios, {
  type: "bar",
  data: { labels: [], datasets: [{ label: "Vendas (R$)", data: [], backgroundColor: "#4e73df", borderColor: "#224abe", borderWidth: 1 }] },
  options: {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: () => document.body.classList.contains("dark-mode") ? "#fff" : "#212529" } },
      y: { grid: { color: 'rgba(0,0,0,0.1)' }, ticks: { color: () => document.body.classList.contains("dark-mode") ? "#fff" : "#212529" } }
    }
  }
});

let chartUsuarios = new Chart(ctxUsuarios, {
  type: "doughnut",
  data: { labels: ["Ativos", "Inativos"], datasets: [{ data: [0, 0], backgroundColor: ["#1cc88a", "#e74a3b"], borderColor: "#fff", borderWidth: 2 }] },
  options: {
    responsive: true,
    plugins: { legend: { position: "bottom", labels: { color: () => document.body.classList.contains("dark-mode") ? "#fff" : "#212529" } } }
  }
});

// ----- Funções -----
function atualizarGraficos() {
  chartVendasUsuarios.data.labels = usuarios.map(u => u.nome);
  chartVendasUsuarios.data.datasets[0].data = usuarios.map(u => u.vendas);
  chartVendasUsuarios.options.scales.x.ticks.color = document.body.classList.contains("dark-mode") ? "#fff" : "#212529";
  chartVendasUsuarios.options.scales.y.ticks.color = document.body.classList.contains("dark-mode") ? "#fff" : "#212529";
  chartVendasUsuarios.update();

  const ativos = usuarios.filter(u => u.status === "Ativo").length;
  const inativos = usuarios.filter(u => u.status === "Inativo").length;
  chartUsuarios.data.datasets[0].data = [ativos, inativos];
  chartUsuarios.options.plugins.legend.labels.color = document.body.classList.contains("dark-mode") ? "#fff" : "#212529";
  chartUsuarios.update();

  document.getElementById("totalUsuarios").textContent = usuarios.length;
  document.getElementById("totalVendas").textContent = "R$ " + usuarios.reduce((a, b) => a + b.vendas, 0);
  document.getElementById("usuariosAtivos").textContent = ativos;
  document.getElementById("usuariosInativos").textContent = inativos;
}

function renderUsuarios() {
  userTable.innerHTML = "";
  const statusSel = filtroStatus.value;
  const vendasMin = parseFloat(filtroVendas.value) || 0;

  usuarios.filter(u => (statusSel === "Todos" || u.status === statusSel))
          .filter(u => u.vendas >= vendasMin)
          .forEach((u, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>
        <select class="form-select form-select-sm status-select">
          <option ${u.status === "Ativo" ? "selected" : ""}>Ativo</option>
          <option ${u.status === "Inativo" ? "selected" : ""}>Inativo</option>
        </select>
      </td>
      <td><input type="number" class="form-control form-control-sm vendas-input" value="${u.vendas}" min="0"></td>
      <td><button class="btn btn-sm btn-danger delete-btn">Excluir</button></td>
    `;
    userTable.appendChild(row);

    row.querySelector(".status-select").addEventListener("change", e => { u.status = e.target.value; atualizarGraficos(); });
    row.querySelector(".vendas-input").addEventListener("input", e => { u.vendas = parseFloat(e.target.value) || 0; atualizarGraficos(); });
    row.querySelector(".delete-btn").addEventListener("click", () => { usuarios.splice(usuarios.indexOf(u), 1); renderUsuarios(); atualizarGraficos(); });
  });

  atualizarGraficos();
}

// ----- Eventos -----
btnAplicarFiltros.addEventListener("click", e => { e.preventDefault(); renderUsuarios(); });

document.getElementById("userForm").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const status = document.getElementById("status").value;
  const vendas = parseFloat(document.getElementById("vendas").value) || 0;

  usuarios.push({ id: usuarios.length + 1, nome, email, status, vendas });
  document.getElementById("userForm").reset();
  renderUsuarios();
});

document.getElementById("btnExportCSV").addEventListener("click", () => {
  let csv = "Nome,Email,Status,Vendas\n";
  usuarios.forEach(u => { csv += `${u.nome},${u.email},${u.status},${u.vendas}\n`; });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "usuarios.csv";
  link.click();
});

// ----- Inicialização -----
renderUsuarios();
atualizarGraficos();
