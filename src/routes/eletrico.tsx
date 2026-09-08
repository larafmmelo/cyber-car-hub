import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BatteryCharging, Filter, Zap } from "lucide-react";
import { Panel, SectionTitle, NeonButton, Badge, Stat, Bar } from "@/components/ui-kit";
import { brl, useStore } from "@/lib/store";
import { lots } from "@/lib/lots";

export const Route = createFileRoute("/eletrico")({
  head: () => ({
    meta: [
      { title: "Mobilidade Elétrica — CyberDrive" },
      {
        name: "description",
        content: "Encontre vagas com carregador ativo e monitore a recarga em tempo real.",
      },
      { property: "og:title", content: "Mobilidade Elétrica — CyberDrive" },
      { property: "og:description", content: "Recarga monitorada em tempo real com custo acumulado." },
    ],
  }),
  component: EvPage,
});

function EvPage() {
  const { state, setState } = useStore();
  const [onlyFast, setOnlyFast] = useState(false);
  const evLots = lots.filter((l) => l.ev > 0 && (!onlyFast || l.power >= 50));
  const [selected, setSelected] = useState(evLots[0]?.id ?? lots[0].id);
  const lot = lots.find((l) => l.id === selected) ?? lots[0];

  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [battery, setBattery] = useState(state.vehicle.batteryLevel);
  const startBattery = useRef(state.vehicle.batteryLevel);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
      setBattery((b) => Math.min(100, b + (lot.power / 60) * 0.05));
    }, 1000);
    return () => clearInterval(id);
  }, [running, lot.power]);

  const kwh = ((battery - startBattery.current) / 100) * state.vehicle.battery;
  const cost = Math.max(0, kwh) * lot.kwhPrice;

  function finish() {
    if (seconds === 0) {
      toast.error("Nenhuma recarga em andamento.");
      return;
    }
    setRunning(false);
    setState((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, batteryLevel: Math.round(battery) },
      charges: [
        {
          id: crypto.randomUUID(),
          place: lot.name,
          date: new Date().toISOString().slice(0, 16).replace("T", " "),
          minutes: Math.max(1, Math.round(seconds / 60)),
          kwh: Number(Math.max(0, kwh).toFixed(2)),
          cost: Number(cost.toFixed(2)),
        },
        ...prev.charges,
      ],
    }));
    toast.success(`Recarga finalizada · ${brl(cost)}`);
    setSeconds(0);
    startBattery.current = battery;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      <SectionTitle title="Mobilidade Elétrica" subtitle="Vagas com carregamento ativo e monitoramento de recarga" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pontos ativos" value={`${lots.reduce((s, l) => s + l.ev, 0)}`} hint="na malha monitorada" />
        <Stat label="Bateria atual" value={`${battery.toFixed(0)}%`} hint={`${state.vehicle.battery} kWh totais`} />
        <Stat
          label="Gasto em recargas"
          value={brl(state.charges.reduce((s, c) => s + c.cost, 0))}
          hint={`${state.charges.length} sessões`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Filter className="size-4 text-cyan" /> Vagas com recarga
            </h3>
            <button
              onClick={() => setOnlyFast((v) => !v)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
                onlyFast ? "border-ring bg-neon/20" : "border-border bg-background/40"
              }`}
            >
              Só rápidas
            </button>
          </div>
          <div className="space-y-2">
            {evLots.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelected(l.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                  l.id === selected ? "border-ring bg-accent" : "border-border bg-background/30"
                }`}
              >
                <span>
                  <span className="font-semibold">{l.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {l.ev} pontos · {l.power} kW
                  </span>
                </span>
                <span className="font-display font-bold neon-text">{brl(l.kwhPrice)}/kWh</span>
              </button>
            ))}
            {evLots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma vaga com esse filtro.</p>
            ) : null}
          </div>
        </Panel>

        <Panel className="lg:col-span-3" glow="pink">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <BatteryCharging className="size-4 text-neon" /> Monitor de recarga
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Tempo" value={`${mm}:${ss}`} />
            <Metric label="Energia" value={`${Math.max(0, kwh).toFixed(2)} kWh`} />
            <Metric label="Acumulado" value={brl(cost)} />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Zap className="size-4 text-neon" /> Bateria
              </span>
              <span>{battery.toFixed(1)}%</span>
            </div>
            <Bar value={battery} tone="pink" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge>{lot.name}</Badge>
            <Badge tone="cyan">{lot.power} kW</Badge>
            <div className="ml-auto flex gap-2">
              <NeonButton variant="ghost" onClick={() => setRunning((r) => !r)}>
                {running ? "Pausar" : "Iniciar recarga"}
              </NeonButton>
              <NeonButton onClick={finish}>Finalizar</NeonButton>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <h3 className="mb-4 text-lg font-bold">Histórico de recargas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2">Local</th>
                <th className="pb-2">Data</th>
                <th className="pb-2">Duração</th>
                <th className="pb-2">Energia</th>
                <th className="pb-2">Custo final</th>
              </tr>
            </thead>
            <tbody>
              {state.charges.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="py-2 font-semibold">{c.place}</td>
                  <td className="py-2 text-muted-foreground">{c.date}</td>
                  <td className="py-2">{c.minutes} min</td>
                  <td className="py-2">{c.kwh} kWh</td>
                  <td className="py-2 text-neon">{brl(c.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold neon-text">{value}</p>
    </div>
  );
}
