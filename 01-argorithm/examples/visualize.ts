import { dijkstra, getShortestPath, createGraph, type EdgeTuple } from '../src/dijkstra.ts';

function generateMermaidGraph(edges: EdgeTuple[], shortestPaths: { [key: number]: number[] }): string {
  let mermaid = 'graph TD\n';
  
  // Add all edges
  for (const [from, to, weight] of edges) {
    const isInShortestPath = Object.values(shortestPaths).some(path => {
      const fromIndex = path.indexOf(from);
      const toIndex = path.indexOf(to);
      return fromIndex !== -1 && toIndex === fromIndex + 1;
    });
    
    if (isInShortestPath) {
      mermaid += `    ${from} -->|${weight}| ${to}\n`;
      mermaid += `    linkStyle ${edges.indexOf([from, to, weight])} stroke:#ff0000,stroke-width:3px\n`;
    } else {
      mermaid += `    ${from} -->|${weight}| ${to}\n`;
    }
  }
  
  return mermaid;
}

function visualizeDijkstra() {
  const edges: EdgeTuple[] = [
    [0, 1, 4],
    [0, 2, 2],
    [1, 2, 1],
    [1, 3, 5],
    [2, 3, 8],
    [2, 4, 10],
    [3, 4, 2]
  ];

  const graph = createGraph(edges);
  const result = dijkstra(graph, 0);
  
  console.log('=== ダイクストラアルゴリズムの結果 ===');
  console.log('各ノードへの最短距離:', result.distances);
  console.log();
  
  // 各ノードへの最短経路を取得
  const shortestPaths: { [key: number]: number[] } = {};
  for (let i = 0; i < result.distances.length; i++) {
    if (result.distances[i] !== Infinity) {
      shortestPaths[i] = getShortestPath(result.previous, i);
      console.log(`ノード${i}への最短経路:`, shortestPaths[i].join(' → '), `(距離: ${result.distances[i]})`);
    }
  }
  
  console.log('\n=== Mermaidグラフ ===');
  console.log('```mermaid');
  
  // グラフの基本構造
  console.log('graph TD');
  console.log('    %% ノードのスタイル');
  console.log('    0[0:開始]');
  for (let i = 1; i < result.distances.length; i++) {
    console.log(`    ${i}[${i}:${result.distances[i]}]`);
  }
  
  console.log('    %% エッジ');
  let edgeIndex = 0;
  for (const [from, to, weight] of edges) {
    console.log(`    ${from} -->|${weight}| ${to}`);
    
    // 最短経路に含まれるエッジかチェック
    const isInShortestPath = Object.values(shortestPaths).some(path => {
      const fromIndex = path.indexOf(from);
      const toIndex = path.indexOf(to);
      return fromIndex !== -1 && toIndex === fromIndex + 1;
    });
    
    if (isInShortestPath) {
      console.log(`    linkStyle ${edgeIndex} stroke:#ff0000,stroke-width:3px`);
    }
    edgeIndex++;
  }
  
  console.log('    %% スタイル');
  console.log('    classDef startNode fill:#90EE90');
  console.log('    classDef reachableNode fill:#87CEEB');
  console.log('    class 0 startNode');
  
  const reachableNodes = [];
  for (let i = 1; i < result.distances.length; i++) {
    if (result.distances[i] !== Infinity) {
      reachableNodes.push(i);
    }
  }
  if (reachableNodes.length > 0) {
    console.log(`    class ${reachableNodes.join(',')} reachableNode`);
  }
  
  console.log('```');
}

visualizeDijkstra();