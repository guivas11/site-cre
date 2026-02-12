import { createClient } from "@/lib/supabase/server";
import {
  createEvent,
  deleteEvent,
  registerEvent,
  unregisterEvent,
  updateEvent,
} from "./actions";
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
  max_slots: number | null;
};

type RegistrationItem = {
  event_id: string;
  user_id: string;
};

type PageProps = {
  searchParams?:
    | { error?: string; success?: string; month?: string }
    | Promise<{ error?: string; success?: string; month?: string }>;
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const supabase = await createClient();

  const { data: eventsData } = await supabase
    .from("agenda_events")
    .select("*")
    .order("start_at", { ascending: true });

  const events = (eventsData ?? []) as EventItem[];

  const now = new Date();
  const nextEvent = events.find((event) => new Date(event.start_at) > now) ?? null;
  const nextKey = nextEvent ? new Date(nextEvent.start_at).toISOString().slice(0, 10) : null;

  const monthParam = typeof params?.month === "string" ? params.month : "";
  const monthMatch = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(monthParam);
  const viewYear = monthMatch ? Number(monthMatch[1]) : now.getFullYear();
  const viewMonth = monthMatch ? Number(monthMatch[2]) - 1 : now.getMonth();

  const monthBaseDate = new Date(viewYear, viewMonth, 1);
  const prevMonthDate = new Date(viewYear, viewMonth - 1, 1);
  const nextMonthDate = new Date(viewYear, viewMonth + 1, 1);
  const toMonthParam = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };
  const prevMonthParam = toMonthParam(prevMonthDate);
  const nextMonthParam = toMonthParam(nextMonthDate);

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;
  const isLogged = Boolean(currentUserId);

  const { data: adminProfile } = currentUserId
    ? await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUserId)
        .maybeSingle()
    : { data: null };

  const isAdmin = Boolean(adminProfile?.is_admin);

  const eventIds = events.map((event) => event.id);
  const { data: registrationsData } = eventIds.length
    ? await supabase
        .from("agenda_event_registrations")
        .select("event_id,user_id")
        .in("event_id", eventIds)
    : { data: [] };

  const registrations = (registrationsData ?? []) as RegistrationItem[];
  const registrationsByEvent = new Map<string, number>();
  const myRegistrations = new Set<string>();

  registrations.forEach((row) => {
    registrationsByEvent.set(
      row.event_id,
      (registrationsByEvent.get(row.event_id) ?? 0) + 1,
    );
    if (currentUserId && row.user_id === currentUserId) {
      myRegistrations.add(row.event_id);
    }
  });

  const year = viewYear;
  const month = viewMonth;
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

  const messageError = typeof params?.error === "string" ? params.error : "";
  const messageSuccess =
    typeof params?.success === "string" ? params.success : "";

  const upcomingCount = events.filter((event) => new Date(event.start_at) > now).length;
  const totalRegistrations = registrations.length;
  const monthLabel = monthBaseDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-6 md:gap-10 md:px-6 md:pt-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Calendario CRE</p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">Agenda de corridas</h1>
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

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Mes atual</p>
            <p className="mt-2 text-lg font-semibold capitalize text-white">{monthLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Proximos eventos</p>
            <p className="mt-2 font-display text-3xl tracking-[0.08em] text-white">{upcomingCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Inscricoes totais</p>
            <p className="mt-2 font-display text-3xl tracking-[0.08em] text-yellow-200">{totalRegistrations}</p>
          </div>
        </section>

        {nextEvent ? (
          <section className="glass rounded-3xl border border-white/12 p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Proxima etapa</p>
                <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{nextEvent.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-300">
                  <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">
                    {nextEvent.track || "Pista nao informada"}
                  </span>
                  <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">
                    {nextEvent.category || "Categoria"}
                  </span>
                  <span className="rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-yellow-200">
                    {formatDate(nextEvent.start_at)} {formatTime(nextEvent.start_at)}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Comeca em</p>
                <Countdown target={nextEvent.start_at} />
              </div>
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <EventReminder
                eventId={nextEvent.id}
                title={nextEvent.title}
                startAt={nextEvent.start_at}
              />
            </div>
          </section>
        ) : null}

        <section className="glass rounded-3xl overflow-hidden border border-white/10">
          <div className="primary-stripe h-2" />
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl tracking-[0.14em] text-white">Calendario mensal</h2>
              <div className="flex items-center gap-2">
                <a
                  href={`/agendas?month=${prevMonthParam}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-200 transition hover:-translate-y-0.5 hover:border-yellow-300/45 hover:text-yellow-100"
                >
                  <span aria-hidden="true">&larr;</span>
                  Mes anterior
                </a>
                <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-yellow-100 capitalize">
                  {monthLabel}
                </span>
                <a
                  href={`/agendas?month=${nextMonthParam}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-200 transition hover:-translate-y-0.5 hover:border-yellow-300/45 hover:text-yellow-100"
                >
                  Proximo mes
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
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
                <div key={`empty-${index}`} className="h-24 rounded-xl" />
              ))}
              {days.map((day) => (
                <div
                  key={day.key}
                  className={`flex h-24 flex-col rounded-xl border p-2 transition ${
                    day.key === nextKey
                      ? "border-yellow-300/60 bg-yellow-300/10 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
                      : "border-white/10 bg-black/40"
                  }`}
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
                      <span className="text-[10px] text-zinc-500">+{day.items.length - 2} eventos</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl overflow-hidden border border-white/10">
          <div className="primary-stripe h-2" />
          <div className="p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-[0.14em] text-white">Lista de eventos</h2>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{events.length} eventos</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
            {events.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum evento cadastrado.</p>
            ) : (
              events.map((event) => {
                const usedSlots = registrationsByEvent.get(event.id) ?? 0;
                const maxSlots = event.max_slots ?? 20;
                const isRegistered = myRegistrations.has(event.id);
                const isFull = usedSlots >= maxSlots;

                return (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-white/12 bg-black/45 p-4 transition hover:border-white/25 hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{formatDate(event.start_at)}</span>
                      <span>{formatTime(event.start_at)}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{event.title}</h3>
                    <p className="mt-1 text-sm text-zinc-300">{event.track || "Pista nao informada"}</p>
                    <p className="mt-2 text-xs text-zinc-500">{event.category || "Categoria"}</p>

                    <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Vagas: <span className="text-zinc-200">{usedSlots}/{maxSlots}</span>
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-yellow-300/70"
                        style={{ width: `${Math.min(100, Math.round((usedSlots / Math.max(1, maxSlots)) * 100))}%` }}
                      />
                    </div>

                    {event.description ? (
                      <p className="mt-3 text-sm text-zinc-300">{event.description}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {event.link ? (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
                        >
                          Abrir link
                        </a>
                      ) : null}

                      {isLogged ? (
                        isRegistered ? (
                          <form action={unregisterEvent}>
                            <input type="hidden" name="event_id" value={event.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-red-400/50 px-4 py-2 text-xs uppercase tracking-[0.25em] text-red-200 transition hover:border-red-300"
                            >
                              Cancelar inscricao
                            </button>
                          </form>
                        ) : (
                          <form action={registerEvent}>
                            <input type="hidden" name="event_id" value={event.id} />
                            <button
                              type="submit"
                              disabled={isFull}
                              className="rounded-full border border-yellow-300/50 bg-yellow-300/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-yellow-200 transition hover:bg-yellow-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isFull ? "Vagas esgotadas" : "Inscrever-se"}
                            </button>
                          </form>
                        )
                      ) : null}
                    </div>

                    {isAdmin ? (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-xs uppercase tracking-[0.3em] text-yellow-300">
                          Editar
                        </summary>
                        <form className="mt-3 grid gap-3" action={updateEvent}>
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
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                            name="max_slots"
                            type="number"
                            min={1}
                            defaultValue={event.max_slots ?? 20}
                            placeholder="Limite de vagas"
                          />
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
                );
              })
            )}
            </div>
          </div>
        </section>

        {isAdmin ? (
          <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">Criar novo evento</h2>
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
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="max_slots"
                type="number"
                min={1}
                defaultValue={20}
                placeholder="Limite de vagas"
              />
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
            Faca login para ver mais detalhes da agenda.
          </div>
        )}
      </div>
    </div>
  );
}

