import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navigation, Fuel, Zap } from "lucide-react";
import { Panel, SectionTitle, NeonButton, Field, Badge, Stat } from "@/components/ui-kit";
import { brl, useStats, useStore } from "@/lib/store";
import { lots } from "@/lib/lots";

export const Route = createFileRoute("/viagens")({
  head: () => ({
    meta: [
      { title: "Planejador de Viagens — CyberDrive" },
      {
        name: "description",
        content: "Trace rotas com estações de carga e estacionamentos e calcule a autonomia restante.",
      },
      { property: "og:title", content: "Planejador de Viagens — CyberDrive" },
      { property: "og:description", content: "Rota com pontos de apoio e autonomia estimada." },
    ],
  }),
  component: TripPage,
});

export default function noop() {}

function TripPage() {
  const { state } = useStore();
  const s = useStats();
  const [origin, setOrigin] = useState("Setor Central");
  const [destination, setDestination] = useState("Distrito Neon Sul");
  const [distance, setDistance] = useState("180");
  const [mode, setMode] = useState<"fuel" | "ev">("fuel");

  const km = Number(distance) || 0;
  const range = mode === "fuel" ? s.fuelRange : s.evRange;
  const remaining = range - km;
  const avgSpeed = 62;
  const hours = km / avgSpeed;
  const costPerKm =
    mode === "fuel"
      ? s.costPerKm || s.avgPrice / state.vehicle.kmPerLiter
      : 1.9 / state.vehicle.kmPerKwh;

  const stops = lots
    .filter((l) => (mode === "ev" ? l.ev > 0 : true))
    .slice(0, 4)
    .map((l, i) => ({ ...l, at: Math.round(((i + 1) / 5) * km) }));

  return (
    <div>
      <SectionTitle title="Planejador de Viagens" subtitle="Rota, pontos de apoio e autonomia estimada" />

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Navigation className="size-4 text-cyan" /> Rota
          </h3>
          <div className="space-y-3">
            <Field label="Origem" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            <Field
              label="Destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <Field
              label="Distância (km)"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
            <div className="flex gap-2">
              <NeonButton
                variant={mode === "fuel" ? "primary" : "ghost"}
                className="flex-1"
                onClick={() => setMode("fuel")}
              >
                <Fuel className="size-4" /> Gasolina
              </NeonButton>
              <NeonButton
                variant={mode === "ev" ? "primary" : "ghost"}
                className="flex-1"
                onClick={() => setMode("ev")}
              >
                <Zap className="size-4" /> Bateria
              </NeonButton>
            </div>
          </div>
        </Panel>

        <div className="space-y-4 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Autonomia atual" value={`${range.toFixed(0)} km`} hint={mode === "fuel" ? "tanque" : "bateria"} />
            <Stat
              label={remaining >= 0 ? "Sobra na chegada" : "Falta de autonomia"}
              value={`${Math.abs(remaining).toFixed(0)} km`}
              hint={remaining >= 0 ? "sem reabastecer" : "planeje uma parada"}
            />
            <Stat label="Custo estimado" value={brl(km * costPerKm)} hint={`${hours.toFixed(1)} h de viagem`} />
          </div>

          <Panel glow={remaining >= 0 ? "purple" : "pink"}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {origin} → {destination}
              </h3>
              <Badge tone={remaining >= 0 ? "purple" : "pink"}>
                {remaining >= 0 ? "Rota viável" : "Requer parada"}
              </Badge>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-2 top-2 bottom-2 w-px bg-[image:var(--gradient-neon)]" />
              <Stop title={origin} sub="Partida · 0 km" />
              {stops.map((st) => (
                <Stop
                  key={st.id}
                  title={st.name}
                  sub={`${st.at} km · ${st.free} vagas · ${st.ev > 0 ? `${st.ev} carregadores ${st.power} kW` : "sem recarga"}`}
                  ok={st.at <= range}
                />
              ))}
              <Stop title={destination} sub={`Chegada · ${km} km`} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stop({ title, sub, ok = true }: { title: string; sub: string; ok?: boolean }) {
  return (
    <div className="relative mb-4 last:mb-0">
      <span
        className={`absolute -left-[18px] top-1.5 size-3 rounded-full border-2 ${
          ok ? "border-neon bg-primary" : "border-destructive bg-background"
        }`}
      />
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
