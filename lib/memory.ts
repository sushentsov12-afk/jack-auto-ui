type Item = {
  symptom: string;
  diagnosis: string;
  time: number;
};

let memory: Item[] = [];

export function addMemory(item: Item) {
  memory.push(item);
  if (memory.length > 50) memory.shift();
}

export function getMemory() {
  return memory;
}
