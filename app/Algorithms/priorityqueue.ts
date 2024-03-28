class PriorityQueue<T> {
    heap: [number, T][]; 
    itemToIndex: Map<T, number>; // map to track item indices in the heap
  
    constructor() {
      this.heap = [];
      this.itemToIndex = new Map();
    }
  
    enqueue(distance: number, item: T) {
      this.heap.push([distance, item]);
      const index = this.heap.length - 1;
      this.itemToIndex.set(item, index);
      this.bubbleUp(index);
    }
  
    bubbleUp(index: number) {
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (this.heap[parentIndex][0] <= this.heap[index][0]) break;
        this.swap(parentIndex, index);
        index = parentIndex;
      }
    }
  
    dequeue(): [number, T] | undefined {
      if (this.heap.length === 0) return undefined;
      const min = this.heap[0];
      const last = this.heap.pop()!;
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.itemToIndex.set(last[1], 0);
        this.bubbleDown(0);
      }
      this.itemToIndex.delete(min[1]);
      return min;
    }
  
    bubbleDown(index: number) {
      const length = this.heap.length;
      const element = this.heap[index];
      while (true) {
        let leftChildIndex = 2 * index + 1;
        let rightChildIndex = 2 * index + 2;
        let leftChild, rightChild;
        let swapIndex = null;
  
        if (leftChildIndex < length) {
          leftChild = this.heap[leftChildIndex];
          if (leftChild[0] < element[0]) {
            swapIndex = leftChildIndex;
          }
        }
  
        if (rightChildIndex < length) {
          rightChild = this.heap[rightChildIndex];
          if (
            (swapIndex === null && rightChild[0] < element[0]) ||
            (swapIndex !== null && rightChild[0] < leftChild![0])
          ) {
            swapIndex = rightChildIndex;
          }
        }
  
        if (swapIndex === null) break;
  
        this.swap(index, swapIndex);
        index = swapIndex;
      }
    }
  
    updateKey(item: T, newDistance: number) {
      const index = this.itemToIndex.get(item);
      if (index !== undefined && newDistance < this.heap[index][0]) {
        this.heap[index][0] = newDistance;
        this.bubbleUp(index);
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
  
export default PriorityQueue