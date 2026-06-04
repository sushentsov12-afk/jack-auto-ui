type Item = {
  symptom: string;
  diagnosis: string;
  time: number;
};

const memory: Item[] = [];

export function addMemory(item: Item) {
  memory.push(item);
  if (memory.length > 20) memory.shift();
}

export function getMemory() {
  return memory;
}
type Item = {
  symptom: string;
  diagnosis: string;
  time: number;
};

const memory: Item[] = [];

export function addMemory(item: Item) {
  memory.push(item);
  if (memory.length > 20) memory.shift();
}

export function getMemory() {
  return memory;
}
