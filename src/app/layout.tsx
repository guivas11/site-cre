import type { Metadata } from "next";
import { Bebas_Neue, Oxanium } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Oxanium({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CRE Caffe Racing | Blog de Pilotos",
  description:
    "Blog de pilotos de automobilismo para compartilhar vitorias, historias e conquistas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <div className="min-h-screen bg-black pb-24 text-white md:pb-0 [padding-bottom:calc(env(safe-area-inset-bottom)+5.5rem)] md:[padding-bottom:0]">
          <main>{children}</main>

          <footer className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,10,18,0.95),rgba(5,7,13,0.98))]">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:gap-10 md:px-6 md:py-12">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
                  CRE Caffe Racing
                </p>
                <h3 className="mt-3 font-display text-2xl tracking-[0.16em] md:text-3xl md:tracking-[0.18em]">
                  Plataforma dos pilotos
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Perfis, posts, agenda e comunidade em um unico lugar.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-300">
                  Produto
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
                  <a className="transition hover:text-white" href="/pilotos">
                    Pilotos
                  </a>
                  <a className="transition hover:text-white" href="/posts">
                    Posts
                  </a>
                  <a className="transition hover:text-white" href="/agendas">
                    Agenda
                  </a>
                  <a className="transition hover:text-white" href="/comunidades">
                    Comunidade
                  </a>
                  <a className="transition hover:text-white" href="/suporte">
                    Suporte
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-300">
                  Conta
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
                  <a className="transition hover:text-white" href="/login">
                    Entrar
                  </a>
                  <a className="transition hover:text-white" href="/signup">
                    Criar conta
                  </a>
                  <a className="transition hover:text-white" href="/dashboard">
                    Dashboard
                  </a>
                  <a className="transition hover:text-white" href="/clips">
                    Clips
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-300">
                  Ao vivo
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-sm text-zinc-300">Canal oficial da comunidade</p>
                  <a
                    className="mt-3 inline-flex rounded-full border border-yellow-300/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-yellow-200 transition hover:border-yellow-200 hover:text-yellow-100"
                    href="https://www.twitch.tv/vitorcaffe"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Twitch
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10">
              <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between md:px-6">
                <p>© {new Date().getFullYear()} CRE Caffe Racing. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>

          <a
            href="/suporte"
            aria-label="Abrir suporte"
            className="fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/85 text-zinc-200 shadow-[0_10px_24px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-300/45 hover:text-yellow-200 md:bottom-6 md:right-6 md:h-14 md:w-14"
          >
                        <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 13a8 8 0 0 1 16 0" />
              <rect x="3" y="12" width="4" height="7" rx="2" />
              <rect x="17" y="12" width="4" height="7" rx="2" />
              <path d="M19 19a3 3 0 0 1-3 3h-2" />
            </svg>
          </a>

          <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden">
            <div className="grid grid-cols-6 gap-1 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur">
              {[
                { label: "Home", href: "/", icon: "H" },
                { label: "Posts", href: "/posts", icon: "P" },
                { label: "Pilotos", href: "/pilotos", icon: "L" },
                { label: "Agenda", href: "/agendas", icon: "A" },
                { label: "Suporte", href: "/suporte", icon: "S" },
                { label: "Perfil", href: "/dashboard", icon: "U" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex min-h-14 flex-col items-center justify-center rounded-xl px-1 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:bg-white/5 hover:text-yellow-200"
                >
                  <span className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-[9px] leading-none">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}

