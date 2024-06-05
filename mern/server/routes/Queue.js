class Queue {
    constructor() {
      this.queue = [];
      this.running = false;
    }
  
    enqueue(task) {
      this.queue.push(task);
      this.runNext();
    }
  
    async runNext() {
      if (this.running || this.queue.length === 0) {
        return;
      }
      this.running = true;
      const task = this.queue.shift();
      try {
        await task();
      } catch (error) {
        console.error('Error running task:', error);
      }
      this.running = false;
      this.runNext();
    }
  }
  
  module.exports = Queue;
  