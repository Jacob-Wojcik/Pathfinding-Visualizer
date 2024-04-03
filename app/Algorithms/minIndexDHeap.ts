class MinIndexedDHeap<T> {
    heap: [number, T][]; 
    itemToIndex: Map<T, number>; // map to track item indices in the heap
    d: number; // degree of the D-heap

    constructor(d: number) {
      this.heap = [];
      this.itemToIndex = new Map();
      this.d = d
    }
  
    enqueue(distance: number, item: T) {
      this.heap.push([distance, item]);
      const index = this.heap.length - 1;
      this.itemToIndex.set(item, index);
      this.swim(index);
    }

    getChildrenPositions(parentIndex: number) : number[] {
      const indices = [];
      for (let i = 1; i <= this.d; i++) {
        indices.push(parentIndex * this.d + i);
      }
      return indices
    }

    getParentPosition(childIndex: number): number {
      return Math.floor((childIndex - 1) / this.d);
    }
  
    swim(k: number) {
      while (k > 0) {
        const parentIndex = this.getParentPosition(k)
        if (this.heap[parentIndex][0] <= this.heap[k][0]) break;
        this.swap(parentIndex, k);
        k = parentIndex;
      }
    }
  
    dequeue(): [number, T] | undefined {
      if (this.heap.length === 0) return undefined;
      const min = this.heap[0];
      const last = this.heap.pop()!;
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.itemToIndex.set(last[1], 0);
        this.sink(0);
      }
      this.itemToIndex.delete(min[1]);
      return min;
    }
  
    sink(k: number) {
      const element = this.heap[k];
      while (true) {
        let childIndices = this.getChildrenPositions(k)
    
        let swapIndex = null;
        let minValue = element[0];
    
        for (const index of childIndices) {
          const child = this.heap[index];
          if (child[0] < minValue) {
            minValue = child[0];
            swapIndex = index;
          }
        }
    
        if (swapIndex === null) break;
    
        this.swap(k, swapIndex);
        k = swapIndex;
      }
    }    
  
    updateKey(item: T, newDistance: number) {
      const index = this.itemToIndex.get(item);
      if (index !== undefined && newDistance < this.heap[index][0]) {
        this.heap[index][0] = newDistance;
        this.swim(index);
      }
    }
  
    swap(i: number, j: number) {
      [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
      this.itemToIndex.set(this.heap[i][1], i);
      this.itemToIndex.set(this.heap[j][1], j);
    }
  
    isEmpty() {
      return this.heap.length === 0;
    }
  }
  
export default MinIndexedDHeap