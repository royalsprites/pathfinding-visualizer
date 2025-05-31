export class Node {
  row: number;
  col: number;
  isWall: boolean = false;
  isStart: boolean = false;
  isEnd: boolean = false;
  isVisited: boolean = false;
  isPath: boolean = false;
  distance: number = Infinity;
  parent: Node | null = null;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  reset() {
    this.isVisited = false;
    this.isPath = false;
    this.distance = Infinity;
    this.parent = null;
  }
}

export class Grid {
  rows: number;
  cols: number;
  nodes: Node[][];
  startNode: Node | null = null;
  endNode: Node | null = null;

  constructor(rows: number = 10, cols: number = 10) {
    this.rows = rows;
    this.cols = cols;
    this.nodes = [];
    this.initialize();
  }

  initialize() {
    this.nodes = [];
    for (let row = 0; row < this.rows; row++) {
      const currentRow: Node[] = [];
      for (let col = 0; col < this.cols; col++) {
        currentRow.push(new Node(row, col));
      }
      this.nodes.push(currentRow);
    }
  }

  getNode(row: number, col: number): Node | null {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return this.nodes[row][col];
    }
    return null;
  }

  getNeighbors(node: Node): Node[] {
    const neighbors: Node[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    
    for (const [dRow, dCol] of directions) {
      const newRow = node.row + dRow;
      const newCol = node.col + dCol;
      const neighbor = this.getNode(newRow, newCol);
      
      if (neighbor && !neighbor.isWall) {
        neighbors.push(neighbor);
      }
    }
    
    return neighbors;
  }

  clearPath() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.nodes[row][col].reset();
      }
    }
  }

  clearGrid() {
    this.initialize();
    this.startNode = null;
    this.endNode = null;
  }

  handleCellClick(row: number, col: number, mode: string) {
    const node = this.getNode(row, col);
    if (!node) return;

    switch (mode) {
      case 'start':
        if (this.startNode) {
          this.startNode.isStart = false;
        }
        if (!node.isWall && !node.isEnd) {
          node.isStart = true;
          this.startNode = node;
        }
        break;
      case 'end':
        if (this.endNode) {
          this.endNode.isEnd = false;
        }
        if (!node.isWall && !node.isStart) {
          node.isEnd = true;
          this.endNode = node;
        }
        break;
      case 'wall':
        if (!node.isStart && !node.isEnd) {
          node.isWall = !node.isWall;
        }
        break;
    }
  }
}

export class DijkstraAlgorithm {
  grid: Grid;
  isRunning: boolean = false;
  speed: number = 50;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  setSpeed(speed: string) {
    const speeds: Record<string, number> = {
      'fast': 10,
      'medium': 50,
      'slow': 150
    };
    this.speed = speeds[speed] || 50;
  }

  async findPath(
    onUpdate: (node: Node, type: 'exploring' | 'path') => void,
    onStats: (explored: number, pathLength: number, time: number) => void,
    onStatus: (status: string) => void
  ): Promise<boolean> {
    if (this.isRunning) return false;
    if (!this.grid.startNode || !this.grid.endNode) {
      onStatus('Please set both start and end points!');
      return false;
    }

    this.isRunning = true;
    const startTime = performance.now();
    this.grid.clearPath();

    const unvisited = new Set<Node>();
    let exploredCount = 0;

    // Initialize all nodes
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {
        const node = this.grid.nodes[row][col];
        if (!node.isWall) {
          unvisited.add(node);
        }
      }
    }

    this.grid.startNode.distance = 0;
    onStatus('Searching for path...');

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let currentNode: Node | null = null;
      let minDistance = Infinity;
      
      for (const node of Array.from(unvisited)) {
        if (node.distance < minDistance) {
          minDistance = node.distance;
          currentNode = node;
        }
      }

      if (!currentNode || currentNode.distance === Infinity) {
        // No path found
        break;
      }

      unvisited.delete(currentNode);
      currentNode.isVisited = true;
      exploredCount++;

      if (currentNode === this.grid.endNode) {
        // Path found
        await this.reconstructPath(currentNode, onUpdate);
        const endTime = performance.now();
        onStats(exploredCount, this.getPathLength(currentNode), Math.round(endTime - startTime));
        onStatus('Path found!');
        this.isRunning = false;
        return true;
      }

      // Visual update
      if (currentNode !== this.grid.startNode && currentNode !== this.grid.endNode) {
        onUpdate(currentNode, 'exploring');
        await this.delay(this.speed);
      }

      const neighbors = this.grid.getNeighbors(currentNode);
      
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor)) continue;

        const tentativeDistance = currentNode.distance + 1;

        if (tentativeDistance < neighbor.distance) {
          neighbor.distance = tentativeDistance;
          neighbor.parent = currentNode;
        }
      }

      onStats(exploredCount, 0, Math.round(performance.now() - startTime));
    }

    // No path found
    const endTime = performance.now();
    onStats(exploredCount, 0, Math.round(endTime - startTime));
    onStatus('No path found!');
    this.isRunning = false;
    return false;
  }

  private async reconstructPath(endNode: Node, onUpdate: (node: Node, type: 'path') => void) {
    const path: Node[] = [];
    let currentNode: Node | null = endNode;

    while (currentNode !== null) {
      path.unshift(currentNode);
      currentNode = currentNode.parent;
    }

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      if (node !== this.grid.startNode && node !== this.grid.endNode) {
        node.isPath = true;
        onUpdate(node, 'path');
        await this.delay(this.speed * 2);
      }
    }
  }

  private getPathLength(endNode: Node): number {
    let length = 0;
    let currentNode: Node | null = endNode;

    while (currentNode !== null) {
      length++;
      currentNode = currentNode.parent;
    }

    return length - 1; // Exclude start node
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
