let edges; 
let nodes;
function buildGraph() {
  //отримуємо матрицю суміжності з текстової області
  let input = document.getElementById("matrixInput1").value.trim();
  let rows = input.split("\n");
  let adjacencyMatrix = rows.map(function (row) {
    return row.trim().split(/\s+/).map(Number);
  });
  //коректність матриці
  let size = adjacencyMatrix.length;
  for (let i = 0; i < size; i++) {
    if (adjacencyMatrix[i].length !== size) {
      alert(
        "Матриця повинна бути квадратною (однакова кількість рядків і стовпців)."
      );
      return;
    }
  }

  //тип графа орієнтований чи ні
  let graphType = document.querySelector(
    'input[name="graphType"]:checked'
  ).value;
  let isDirected = graphType === "directed";

  //створення вершин
  nodes = new vis.DataSet();
  for (let i = 0; i < size; i++) {
    nodes.add({ id: i + 1, label: "x" + (i + 1) });
  }

  //створення ребер за матрицею суміжності
  edges = new vis.DataSet();
  let edgeIdCounter = 1;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let edgeCount = adjacencyMatrix[i][j];
      for (let k = 0; k < edgeCount; k++) {
        //для неорієнтованого графа додаємо одне ребро
        if (!isDirected && i > j) continue;

        edges.add({
          id: edgeIdCounter,
          from: i + 1,
          to: j + 1,
          label: "y" + edgeIdCounter,
          arrows: isDirected ? "to" : undefined,
        });
        edgeIdCounter++;
      }
    }
  }

  //граф
  let container = document.getElementById("mynetwork");
  let data = { nodes: nodes, edges: edges };
  let options = {
    nodes: {
      size: 16,
      font: {
        size: 14,
        color: "#000000",
      },
      borderWidth: 2,
    },
    edges: {
      width: 2,
      color: { inherit: "from" },
      font: {
        size: 12,
        color: "black",
        background: "none",
        strokeWidth: 0,
      },
    },
  };

  window.network = new vis.Network(container, data, options);
}

function findEulerianCycle() {
  //отримуємо матрицю суміжності з текстової області
  let input = document.getElementById("matrixInput1").value.trim();
  let rows = input.split("\n");
  let adjacencyMatrix = rows.map(function (row) {
    return row.trim().split(/\s+/).map(Number);
  });
  //перевірка графу на зв'язність
  function checkGraphConnectivity() {
    let visited = new Array(adjacencyMatrix.length).fill(false); //масив для відмітки відвіданих вершин

    function depthFirstSearch(vertex) {
      visited[vertex] = true; //відмічаємо поточну вершину як відвідану

      //проходимо по всіх сусідах
      for (let i = 0; i < adjacencyMatrix[vertex].length; i++) {
        if (adjacencyMatrix[vertex][i] > 0 && !visited[i]) {
          // перевіряємо, чи є ребро
          depthFirstSearch(i); //рекурсивний виклик для сусідньої вершини
        }
      }
    }

    // починаємо з першої вершини
    depthFirstSearch(0);

    //чи всі вершини були відвідані
    const isConnected = visited.every((v) => v);
    document.querySelector(".inputRes").innerHTML = document.querySelector(
      ".inputRes"
    ).value = `Граф ${isConnected ? "зв'язний" : "не зв'язний"}`;
    return isConnected;
  }

  //перевірка степенів вершин на парність
  function checkVertexDegrees() {
    let isEulerian = true;
    for (let i = 0; i < adjacencyMatrix.length; i++) {
      let degree = 0; //ступінь вершини
      for (let j = 0; j < adjacencyMatrix[i].length; j++) {
        degree += adjacencyMatrix[i][j]; //додаємо значення з матриці
      }
      if (degree % 2 !== 0) {
        isEulerian = false; //якщо ступінь не парний
        break;
      }
    }
    return isEulerian;
  }

  //пошук ейлерового циклу
  function findEulerianPath() {
    let stack = []; //невідвідані вершини
    let cycle = []; //відвідані вершини
    let currentVertex = 0; //початкова вершина
    stack.push(currentVertex);

    while (stack.length > 0) {
      let hasUnvisitedEdge = false;
      for (let i = 0; i < adjacencyMatrix.length; i++) {
        //сусідні вершини
        if (adjacencyMatrix[currentVertex][i] > 0) {
          //чи є ребро
          stack.push(currentVertex);
          //зменшуємо кількість ребер
          adjacencyMatrix[currentVertex][i]--;
          adjacencyMatrix[i][currentVertex]--;
          //переходимо до сусідньої вершини
          currentVertex = i;
          hasUnvisitedEdge = true;
          break;
        }
      }
      if (!hasUnvisitedEdge) {
        cycle.push(currentVertex);
        currentVertex = stack.pop();
      }
    }
    return cycle;
  }

  //перевірка зв'язності та парності
  if (checkGraphConnectivity() && checkVertexDegrees()) {
    const cycle = findEulerianPath();
    document.querySelector(".inputRes").value = `Ейлерів цикл: ${cycle
      .map((v) => "x" + (v + 1))
      .join(" -> ")}`;
  } else {
    document.querySelector(".inputRes").value = "Граф не має Ейлерового циклу";
  }
}
function colorVertices() {
  // отримуємо матрицю суміжності
  let input = document.getElementById("matrixInput1").value.trim();
  let rows = input.split("\n");
  let adjacencyMatrix = rows.map(function (row) {
    return row.trim().split(/\s+/).map(Number);
  });
  let vertexDegrees = [];//вершина+ступінь
  for (let i = 0; i < adjacencyMatrix.length; i++) {
    let degree = 0; //ступінь вершини
    for (let j = 0; j < adjacencyMatrix[i].length; j++) {
      degree += adjacencyMatrix[i][j];  //додаємо значення з матриці
    }
    vertexDegrees.push({ vertex: i, degree }); 
  }
  vertexDegrees.sort((a, b) => b.degree - a.degree);//за спаданням
  let vertexColors = new Array(adjacencyMatrix.length).fill(-1);//зберігаємо колір кожної вершини
  // призначення кольорів вершинам
  for (let i = 0; i < vertexDegrees.length; i++) {
    let vertex = vertexDegrees[i].vertex;//вершина з найбільшим степенем
    let usedColors = new Array(adjacencyMatrix.length).fill(false);
    //проходимося по сусідніх вершинах  
    for (let j = 0; j < adjacencyMatrix[vertex].length; j++) {
      if (adjacencyMatrix[vertex][j] > 0 && vertexColors[j] !== -1) {
        usedColors[vertexColors[j]] = true;//позначаємо колір, який вже використовується
      }
    }
    let color = 0;
    while (usedColors[color]) color++;//пропускаємо використані кольори
    vertexColors[vertex] = color;//призначаємо перший доступний колір
  }
  // задаємо кольори
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#800080", "#66ff33"];
  for (let i = 0; i < nodes.length; i++) {
    nodes.update({
      id: i + 1,
      color: { background: colors[vertexColors[i] % colors.length] }
    });
  }
}
//розфарбування ребер
function colorEdges() {
  //масив кольорів для кожного ребра
  let edgeColors = [];

  //призначаємо кольори ребрам
  edges.forEach(function(edge) {
    let usedColors = new Set(); //використані кольори сусідніх ребер
    let fromNode = edge.from - 1; //зменшуємо на 1, оскільки індексація вершин з 0
    let toNode = edge.to - 1; 

    //перевіряємо сусідні ребра з тією ж самою вершиною (щоб вони не мали однаковий колір)
    edges.forEach(function(neighborEdge) {
      if ((neighborEdge.from - 1 === fromNode || neighborEdge.to - 1 === fromNode) && neighborEdge.id !== edge.id) {
        usedColors.add(edgeColors[neighborEdge.id - 1]);
      }
      if ((neighborEdge.from - 1 === toNode || neighborEdge.to - 1 === toNode) && neighborEdge.id !== edge.id) {
        usedColors.add(edgeColors[neighborEdge.id - 1]);
      }
    });

    //знайдемо перший доступний колір, який не використовується сусідніми ребрами
    let colorIndex = 0;
    while (usedColors.has(colorIndex)) {
      colorIndex++;
    }
    edgeColors[edge.id - 1] = colorIndex; //призначаємо колір
  });

  //оновлюємо кольори для всіх ребер
  edges.forEach(function(edge) {
    edges.update({
      id: edge.id,
      color: { color: getColorFromIndex(edgeColors[edge.id - 1]) }
    });
  });
}
//перетворення індексу кольору на реальний колір
function getColorFromIndex(index) {
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#800080", "#66ff33"];
  return colors[index % colors.length];
}
//побудова графа при завантаженні сторінки
window.onload = buildGraph;
function Clean() {
  document.getElementById("matrixInput1").value = " ";
}
