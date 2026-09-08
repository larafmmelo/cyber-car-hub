import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Fuel, MapPin } from "lucide-react";
import { Panel, SectionTitle, NeonButton, Field, Badge, Stat } from "@/components/ui-kit";
import { brl, useStats, useStore } from "@/lib/store";

export const Route = createFileRoute("/combustivel")({
  head: () => ({
    meta: [
      { title: "Combustível — CyberDrive" },
      {
        name: "description",
        content: "Compare preços entre postos da região e registre abastecimentos com autonomia automática.",
      },
      { property: "og:title", content: "Combustível — CyberDrive" },
      { property: "og:description", content: "Comparativo de postos e registro de abastecimento." },
    ],
  }),
  component: FuelPage,
});

const stations = [
  { name: "Posto Neon Shell", dist: 1.2, gas: 5.79, ethanol: 3.99, diesel: 6.19 },
  { name: "Ipiranga Cyber", dist: 2.4, gas: 5.89, ethanol: 4.09, diesel: 6.05 },
  { name: "Vetor Petro 24h", dist: 3.1, gas: 5.69, ethanol: 3.89, diesel: 6.29 },
  { name: "Grid Fuel Norte", dist: 4.6, gas: 5.95, ethanol: 4.19, diesel: 6.11 },
];

function FuelPage() {
  const { state, setState } = useStore();
  const s = useStats();
  const cheapest = Math.min(...stations.map((st) => st.gas));

  const [form, setForm] = useState({
    station: stations[0].name,
    date: new Date().toISOString().slice(0, 10),
    liters: "",
    total: "",
  });

  const liters = Number(form.liters) || 0;
  const total = Number(form.total) || 0;
  const autonomy = liters * state.vehicle.kmPerLiter;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!liters || !total) {
      toast.error("Informe litros e valor total.");
      return;
    }
    setState((prev) => ({
      ...prev,
      fuelings: [
        { id: crypto.randomUUID(), station: form.station, date: form.date, liters, total },
        ...prev.fuelings,
      ],
    }));
    toast.success(`Abastecimento registrado · autonomia +${autonomy.toFixed(0)} km`);
    setForm({ ...form, liters: "", total: "" });
  }

  return (
    <div>
      <SectionTitle title="Módulo de Combustível" subtitle="Comparação de postos e registro de abastecimento" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Preço médio pago" value={brl(s.avgPrice)} hint="por litro" />
        <Stat label="Total abastecido" value={`${s.liters.toFixed(1)} L`} hint={brl(s.fuelSpend)} />
        <Stat label="Autonomia atual" value={`${s.fuelRange.toFixed(0)} km`} hint={`${state.vehicle.fuelLevel}% do tanque`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <MapPin className="size-4 text-neon" /> Postos da região
          </h3>
          <div className="space-y-3">
            {stations.map((st) => (
              <div
                key={st.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">
                    {st.name}{" "}
                    {st.gas === cheapest ? <Badge tone="pink">Melhor preço</Badge> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{st.dist} km de distância</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <Price label="Gasolina" value={st.gas} highlight={st.gas === cheapest} />
                  <Price label="Etanol" value={st.ethanol} />
                  <Price label="Diesel" value={st.diesel} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2" glow="pink">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Fuel className="size-4 text-primary" /> Registrar abastecimento
          </h3>
          <form className="space-y-3" onSubmit={submit}>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Posto
              </span>
              <select
                value={form.station}
                onChange={(e) => setForm({ ...form, station: e.target.value })}
                className="w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm outline-none focus:border-ring"
              >
                {stations.map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Litros"
                type="number"
                step="0.01"
                placeholder="30"
                value={form.liters}
                onChange={(e) => setForm({ ...form, liters: e.target.value })}
              />
              <Field
                label="Valor total"
                type="number"
                step="0.01"
                placeholder="180,00"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
              />
            </div>
            <div className="rounded-xl border border-border bg-background/30 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Autonomia média calculada
              </p>
              <p className="font-display text-xl font-bold neon-text">{autonomy.toFixed(0)} km</p>
              <p className="text-xs text-muted-foreground">
                {liters > 0 ? `${brl(total / liters)} por litro` : "Preencha litros e valor"}
              </p>
            </div>
            <NeonButton type="submit" className="w-full">
              Registrar
            </NeonButton>
          </form>
        </Panel>
      </div>

      <Panel className="mt-4">
        <h3 className="mb-4 text-lg font-bold">Histórico de abastecimentos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2">Posto</th>
                <th className="pb-2">Data</th>
                <th className="pb-2">Litros</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">R$/L</th>
              </tr>
            </thead>
            <tbody>
              {state.fuelings.map((f) => (
                <tr key={f.id} className="border-t border-border">
                  <td className="py-2 font-semibold">{f.station}</td>
                  <td className="py-2 text-muted-foreground">{f.date}</td>
                  <td className="py-2">{f.liters.toFixed(2)} L</td>
                  <td className="py-2">{brl(f.total)}</td>
                  <td className="py-2 text-neon">{brl(f.total / f.liters)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Price({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={highlight ? "font-display font-bold neon-text" : "font-display font-bold"}>
        {brl(value)}
      </p>
    </div>
  );
}
