import { dijkstra, getShortestPath, createGraph, type EdgeTuple } from '../src/dijkstra.ts';

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

console.log('各ノードへの最短距離:', result.distances);
console.log('ノード3への最短経路:', getShortestPath(result.previous, 3));
console.log('ノード4への最短経路:', getShortestPath(result.previous, 4));