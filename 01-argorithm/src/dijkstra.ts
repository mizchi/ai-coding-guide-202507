type Edge = {
  to: number;
  weight: number;
};

export type EdgeTuple = [from: number, to: number, weight: number];

type Graph = Edge[][];

class PriorityQueue {
  private heap: { node: number; distance: number }[] = [];

  enqueue(node: number, distance: number) {
    this.heap.push({ node, distance });
    this.heapifyUp(this.heap.length - 1);
  }

  dequeue(): { node: number; distance: number } | null {
    if (this.heap.length === 0) return null;
    
    const min = this.heap[0];
    const last = this.heap.pop()!;
    
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number) {
    const parentIndex = Math.floor((index - 1) / 2);
    
    if (parentIndex >= 0 && this.heap[parentIndex].distance > this.heap[index].distance) {
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      this.heapifyUp(parentIndex);
    }
  }

  private heapifyDown(index: number) {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let smallest = index;

    if (leftChild < this.heap.length && this.heap[leftChild].distance < this.heap[smallest].distance) {
      smallest = leftChild;
    }

    if (rightChild < this.heap.length && this.heap[rightChild].distance < this.heap[smallest].distance) {
      smallest = rightChild;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      this.heapifyDown(smallest);
    }
  }
}

export function dijkstra(graph: Graph, start: number): { distances: number[]; previous: (number | null)[] } {
  const n = graph.length;
  const distances = new Array(n).fill(Infinity);
  const previous = new Array(n).fill(null);
  const visited = new Array(n).fill(false);
  const pq = new PriorityQueue();

  distances[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const node = current.node;

    if (visited[node]) continue;
    visited[node] = true;

    for (const edge of graph[node]) {
      const neighbor = edge.to;
      const weight = edge.weight;
      const newDistance = distances[node] + weight;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = node;
        pq.enqueue(neighbor, newDistance);
      }
    }
  }

  return { distances, previous };
}

export function getShortestPath(previous: (number | null)[], target: number): number[] {
  const path: number[] = [];
  let current: number | null = target;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
}

export function createGraph(edges: EdgeTuple[]): Graph {
  const maxNode = Math.max(...edges.map(([from, to]) => Math.max(from, to)));
  const graph: Graph = Array.from({ length: maxNode + 1 }, () => []);

  for (const [from, to, weight] of edges) {
    graph[from].push({ to, weight });
  }

  return graph;
}