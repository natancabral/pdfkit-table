/**
 * pdfkit-table — Exemplo completo de todos os recursos
 * Autor: exemplo de uso da lib natancabral/pdfkit-table
 *
 * Recursos cobertos:
 *  1. Tabela simples com rows (array de arrays)
 *  2. Tabela complexa com datas (array de objetos) + headers tipados
 *  3. Formatação bold inline via prefixo "bold:"
 *  4. renderer personalizado por coluna (header e célula)
 *  5. options por linha (fontSize, separation)
 *  6. options por célula (label + options)
 *  7. prepareHeader — customização do header
 *  8. prepareRow — callback por célula (zebraStripe via addBackground)
 *  9. columnsSize — tamanho individual de colunas
 * 10. width e x — posição e largura da tabela
 * 11. divider — estilo das linhas divisórias (header e horizontal)
 * 12. padding — espaçamento interno
 * 13. title e subtitle da tabela
 * 14. hideHeader — tabela sem cabeçalho
 * 15. Múltiplas tabelas no mesmo documento
 */

const fs = require("fs");
const PDFDocument = require("pdfkit-table");

(async () => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(fs.createWriteStream("./document-04-all-scenerios.pdf"));

  // =============================================================================
  // Capa / Cabeçalho do documento
  // =============================================================================
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("pdfkit-table — Exemplo Completo", { align: "center" });

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#555555")
    .text("Demonstração de todos os recursos da biblioteca", {
      align: "center",
    });

  doc.moveDown(1.5);
  doc.fillColor("#000000");

  // =============================================================================
  // 1. Tabela simples com rows (array de arrays)
  // =============================================================================
  doc.fontSize(13).font("Helvetica-Bold").text("1. Tabela simples (rows)");
  doc.moveDown(0.3);

  const tabelaSimples = {
    headers: ["País", "Taxa de Conversão", "Tendência"],
    rows: [
      ["Brasil", "88%", "+2.77%"],
      ["Estados Unidos", "72%", "+1.10%"],
      ["Alemanha", "54%", "-0.50%"],
      ["Japão", "61%", "+3.20%"],
    ],
  };

  await doc.table(tabelaSimples, {
    width: 450,
  });

  doc.moveDown(1);

  // =============================================================================
  // 2. Tabela com title e subtitle
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("2. Tabela com title e subtitle");
  doc.moveDown(0.3);

  const tabelaComTitulo = {
    title: "Relatório de Vendas Q1 2025",
    subtitle: "Dados consolidados por região",
    headers: ["Região", "Vendas", "Meta", "Status"],
    rows: [
      ["Norte", "R$ 120.000", "R$ 100.000", "✓ Atingida"],
      ["Sul", "R$ 85.000", "R$ 90.000", "✗ Abaixo"],
      ["Leste", "R$ 200.000", "R$ 180.000", "✓ Atingida"],
      ["Oeste", "R$ 95.000", "R$ 95.000", "= Exato"],
    ],
  };

  await doc.table(tabelaComTitulo, {
    width: 480,
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
    prepareRow: () => doc.font("Helvetica").fontSize(9),
  });

  doc.moveDown(1);

  // =============================================================================
  // 3. Tabela complexa com datas (objetos) + headers tipados com property
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("3. Tabela complexa com datas (objetos)");
  doc.moveDown(0.3);

  const tabelaComplexaDatas = {
    headers: [
      { label: "Produto", property: "produto", width: 120 },
      { label: "Descrição", property: "descricao", width: 170 },
      { label: "Qtd", property: "qtd", width: 40 },
      { label: "Preço Unit.", property: "preco", width: 80 },
      { label: "Total", property: "total", width: 80 },
    ],
    datas: [
      {
        produto: "Notebook",
        descricao: "Dell Inspiron 15, 16GB RAM, SSD 512GB",
        qtd: "2",
        preco: "R$ 3.500,00",
        total: "R$ 7.000,00",
      },
      {
        produto: "Monitor",
        descricao: 'LG 27" Full HD IPS',
        qtd: "3",
        preco: "R$ 1.200,00",
        total: "R$ 3.600,00",
      },
      {
        produto: "Teclado",
        descricao: "Mecânico RGB, Switch Blue",
        qtd: "5",
        preco: "R$ 350,00",
        total: "R$ 1.750,00",
      },
    ],
  };

  await doc.table(tabelaComplexaDatas, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(9);
      // Zebra stripe
      if (indexColumn === 0) {
        doc.addBackground(
          rectRow,
          indexRow % 2 === 0 ? "#e8f4fd" : "#ffffff",
          0.6,
        );
      }
    },
  });

  doc.moveDown(1);

  // =============================================================================
  // 4. renderer por coluna — formatação customizada de células e header
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("4. renderer por coluna (header e células)");
  doc.moveDown(0.3);

  const tabelaRenderer = {
    headers: [
      { label: "Funcionário", property: "nome", width: 140 },
      { label: "Departamento", property: "dept", width: 110 },
      {
        label: "Salário",
        property: "salario",
        width: 90,
        // renderer de CÉLULA: recebe (value, indexColumn, indexRow, row)
        renderer: (value) => `R$ ${Number(value).toFixed(2).replace(".", ",")}`,
      },
      {
        label: "% Bônus",
        property: "bonus",
        width: 80,
        renderer: (value, col, row) => `${value}%`,
      },
      {
        label: "Avaliação",
        property: "nota",
        width: 80,
        renderer: (value) => {
          const n = Number(value);
          if (n >= 9) return "★★★★★ Excelente";
          if (n >= 7) return "★★★★☆ Bom";
          return "★★★☆☆ Regular";
        },
      },
    ],
    datas: [
      {
        nome: "Ana Souza",
        dept: "Engenharia",
        salario: "8500",
        bonus: "15",
        nota: "9.5",
      },
      {
        nome: "Carlos Lima",
        dept: "Marketing",
        salario: "6200",
        bonus: "10",
        nota: "7.2",
      },
      {
        nome: "Mariana Costa",
        dept: "RH",
        salario: "5800",
        bonus: "8",
        nota: "8.1",
      },
      {
        nome: "Pedro Alves",
        dept: "Engenharia",
        salario: "9100",
        bonus: "18",
        nota: "9.8",
      },
    ],
  };

  await doc.table(tabelaRenderer, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(8);
      if (indexColumn === 0) {
        // Cor por departamento
        const dept = row.dept || "";
        const cor =
          dept === "Engenharia"
            ? "#d4edda"
            : dept === "Marketing"
              ? "#fff3cd"
              : "#f8d7da";
        doc.addBackground(rectRow, cor, 0.7);
      }
    },
  });

  doc.moveDown(1);

  // =============================================================================
  // 5. Formatação bold inline via prefixo "bold:" e options por linha
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text('5. Bold inline ("bold:") + options por linha + options por célula');
  doc.moveDown(0.3);

  const tabelaBold = {
    headers: [
      { label: "Item", property: "item", width: 130 },
      { label: "Valor", property: "valor", width: 120 },
      { label: "Observação", property: "obs", width: 230 },
    ],
    datas: [
      // linha normal
      {
        item: "Receita Bruta",
        valor: "bold:R$ 500.000,00",
        obs: "Faturamento total do período",
      },
      // options por linha: fontSize menor e linha separadora
      {
        item: "bold:(-) Deduções",
        valor: "bold:R$ 75.000,00",
        obs: "Impostos e devoluções",
        options: { fontSize: 8, separation: true },
      },
      // options por célula individual
      {
        item: "Receita Líquida",
        valor: {
          label: "bold:R$ 425.000,00",
          options: { fontSize: 13 },
        },
        obs: "Após deduções",
      },
      {
        item: "bold:Lucro Operacional",
        valor: "bold:R$ 180.000,00",
        obs: {
          label: "42,4% sobre a receita líquida",
          options: { fontSize: 7 },
        },
        options: { separation: true },
      },
    ],
  };

  await doc.table(tabelaBold, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
    prepareRow: () => doc.font("Helvetica").fontSize(9),
  });

  doc.moveDown(1);

  // =============================================================================
  // 6. columnsSize, x, width — controle fino de posicionamento
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("6. columnsSize + posicionamento (x, width)");
  doc.moveDown(0.3);

  const tabelaPositionada = {
    headers: ["Mês", "Receita", "Custo"],
    rows: [
      ["Janeiro", "R$ 120k", "R$ 80k"],
      ["Fevereiro", "R$ 135k", "R$ 88k"],
      ["Março", "R$ 160k", "R$ 95k"],
    ],
  };

  // Tabela deslocada para o centro com colunas de tamanhos distintos
  await doc.table(tabelaPositionada, {
    x: 80,
    width: 420,
    columnsSize: [140, 140, 140],
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(10);
      if (indexColumn === 0) {
        doc.addBackground(
          rectRow,
          indexRow % 2 === 0 ? "#fef9e7" : "#fdfefe",
          0.8,
        );
      }
    },
  });

  doc.moveDown(1);

  // =============================================================================
  // 7. divider — estilo das linhas divisórias
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("7. Customização de dividers (linhas)");
  doc.moveDown(0.3);

  const tabelaDivider = {
    headers: ["Código", "Produto", "Estoque"],
    rows: [
      ["001", "Parafuso M6", "1.200 un"],
      ["002", "Porca M6", "950 un"],
      ["003", "Arruela 6mm", "3.400 un"],
      ["004", "Chave Allen 4mm", "120 un"],
    ],
  };

  await doc.table(tabelaDivider, {
    width: 420,
    divider: {
      header: { disabled: false, width: 2, opacity: 1 },
      horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
    },
    prepareHeader: () =>
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#1a5276"),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(9).fillColor("#000000");
      if (indexColumn === 0) {
        doc.addBackground(rectRow, "#d6eaf8", indexRow % 2 === 0 ? 0.4 : 0);
      }
    },
  });

  doc.moveDown(1);

  // =============================================================================
  // 8. padding — espaçamento interno das células
  // =============================================================================
  doc.fontSize(13).font("Helvetica-Bold").text("8. Padding customizado");
  doc.moveDown(0.3);

  const tabelaPadding = {
    headers: ["Tipo", "Detalhes"],
    rows: [
      ["Contato", "comercial@empresa.com.br"],
      ["Suporte", "suporte@empresa.com.br"],
      ["Endereço", "Av. Paulista, 1000 — São Paulo/SP"],
    ],
  };

  await doc.table(tabelaPadding, {
    width: 450,
    padding: 10, // padding uniforme em todas as células
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
    prepareRow: () => doc.font("Helvetica").fontSize(9),
  });

  doc.moveDown(1);

  // =============================================================================
  // 9. hideHeader — tabela sem cabeçalho visível
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("9. hideHeader — tabela sem cabeçalho");
  doc.moveDown(0.3);

  const tabelaSemHeader = {
    headers: ["Chave", "Valor"],
    rows: [
      ["Empresa", "Acme Ltda"],
      ["CNPJ", "00.000.000/0001-00"],
      ["Inscrição Estadual", "123.456.789.000"],
      ["Regime Tributário", "Simples Nacional"],
    ],
  };

  await doc.table(tabelaSemHeader, {
    width: 380,
    hideHeader: true,
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      if (indexColumn === 0) {
        doc.font("Helvetica-Bold").fontSize(9);
        doc.addBackground(rectRow, "#f2f3f4", 0.8);
      } else {
        doc.font("Helvetica").fontSize(9);
      }
    },
  });

  doc.moveDown(1);

  // =============================================================================
  // 10. Tabela com linhas mistas (datas + rows no mesmo objeto)
  // =============================================================================
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("10. datas + rows misturados na mesma tabela");
  doc.moveDown(0.3);

  const tabelaMista = {
    headers: [
      { label: "Descrição", property: "desc", width: 200 },
      { label: "Categoria", property: "cat", width: 120 },
      {
        label: "Valor (R$)",
        property: "valor",
        width: 100,
        renderer: (v) =>
          `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      },
      { label: "Data", property: "data", width: 80 },
    ],
    datas: [
      {
        desc: "Licença de Software",
        cat: "TI",
        valor: "1200",
        data: "01/03/25",
      },
      {
        desc: "bold:Subtotal Obj.",
        cat: "bold:—",
        valor: "bold:1200",
        data: "bold:—",
        options: { separation: true },
      },
    ],
    // rows simples são adicionados após os datas
    rows: [
      ["Aluguel Escritório", "Infraestrutura", "R$ 5.800,00", "01/03/25"],
      ["Energia Elétrica", "Infraestrutura", "R$ 940,00", "05/03/25"],
      ["Internet", "TI", "R$ 380,00", "01/03/25"],
    ],
  };

  await doc.table(tabelaMista, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(9);
      if (indexColumn === 0 && indexRow % 2 === 0) {
        doc.addBackground(rectRow, "#f9f9f9", 0.9);
      }
    },
  });

  // =============================================================================
  // Rodapé do documento
  // =============================================================================
  doc.moveDown(2);
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#999999")
    .text("Gerado com pdfkit-table · github.com/natancabral/pdfkit-table", {
      align: "center",
    });

  doc.end();
  console.log("✅ PDF gerado: exemplo-completo.pdf");
})();
