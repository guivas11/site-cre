import { createClient } from "@/lib/supabase/server";
import { createEvent, deleteEvent, updateEvent } from "./actions";
import Countdown from "./Countdown";
import EventReminder from "./EventReminder";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

type EventItem = {
  id: string;
  title: string;
  start_at: string;
  end_at: string | null;
  track: string | null;
  category: string | null;
  description: string | null;
  link: string | null;
  created_by: string;
  created_at: string | null;
};

type PageProps = {
  searchParams?: { error?: string; success?: string };
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const { data: eventsData } = await supabase
    .from("agenda_events")
    .select("*")
    .order("start_at", { ascending: true });

  const events = (eventsData ?? []) as EventItem[];

  const now = new Date();
  const nextEvent =
    events.find((event) => new Date(event.start_at) > now) ?? null;
  const nextKey = nextEvent
    ? new Date(nextEvent.start_at).toISOString().slice(0, 10)
    : null;

  const { data: userData } = await supabase.auth.getUser();
  const isLogged = Boolean(userData.user);

  const { data: adminProfile } = userData.user
    ? await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userData.user.id)
        .maybeSingle()
    : { data: null };

  const isAdmin = Boolean(adminProfile?.is_admin);

  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startWeekday = startOfMonth.getDay();

  const eventMap = new Map<string, EventItem[]>();
  events.forEach((event) => {
    const key = new Date(event.start_at).toISOString().slice(0, 10);
    const list = eventMap.get(key) ?? [];
    list.push(event);
    eventMap.set(key, list);
  });

  const emptyCells = Array.from({ length: startWeekday });
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const key = date.toISOString().slice(0, 10);
    return { date, key, day: index + 1, items: eventMap.get(key) ?? [] };
  });

  const messageError =
    typeof searchParams?.error === "string" ? searchParams.error : "";
  const messageSuccess =
    typeof searchParams?.success === "string" ? searchParams.success : "";

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Calendario CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">
              Agenda de corridas
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Eventos, treinos e etapas oficiais da comunidade CRE.
            </p>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        {messageError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {messageError}
          </div>
        ) : null}
        {messageSuccess ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {messageSuccess}
          </div>
        ) : null}

                {nextEvent ? (
          <section className="glass rounded-3xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
                  Proxima etapa
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {nextEvent.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  {nextEvent.track || "Pista nao informada"} - {nextEvent.category || "Categoria"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {formatDate(nextEvent.start_at)} {formatTime(nextEvent.start_at)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  Comeca em
                </p>
                <Countdown target={nextEvent.start_at} />
              </div>
            </div>
            <EventReminder
              eventId={nextEvent.id}
              title={nextEvent.title}
              startAt={nextEvent.start_at}
            />
          </section>
        ) : null}

        <section className="glass rounded-3xl overflow-hidden">
          <div className="primary-stripe h-2" />
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sab</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {emptyCells.map((_, index) => (
                <div key={`empty-${index}`} className="h-24 rounded-2xl" />
              ))}
              {days.map((day) => (
                <div
                  key={day.key}
                  className={`flex h-24 flex-col rounded-2xl border p-2 ${day.key === nextKey ? "border-yellow-300/60 bg-yellow-300/10 shadow-[0_0_20px_rgba(250,204,21,0.25)]" : "border-white/10 bg-black/40"}`}
                >
                  <span className="text-xs text-zinc-400">{day.day}</span>
                  <div className="mt-2 flex flex-1 flex-col gap-1 overflow-hidden">
                    {day.items.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className="truncate rounded-full bg-yellow-300/10 px-2 py-1 text-[10px] text-yellow-200"
                      >
                        {item.title}
                      </span>
                    ))}
                    {day.items.length > 2 ? (
                      <span className="text-[10px] text-zinc-500">
                        +{day.items.length - 2} eventos
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl overflow-hidden">
          <div className="primary-stripe h-2" />
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
            {events.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum evento cadastrado.</p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{formatDate(event.start_at)}</span>
                    <span>{formatTime(event.start_at)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-300">
                    {event.track || "Pista nao informada"}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {event.category || "Categoria"}
                  </p>
                  {event.description ? (
                    <p className="mt-3 text-sm text-zinc-300">
                      {event.description}
                    </p>
                  ) : null}
                  {event.link ? (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
                    >
                      Abrir link
                    </a>
                  ) : null}
                  {isAdmin ? (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs uppercase tracking-[0.3em] text-yellow-300">
                        Editar
                      </summary>
                      <form
                        className="mt-3 grid gap-3"
                        action={updateEvent}
                      >
                        <input type="hidden" name="id" value={event.id} />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="title"
                          defaultValue={event.title}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                            type="datetime-local"
                            name="start_at"
                            defaultValue={toInputValue(event.start_at)}
                          />
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                            type="datetime-local"
                            name="end_at"
                            defaultValue={toInputValue(event.end_at)}
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                            name="track"
                            defaultValue={event.track ?? ""}
                            placeholder="Pista"
                          />
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                            name="category"
                            defaultValue={event.category ?? ""}
                            placeholder="Categoria"
                          />
                        </div>
                        <textarea
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="description"
                          rows={2}
                          defaultValue={event.description ?? ""}
                          placeholder="Descricao"
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="link"
                          defaultValue={event.link ?? ""}
                          placeholder="Link"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-white/50 hover:text-white"
                          >
                            Salvar
                          </button>
                          <button
                            formAction={deleteEvent}
                            className="rounded-full border border-red-500/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-200 transition hover:border-red-500/70"
                          >
                            Remover
                          </button>
                        </div>
                      </form>
                    </details>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        {isAdmin ? (
          <section className="glass rounded-3xl p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Criar novo evento
            </h2>
            <form className="mt-5 grid gap-4" action={createEvent}>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="title"
                placeholder="Titulo do evento"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                  type="datetime-local"
                  name="start_at"
                  required
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                  type="datetime-local"
                  name="end_at"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                  name="track"
                  placeholder="Pista"
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                  name="category"
                  placeholder="Categoria"
                />
              </div>
              <textarea
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="description"
                rows={3}
                placeholder="Descricao"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="link"
                placeholder="Link"
              />
              <button
                type="submit"
                className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-white/50 hover:text-white"
              >
                Criar evento
              </button>
            </form>
          </section>
        ) : isLogged ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Apenas administradores podem editar a agenda.
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Faça login para ver mais detalhes da agenda.
          </div>
        )}
      </div>
    </div>
  );
}

