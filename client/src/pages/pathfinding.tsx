import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Trash2, Eraser } from 'lucide-react';
import { Grid, DijkstraAlgorithm, Node } from '@/lib/pathfinding';

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Grid>(() => new Grid(10, 10));
  const [algorithm] = useState<DijkstraAlgorithm>(() => new DijkstraAlgorithm(grid));
  const [mode, setMode] = useState<'wall' | 'start' | 'end'>('wall');
  const [speed, setSpeed] = useState<string>('medium');
  const [status, setStatus] = useState<string>('Ready to start');
  const [stats, setStats] = useState({
    nodesExplored: 0,
    pathLength: 0,
    executionTime: 0
  });
  const [gridVersion, setGridVersion] = useState(0);

  // Initialize grid with default start/end points and some walls
  useEffect(() => {
    const startNode = grid.getNode(2, 2);
    const endNode = grid.getNode(7, 7);
    
    if (startNode && endNode) {
      startNode.isStart = true;
      endNode.isEnd = true;
      grid.startNode = startNode;
      grid.endNode = endNode;
    }

    // Add some example walls
    const wallPositions = [[3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [6, 5]];
    wallPositions.forEach(([row, col]) => {
      const node = grid.getNode(row, col);
      if (node) {
        node.isWall = true;
      }
    });
    
    setGridVersion(prev => prev + 1);
  }, []);

  const handleCellClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (event.button === 0) { // Left click - place walls
      grid.handleCellClick(row, col, 'wall');
    } else if (event.button === 2) { // Right click - cycle between start/end
      const node = grid.getNode(row, col);
      if (node && !node.isWall) {
        if (!grid.startNode) {
          grid.handleCellClick(row, col, 'start');
        } else if (!grid.endNode) {
          grid.handleCellClick(row, col, 'end');
        } else if (node.isStart) {
          grid.handleCellClick(row, col, 'end');
        } else if (node.isEnd) {
          grid.handleCellClick(row, col, 'start');
        } else {
          grid.handleCellClick(row, col, 'start');
        }
      }
    }
    
    setGridVersion(prev => prev + 1);
  }, [grid]);

  const handleFindPath = useCallback(async () => {
    algorithm.setSpeed(speed);
    
    const onUpdate = (node: Node, type: 'exploring' | 'path') => {
      setGridVersion(prev => prev + 1);
    };

    const onStats = (explored: number, pathLength: number, time: number) => {
      setStats({
        nodesExplored: explored,
        pathLength,
        executionTime: time
      });
    };

    const onStatus = (newStatus: string) => {
      setStatus(newStatus);
    };

    await algorithm.findPath(onUpdate, onStats, onStatus);
  }, [algorithm, speed]);

  const handleClearGrid = useCallback(() => {
    grid.clearGrid();
    setStats({ nodesExplored: 0, pathLength: 0, executionTime: 0 });
    setStatus('Ready to start');
    setGridVersion(prev => prev + 1);
  }, [grid]);

  const handleClearPath = useCallback(() => {
    grid.clearPath();
    setStats({ nodesExplored: 0, pathLength: 0, executionTime: 0 });
    setStatus('Ready to start');
    setGridVersion(prev => prev + 1);
  }, [grid]);

  const getCellClassName = (node: Node) => {
    let className = 'grid-cell w-8 h-8 border border-gray-400 cursor-pointer flex items-center justify-center text-xs font-bold';
    
    if (node.isStart) {
      className += ' text-white';
      className += ' bg-blue-600'; // primary color
    } else if (node.isEnd) {
      className += ' bg-red-500 text-white';
    } else if (node.isWall) {
      className += ' bg-gray-600'; // secondary color
    } else if (node.isPath) {
      className += ' bg-green-500 animate-path'; // success color
    } else if (node.isVisited) {
      className += ' bg-blue-500'; // info color
    } else {
      className += ' hover:bg-gray-100';
      className += ' bg-gray-50'; // surface color
    }
    
    return className;
  };

  const getCellContent = (node: Node) => {
    if (node.isStart) {
      return <Play className="w-3 h-3" />;
    } else if (node.isEnd) {
      return '🏁';
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pathfinding Algorithm Visualizer</h1>
        <p className="text-gray-600">Interactive visualization of Dijkstra's pathfinding algorithm</p>
      </div>

      {/* Controls Panel */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Algorithm Controls */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleFindPath}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium shadow-lg"
                disabled={algorithm.isRunning}
              >
                <Play className="w-4 h-4 mr-2" />
                Find Path
              </Button>
              <Button 
                onClick={handleClearGrid}
                variant="secondary"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Grid
              </Button>
              <Button 
                onClick={handleClearPath}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 font-medium"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Clear Path
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Speed:</label>
              <Select value={speed} onValueChange={setSpeed}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interaction Instructions */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Interaction:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-blue-100 px-2 py-1 rounded">Left Click: Place/Remove Walls</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-green-100 px-2 py-1 rounded">Right Click: Set Start/End Points</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
              <span>Empty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>End</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Explored</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Path</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Container */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Grid Visualization</h3>
            <div className="text-sm text-gray-600">
              <span>{status}</span>
            </div>
          </div>
          
          <div className="inline-block bg-gray-200 p-2 rounded-lg">
            <div className="grid grid-cols-10 gap-1" key={gridVersion}>
              {grid.nodes.map((row, rowIndex) =>
                row.map((node, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClassName(node)}
                    onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                    onContextMenu={(e) => handleCellClick(rowIndex, colIndex, e)}
                  >
                    {getCellContent(node)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Algorithm Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.nodesExplored}</div>
              <div className="text-sm text-gray-600">Nodes Explored</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.pathLength}</div>
              <div className="text-sm text-gray-600">Path Length</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{stats.executionTime}</div>
              <div className="text-sm text-gray-600">Time (ms)</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">Dijkstra</div>
              <div className="text-sm text-gray-600">Algorithm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">How to Use:</h4>
        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
          <li>Right-click any empty cell to set the starting point (blue with play icon)</li>
          <li>Right-click another empty cell to set the destination (red with flag)</li>
          <li>Left-click cells to place or remove walls (gray blocks)</li>
          <li>Click "Find Path" to visualize Dijkstra's algorithm in action</li>
          <li>Use "Clear Path" to reset visualization or "Clear Grid" for a fresh start</li>
        </ol>
      </div>
    </div>
  );
}
