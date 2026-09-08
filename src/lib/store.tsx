import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Fueling = {
  id: string;
  station: string;
  date: string;
  liters: number;
  total: number;
  odometer?: number;
};

export type ParkingSession = {
  id: string;
  place: string;
  date: string;
  hours: number;
  cost: number;
};

export type ChargeSession = {
  id: string;
  place: string;
  date: string;
  minutes: number;
  kwh: number;
  cost: number;
};

export type Vehicle = {
  name: string;
  plate: string;
  tank: number;
  battery: number;
  kmPerLiter: number;
  kmPerKwh: number;
  fuelLevel: number;
  batteryLevel: number;
};

type State = {
  vehicle: Vehicle;
  fuelings: Fueling[];
  parkings: ParkingSession[];
  charges: ChargeSession[];
};

const defaultState: State = {
  vehicle: {
    name: "Nexus EV-X",
    plate: "NEO-2077",
    tank: 48,
    battery: 60,
    kmPerLiter: 13.4,
    kmPerKwh: 6.2,
    fuelLevel: 62,
    batteryLevel: 74,
  },
  fuelings: [
    { id: "f1", station: "Posto Neon Shell", date: "2026-08-20", liters: 32.4, total: 191.9 },
    { id: "f2", station: "Ipiranga Cyber", date: "2026-08-31", liters: 28.1, total: 165.8 },
  ],
  parkings: [
    { id: "p1", place: "Grid Central Tower", date: "2026-09-01", hours: 3, cost: 27 },
    { id: "p2", place: "Setor Vetorial 7", date: "2026-09-04", hours: 1.5, cost: 12 },
  ],
  charges: [
    { id: "c1", place: "Hub Voltz Norte", date: "2026-09-02", minutes: 42, kwh: 21.5, cost: 38.7 },
  ],
};

const KEY = "cyberdrive-state-v1";

const Ctx = createContext<{
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(defaultState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const value = useMemo(() => ({ state, setState }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useStats() {
  const { state } = useStore();
  const { fuelings, parkings, charges, vehicle } = state;

  const liters = fuelings.reduce((s, f) => s + f.liters, 0);
  const fuelSpend = fuelings.reduce((s, f) => s + f.total, 0);
  const avgPrice = liters > 0 ? fuelSpend / liters : 0;
  const parkingSpend = parkings.reduce((s, p) => s + p.cost, 0);
  const chargeSpend = charges.reduce((s, c) => s + c.cost, 0);
  const estimatedKm = liters * vehicle.kmPerLiter;
  const costPerKm = estimatedKm > 0 ? fuelSpend / estimatedKm : 0;

  const fuelRange = (vehicle.tank * vehicle.fuelLevel) / 100 * vehicle.kmPerLiter;
  const evRange = (vehicle.battery * vehicle.batteryLevel) / 100 * vehicle.kmPerKwh;

  return {
    liters,
    fuelSpend,
    avgPrice,
    parkingSpend,
    chargeSpend,
    totalSpend: fuelSpend + parkingSpend + chargeSpend,
    estimatedKm,
    costPerKm,
    fuelRange,
    evRange,
    consumption: vehicle.kmPerLiter,
  };
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
