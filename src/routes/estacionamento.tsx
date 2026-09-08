import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Radar } from "lucide-react";
import { Panel, SectionTitle, NeonButton, Field, Badge, Stat } from "@/components/ui-kit";
import { brl, useStore } from "@/lib/store";
import { lots } from "@/lib/lots";

export const Route = createFileRoute("/estacionamento")({
  head: () => ({
    meta: [
      { title: "Estacionamento — CyberDrive" },
      {
        name: "description",
        content: "Radar vetorial de estacionamentos, vagas disponíveis, preço por hora e reserva.",
      },
      { property: "og:title", content: "Estacionamento — CyberDrive" },
      { property: "og:description", content: "Mapa em grid, vagas livres e reservas por horário." },
    ],
  }),
  component: ParkingPage,
});

function ParkingPage() {
  const { state, setState } = useStore();
  const [selected, setSelected] = useState(lots[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [hours, setHours] = useState("2");

  const lot = lots.find((l) => l.id === selected)!;
  const cost = (Number(hours) || 0) * lot.price;

  function reserve() {
    if (!Number(hours)) {
      toast.error("Informe a duração da reserva.");
      return;
    }
    setState((prev) => ({
      ...prev,
      parkings: [
        {
          id: crypto.randomUUID(),
          place: lot.name,
          date: `${date} ${time}`,
          hours: Number(hours),
          cost,
        },
        ...prev.parkings,
      ],
    }));
    toast.success(`Vaga reservada em ${lot.name} · ${brl(cost)}`);
  }

  const totalFree = lots.reduce((s, l) => s + l.free, 0);

  return (
    <div>
      <SectionTitle title="Módulo de Estacionamento" subtitle="Radar vetorial, vagas em tempo real e reservas" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Vagas livres na malha" value={`${totalFree}`} hint={`${lots.length} locais monitorados`} />
        <Stat label="Preço médio/hora" value={brl(lots.reduce((s, l) => s + l.price, 0) / lots.length)} />
        <Stat
          label="Gasto com vagas"
          value={brl(state.parkings.reduce((s, p) => s + p.cost, 0))}
          hint={`${state.parkings.length} usos`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Radar className="size-4 text-cyan" /> Grid de estacionamentos
          </h3>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background/50">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i} stroke="oklch(0.6 0.18 305 / 22%)" strokeWidth="0.2">
                  <line x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
                  <line x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} />
                </g>
              ))}
              {[15, 30, 45].map((r) => (
                <circle
                  key={r}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="oklch(0.65 0.28 0.4 / 25%)"
                  strokeWidth="0.3"
                />
              ))}
              <circle cx="50" cy="50" r="1.6" fill="oklch(0.83 0.15 200)" />
              {lots.map((l) => (
                <g
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={l.x}
                    cy={l.y}
                    r={l.id === selected ? 4 : 2.8}
                    fill={l.free > 0 ? "oklch(0.53 0.26 302)" : "oklch(0.4 0.05 300)"}
                    stroke={l.id === selected ? "oklch(0.65 0.28 0.4)" : "transparent"}
                    strokeWidth="0.8"
                  />
                  <text
                    x={l.x}
                    y={l.y - 5}
                    fontSize="3"
                    textAnchor="middle"
                    fill="oklch(0.9 0.02 300)"
                  >
                    {l.free}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Toque em um nó do radar para selecionar o estacionamento. O número indica vagas livres.
          </p>
        </Panel>

        <div className="space-y-4 lg:col-span-2">
          <Panel>
            <h3 className="mb-3 text-lg font-bold">Locais</h3>
            <div className="space-y-2">
              {lots.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    l.id === selected
                      ? "border-ring bg-accent"
                      : "border-border bg-background/30 hover:bg-accent/60"
                  }`}
                >
                  <span>
                    <span className="font-semibold">{l.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {l.free}/{l.total} vagas · {l.ev} c/ recarga
                    </span>
                  </span>
                  <span className="font-display font-bold neon-text">{brl(l.price)}/h</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel glow="pink">
            <h3 className="mb-3 text-lg font-bold">Reservar vaga</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>{lot.name}</Badge>
                <Badge tone="cyan">{lot.free} livres</Badge>
              </div>
              <Field label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                <Field
                  label="Duração (h)"
                  type="number"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Custo estimado: <span className="font-display font-bold neon-text">{brl(cost)}</span>
              </p>
              <NeonButton className="w-full" onClick={reserve} disabled={lot.free === 0}>
                {lot.free === 0 ? "Lotado" : "Reservar vaga"}
              </NeonButton>
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="mt-4">
        <h3 className="mb-4 text-lg font-bold">Histórico de uso</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2">Local</th>
                <th className="pb-2">Data</th>
                <th className="pb-2">Duração</th>
                <th className="pb-2">Custo total</th>
              </tr>
            </thead>
            <tbody>
              {state.parkings.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2 font-semibold">{p.place}</td>
                  <td className="py-2 text-muted-foreground">{p.date}</td>
                  <td className="py-2">{p.hours} h</td>
                  <td className="py-2 text-neon">{brl(p.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
