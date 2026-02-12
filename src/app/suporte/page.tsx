import { createClient } from "@/lib/supabase/server";
import {
  createSupportTicket,
  deleteSupportTicket,
  updateSupportTicketStatus,
} from "./actions";

type TicketRow = {
  id: string;
  subject: string;
  message: string;
  category: string | null;
  priority: string | null;
  status: string | null;
  contact_email: string | null;
  contact_discord: string | null;
  created_at: string | null;
  resolved_at: string | null;
  user_id: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function statusLabel(status?: string | null) {
  if (status === "em_analise") return "Em analise";
  if (status === "resolvido") return "Resolvido";
  return "Aberto";
}

export const dynamic = "force-dynamic";

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const error = params.error;
  const success = params.success;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("is_admin, display_name, username")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const isAdmin = Boolean(profile?.is_admin);

  const { data: myTicketsData } = user
    ? await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const myTickets = (myTicketsData ?? []) as TicketRow[];

  const { data: adminTicketsData } = isAdmin
    ? await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const adminTickets = (adminTicketsData ?? []) as TicketRow[];

  const openCount = myTickets.filter((item) => item.status === "aberto").length;
  const inReviewCount = myTickets.filter(
    (item) => item.status === "em_analise",
  ).length;
  const resolvedCount = myTickets.filter(
    (item) => item.status === "resolvido",
  ).length;

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-8 sm:px-6">
        <header className="glass rounded-3xl border border-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
                Central de suporte
              </p>
              <h1 className="mt-2 font-display text-4xl tracking-[0.12em]">
                Ajuda da plataforma
              </h1>
              <p className="mt-2 text-sm text-zinc-300">
                Abra chamados, acompanhe status e receba retorno da equipe CRE.
              </p>
            </div>
            <a
              href="/"
              className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-yellow-300 hover:text-yellow-100"
            >
              Voltar para home
            </a>
          </div>
        </header>

        {!user ? (
          <section className="glass rounded-3xl border border-white/10 p-6">
            <p className="text-sm text-zinc-300">
              Voce precisa entrar para abrir ou acompanhar chamados.
            </p>
            <a
              href="/login"
              className="mt-4 inline-flex rounded-full bg-yellow-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black"
            >
              Entrar
            </a>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">
                  Abertos
                </p>
                <p className="mt-2 font-display text-3xl tracking-[0.12em]">
                  {openCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">
                  Em analise
                </p>
                <p className="mt-2 font-display text-3xl tracking-[0.12em]">
                  {inReviewCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">
                  Resolvidos
                </p>
                <p className="mt-2 font-display text-3xl tracking-[0.12em]">
                  {resolvedCount}
                </p>
              </div>
            </section>

            {error ? (
              <p className="text-xs uppercase tracking-[0.24em] text-red-300">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">
                {success}
              </p>
            ) : null}

            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="glass rounded-3xl border border-white/10 p-6">
                <h2 className="font-display text-2xl tracking-[0.12em]">
                  Abrir chamado
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Descreva o problema com contexto para agilizar o atendimento.
                </p>

                <form action={createSupportTicket} className="mt-5 space-y-3">
                  <input
                    name="subject"
                    required
                    placeholder="Assunto"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-300/40 focus:outline-none"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      name="category"
                      required
                      defaultValue=""
                      className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-yellow-300/40 focus:outline-none"
                    >
                      <option value="" disabled>
                        Categoria
                      </option>
                      <option value="Conta">Conta</option>
                      <option value="Perfil">Perfil</option>
                      <option value="Posts">Posts</option>
                      <option value="Agenda">Agenda</option>
                      <option value="Comunidade">Comunidade</option>
                      <option value="Bug">Bug</option>
                    </select>
                    <select
                      name="priority"
                      required
                      defaultValue=""
                      className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-yellow-300/40 focus:outline-none"
                    >
                      <option value="" disabled>
                        Prioridade
                      </option>
                      <option value="baixa">Baixa</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="contact_email"
                      placeholder="Email de contato"
                      defaultValue={user.email ?? ""}
                      className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-300/40 focus:outline-none"
                    />
                    <input
                      name="contact_discord"
                      placeholder="Discord (opcional)"
                      className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-300/40 focus:outline-none"
                    />
                  </div>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="Descreva o problema: onde acontece, como reproduzir e impacto."
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-300/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-yellow-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black transition hover:bg-yellow-200"
                  >
                    Enviar chamado
                  </button>
                </form>
              </div>

              <div className="glass rounded-3xl border border-white/10 p-6">
                <h2 className="font-display text-2xl tracking-[0.12em]">
                  Meus chamados
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {profile?.display_name || profile?.username || user.email}
                </p>

                <div className="mt-5 space-y-3">
                  {myTickets.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Nenhum chamado ainda.
                    </p>
                  ) : (
                    myTickets.map((ticket) => (
                      <article
                        key={ticket.id}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">
                            {ticket.subject}
                          </h3>
                          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-zinc-300">
                            {statusLabel(ticket.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-300 line-clamp-3">
                          {ticket.message}
                        </p>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                          {ticket.category || "Categoria"} - {ticket.priority || "Prioridade"} - {formatDate(ticket.created_at)}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>

            {isAdmin ? (
              <section className="glass rounded-3xl border border-white/10 p-6">
                <h2 className="font-display text-2xl tracking-[0.12em]">
                  Painel admin
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Modere chamados e altere status de atendimento.
                </p>

                <div className="mt-5 space-y-3">
                  {adminTickets.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Nenhum chamado no sistema.
                    </p>
                  ) : (
                    adminTickets.map((ticket) => (
                      <article
                        key={ticket.id}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">
                            {ticket.subject}
                          </h3>
                          <span className="text-xs text-zinc-400">
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-300">
                          {ticket.message}
                        </p>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                          user_id: {ticket.user_id} - {ticket.category || "Sem categoria"} - {ticket.priority || "Sem prioridade"}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <form action={updateSupportTicketStatus}>
                            <input type="hidden" name="ticket_id" value={ticket.id} />
                            <select
                              name="status"
                              defaultValue={ticket.status || "aberto"}
                              className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-200 focus:outline-none"
                            >
                              <option value="aberto">Aberto</option>
                              <option value="em_analise">Em analise</option>
                              <option value="resolvido">Resolvido</option>
                            </select>
                            <button
                              type="submit"
                              className="ml-2 rounded-full border border-yellow-300/40 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-yellow-200 transition hover:border-yellow-200 hover:text-yellow-100"
                            >
                              Atualizar
                            </button>
                          </form>

                          <form action={deleteSupportTicket}>
                            <input type="hidden" name="ticket_id" value={ticket.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-red-300/30 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-red-200 transition hover:border-red-200 hover:text-red-100"
                            >
                              Remover
                            </button>
                          </form>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
