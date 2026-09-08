export type Lot = {
  id: string;
  name: string;
  x: number;
  y: number;
  total: number;
  free: number;
  ev: number;
  price: number;
  power: number;
  kwhPrice: number;
};

export const lots: Lot[] = [
  { id: "l1", name: "Grid Central Tower", x: 32, y: 28, total: 120, free: 24, ev: 8, price: 9, power: 50, kwhPrice: 1.8 },
  { id: "l2", name: "Setor Vetorial 7", x: 68, y: 36, total: 80, free: 12, ev: 4, price: 8, power: 22, kwhPrice: 1.6 },
  { id: "l3", name: "Hub Voltz Norte", x: 46, y: 68, total: 60, free: 31, ev: 16, price: 12, power: 120, kwhPrice: 2.1 },
  { id: "l4", name: "Neon Plaza Sul", x: 76, y: 74, total: 150, free: 0, ev: 10, price: 7.5, power: 60, kwhPrice: 1.9 },
  { id: "l5", name: "Docas Cyan", x: 22, y: 60, total: 45, free: 9, ev: 0, price: 6, power: 0, kwhPrice: 0 },
];
