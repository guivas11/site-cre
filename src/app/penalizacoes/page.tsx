import { createClient } from "@/lib/supabase/server";
import { createPenalty, deletePenalty } from "./actions";

type PageProps = {
  searchParams?: {
    status?: string;
    error?: string;
    success?: string;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export default async function PenalizacoesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = userData.user
    ? await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userData.user.id)
        .maybeSingle()
    : { data: null };

  const isAdmin = Boolean(profile?.is_admin);
  const filterStatus = String(searchParams?.status ?? "").trim().toLowerCase();

  const { data: penaltiesData } = await supabase
    .from("race_penalties")
    .select("id,pilot_name,track,category,reason,penalty_type,status,happened_at,created_at")
    .order("happened_at", { ascending: false })
    .limit(200);

  const penalties = (penaltiesData ?? []).filter((item) => {
    if (!filterStatus) return true;
    return (item.status ?? "").toLowerCase() === filterStatus;
  });

  const messageError = typeof searchParams?.error === "string" ? searchParams.error : "";
  const messageSuccess = typeof searchParams?.success === "string" ? searchParams.success : "";

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-24 pt-6 md:gap-8 md:px-6 md:pt-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Radar</p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">Penalizacoes</h1>
          </div>
          <a
            href="/"
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
          >
            Voltar para home
          </a>
        </header>

        {messageError ? (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{messageError}</p>
        ) : null}
        {messageSuccess ? (
          <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{messageSuccess}</p>
        ) : null}

        <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
          <form action="/penalizacoes" method="get" className="flex flex-wrap items-center gap-3">
            <button className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.25em]" type="submit">
              Todos
            </button>
            <button className="rounded-full border border-yellow-300/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-yellow-200" type="submit" name="status" value="ativo">
              Ativo
            </button>
            <button className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-200" type="submit" name="status" value="resolvido">
              Resolvido
            </button>
          </form>
        </section>

        {isAdmin ? (
          <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Registrar penalizacao</p>
            <form action={createPenalty} className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" name="pilot_name" placeholder="Nome do piloto" required />
              <input className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" name="penalty_type" placeholder="Tipo (drive-through, +5s...)" required />
              <input className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" name="track" placeholder="Pista" />
              <input className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" name="category" placeholder="Categoria" />
              <input className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" type="date" name="happened_at" />
              <select className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" name="status" defaultValue="ativo">
                <option value="ativo">Ativo</option>
                <option value="resolvido">Resolvido</option>
              </select>
              <textarea className="md:col-span-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white" name="reason" placeholder="Motivo da penalizacao" required />
              <div className="md:col-span-2">
                <button className="rounded-2xl border border-red-400/60 bg-red-500/15 px-6 py-3 text-xs uppercase tracking-[0.3em] text-red-100 transition hover:bg-red-500/25" type="submit">
                  Publicar penalizacao
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="grid gap-4">
          {penalties.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">Sem penalizacoes para este filtro.</p>
          ) : (
            penalties.map((item) => (
              <article key={item.id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                  <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1">{item.pilot_name}</span>
                  <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">{item.penalty_type}</span>
                  <span className={`rounded-full px-3 py-1 ${item.status === "resolvido" ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border border-red-400/40 bg-red-500/10 text-red-200"}`}>
                    {item.status}
                  </span>
                  <span>{formatDate(item.happened_at)}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-200">{item.reason}</p>
                {(item.track || item.category) ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {[item.track, item.category].filter(Boolean).join(" | ")}
                  </p>
                ) : null}
                {isAdmin ? (
                  <form className="mt-4" action={deletePenalty}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-full border border-red-400/50 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-red-200 transition hover:border-red-300" type="submit">
                      Remover
                    </button>
                  </form>
                ) : null}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

