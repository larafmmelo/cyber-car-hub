import { createFileRoute, Link } from "@tanstack/react-router";
import { Fuel, Zap, SquareParking, TrendingUp } from "lucide-react";
import { Panel, SectionTitle, Stat, Bar, Badge } from "@/components/ui-kit";
import { brl, useStats, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CyberDrive" },
      {
        name: "description",
        content: "Média de consumo, gastos mensais e status do veículo em um painel futurista.",
      },
      { property: "og:title", content: "Dashboard — CyberDrive" },
      {
        property: "og:description",
        content: "Consumo, gastos e autonomia do seu veículo em tempo real.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useStore();
  const s = useStats();
  const v = state.vehicle;

  return (
    <div>
      <SectionTitle
        title="Dashboard Geral"
        subtitle={`${v.name} · Placa ${v.plate} · sistema de mobilidade online`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Consumo médio" value={`${s.consumption.toFixed(1)} km/l`} hint="Base cadastrada" />
        <Stat label="Gasto no mês" value={brl(s.totalSpend)} hint="Combustível + vagas + recarga" />
        <Stat label="Preço médio do litro" value={brl(s.avgPrice)} hint={`${s.liters.toFixed(1)} L abastecidos`} />
        <Stat label="Custo por km" value={brl(s.costPerKm)} hint={`${s.estimatedKm.toFixed(0)} km estimados`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold">Status do veículo</h3>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Fuel className="size-4 text-primary" /> Tanque {v.fuelLevel}%
                </span>
                <span className="text-muted-foreground">{s.fuelRange.toFixed(0)} km de autonomia</span>
              </div>
              <Bar value={v.fuelLevel} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Zap className="size-4 text-neon" /> Bateria {v.batteryLevel}%
                </span>
                <span className="text-muted-foreground">{s.evRange.toFixed(0)} km de autonomia</span>
              </div>
              <Bar value={v.batteryLevel} tone="pink" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm sm:grid-cols-4">
              <Info label="Tanque" value={`${v.tank} L`} />
              <Info label="Bateria" value={`${v.battery} kWh`} />
              <Info label="Eficiência EV" value={`${v.kmPerKwh} km/kWh`} />
              <Info label="Registros" value={`${state.fuelings.length} abast.`} />
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-lg font-bold">Distribuição de gastos</h3>
          <div className="space-y-4 text-sm">
            <Split icon={<Fuel className="size-4 text-primary" />} label="Combustível" value={s.fuelSpend} total={s.totalSpend} />
            <Split icon={<SquareParking className="size-4 text-cyan" />} label="Estacionamento" value={s.parkingSpend} total={s.totalSpend} />
            <Split icon={<Zap className="size-4 text-neon" />} label="Recarga EV" value={s.chargeSpend} total={s.totalSpend} />
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <QuickLink to="/combustivel" title="Comparar postos" desc="Preços da região em tempo real" />
        <QuickLink to="/estacionamento" title="Radar de vagas" desc="Grid vetorial e reservas" />
        <QuickLink to="/viagens" title="Planejar viagem" desc="Rota com autonomia estimada" />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/30 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display font-bold">{value}</p>
    </div>
  );
}

function Split({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span className="font-semibold">{brl(value)}</span>
      </div>
      <Bar value={pct} tone={label === "Combustível" ? "purple" : "pink"} />
    </div>
  );
}

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="glass block p-5 transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">{title}</h3>
        <TrendingUp className="size-4 text-neon" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-3">
        <Badge tone="pink">Acessar</Badge>
      </div>
    </Link>
  );
}
