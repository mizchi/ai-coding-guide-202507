import { describe, it, expect } from 'vitest';
import { dijkstra, getShortestPath, createGraph, type EdgeTuple } from '../src/dijkstra.ts';

describe('Dijkstra Algorithm', () => {
  it('should find shortest path in a simple graph', () => {
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
    
    expect(result.distances).toEqual([0, 4, 2, 9, 11]);
    
    const pathTo3 = getShortestPath(result.previous, 3);
    expect(pathTo3).toEqual([0, 1, 3]);
  });

  it('should handle single node graph', () => {
    const result = dijkstra([[]], 0);
    
    expect(result.distances).toEqual([0]);
    expect(result.previous).toEqual([null]);
  });

  it('should handle disconnected graph', () => {
    const edges: EdgeTuple[] = [
      [0, 1, 5],
      [2, 3, 3]
    ];
    
    const graph = createGraph(edges);
    const result = dijkstra(graph, 0);
    
    expect(result.distances[0]).toBe(0);
    expect(result.distances[1]).toBe(5);
    expect(result.distances[2]).toBe(Infinity);
    expect(result.distances[3]).toBe(Infinity);
  });

  it('should find shortest path with multiple routes', () => {
    const edges: EdgeTuple[] = [
      [0, 1, 10],
      [0, 2, 3],
      [1, 3, 2],
      [2, 1, 4],
      [2, 3, 8]
    ];
    
    const graph = createGraph(edges);
    const result = dijkstra(graph, 0);
    
    expect(result.distances).toEqual([0, 7, 3, 9]);
    
    const pathTo3 = getShortestPath(result.previous, 3);
    expect(pathTo3).toEqual([0, 2, 1, 3]);
  });

  it('should handle complex graph with cycles', () => {
    const edges: EdgeTuple[] = [
      [0, 1, 1],
      [0, 2, 4],
      [1, 2, 2],
      [1, 3, 5],
      [2, 3, 1],
      [3, 4, 3],
      [4, 5, 2],
      [3, 5, 4],
      [1, 4, 8],
      [2, 5, 6]
    ];
    
    const graph = createGraph(edges);
    const result = dijkstra(graph, 0);
    
    expect(result.distances).toEqual([0, 1, 3, 4, 7, 8]);
    
    const pathTo5 = getShortestPath(result.previous, 5);
    expect(pathTo5).toEqual([0, 1, 2, 3, 5]);
  });

  it('should handle graph with zero weight edges', () => {
    const edges: EdgeTuple[] = [
      [0, 1, 0],
      [1, 2, 0],
      [2, 3, 1],
      [0, 3, 5]
    ];
    
    const graph = createGraph(edges);
    const result = dijkstra(graph, 0);
    
    expect(result.distances).toEqual([0, 0, 0, 1]);
    
    const pathTo3 = getShortestPath(result.previous, 3);
    expect(pathTo3).toEqual([0, 1, 2, 3]);
  });

  it('should handle large distance values', () => {
    const edges: EdgeTuple[] = [
      [0, 1, 1000],
      [0, 2, 100],
      [1, 3, 50],
      [2, 3, 800],
      [2, 1, 50]
    ];
    
    const graph = createGraph(edges);
    const result = dijkstra(graph, 0);
    
    expect(result.distances).toEqual([0, 150, 100, 200]);
    
    const pathTo3 = getShortestPath(result.previous, 3);
    expect(pathTo3).toEqual([0, 2, 1, 3]);
  });

  it('should handle graph with self-loops', () => {
    const edges: EdgeTuple[] = [
      [0, 0, 1],
      [0, 1, 3],
      [1, 1, 2],
      [1, 2, 1]
    ];
    
    const graph = createGraph(edges);
    const result = dijkstra(graph, 0);
    
    expect(result.distances).toEqual([0, 3, 4]);
    
    const pathTo2 = getShortestPath(result.previous, 2);
    expect(pathTo2).toEqual([0, 1, 2]);
  });
});