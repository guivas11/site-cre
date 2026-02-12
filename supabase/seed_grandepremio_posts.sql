-- Seed de noticias (Grandepremio) para a tabela public.posts
-- Execute no Supabase SQL Editor.

create temporary table tmp_gp_news (
  title text,
  excerpt text,
  tag text,
  author text,
  read_time text,
  publish_date date,
  cover_url text
) on commit drop;

insert into tmp_gp_news (title, excerpt, tag, author, read_time, publish_date, cover_url)
values
(
  'Horner compara acerto de Verstappen ao de Schumacher',
  'Christian Horner afirmou que o setup de Max Verstappen para 2026 lembra o nivel de leitura tecnica de Michael Schumacher. A discussao gira em torno de acerto de carro, adaptacao e constancia em finais de semana de alta pressao.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/christian-horner-compara-setup-max-verstappen-michael-schumacher-ideal-nenhum-carro-serie/',
  'F1',
  'Equipe CRE',
  '4 min',
  '2026-02-11',
  null
),
(
  'Steiner diz que Russell enfrenta fase dificil na Mercedes',
  'Gunther Steiner avaliou o momento de George Russell e apontou um periodo de pressao interna e externa na Mercedes. O tema central da analise foi consistencia, resposta em corrida e como o ambiente da equipe influencia desempenho.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/gunther-steiner-diz-george-russell-fase-terrivel-mercedes/',
  'F1',
  'Equipe CRE',
  '3 min',
  '2026-02-11',
  null
),
(
  'Norris ve erro da McLaren e diz que equipe fez facil parecer dificil',
  'Lando Norris comentou que a McLaren complicou um cenario que parecia sob controle, reforcando a importancia de execucao limpa em estrategia e paradas. A leitura do piloto destaca margens pequenas na F1 atual.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/lando-norris-acusa-mclaren-erro-equipe-facil-dificil-muita-coisa/',
  'F1',
  'Equipe CRE',
  '4 min',
  '2026-02-11',
  null
),
(
  'Piastri fala em erro raro e admite pressao no duelo com Norris',
  'Oscar Piastri classificou uma decisao recente como erro raro e reconheceu pressao no confronto interno com Norris. O caso coloca foco em gerenciamento de risco e tomada de decisao quando os dois carros brigam por resultado alto.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/oscar-piastri-admite-erro-raro-pressionado-batalha-lando-norris/',
  'F1',
  'Equipe CRE',
  '4 min',
  '2026-02-11',
  null
),
(
  'FIA muda regra de flexibilidade e reduz monitoramento em 2027',
  'A FIA anunciou ajustes para 2027 nas regras de flexibilidade aerodinamica e no formato de monitoramento durante o fim de semana. A mudanca pode impactar desenvolvimento de carro e a forma de validacao tecnica das equipes.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/fia-muda-regras-flexibilidade-asas-reduz-monitoramento-2027/',
  'F1',
  'Equipe CRE',
  '5 min',
  '2026-02-11',
  null
),
(
  'Antonelli encara ponto de virada e busca reacao na Mercedes',
  'Andrea Kimi Antonelli definiu a proxima etapa como ponto chave para reagir na temporada. O piloto destacou necessidade de converter velocidade em resultado e diminuir erros de execucao em classificacao e corrida.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/andrea-kimi-antonelli-ponto-virada-f1-belgica-quer-voltar-mercedes/',
  'F1',
  'Equipe CRE',
  '3 min',
  '2026-02-11',
  null
),
(
  'Hamilton cobra melhora da Ferrari para voltar a brigar no topo',
  'Lewis Hamilton afirmou que a Ferrari precisa evoluir para voltar ao ritmo de disputa na frente. O comentario reforca o debate sobre eficiencia do pacote, atualizacoes e janela de performance em diferentes circuitos.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/lewis-hamilton-ferrari-precisa-melhorar-rendimento-voltar-brigar-frente/',
  'F1',
  'Equipe CRE',
  '4 min',
  '2026-02-11',
  null
),
(
  'FIA aumenta taxa de protestos para temporada 2026',
  'A FIA oficializou o aumento da taxa para protestos e pedidos de revisao na Formula 1, com valor muito superior ao praticado anteriormente. A medida tende a reduzir contestacoes estrategicas e muda o calculo de risco das equipes.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/fia-determina-aumento-valor-taxa-protestos-formula-1-a-partir-2026/',
  'F1',
  'Equipe CRE',
  '3 min',
  '2026-02-11',
  null
),
(
  'Madri confirma novo lote de ingressos para etapa de 2026',
  'Mesmo com rumores sobre atraso nas obras, os organizadores da corrida em Madri anunciaram novo lote de ingressos. O movimento indica manutencao do plano para receber a Formula 1 no calendario de 2026.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/madri-responde-rumores-cancelamento-anuncia-novos-ingressos-etapa-em-2026/',
  'F1',
  'Equipe CRE',
  '2 min',
  '2026-02-11',
  null
),
(
  'F1 divulga calendario de testes para 2026',
  'A categoria publicou as datas da pre-temporada de 2026 e confirmou ajustes de agenda em etapas especificas do campeonato. A definicao impacta planejamento tecnico, logistica e programa de desenvolvimento das equipes.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/f1-divulga-calendario-pre-temporada-2026-alteracao-data-gp-azerbaijao/',
  'F1',
  'Equipe CRE',
  '4 min',
  '2026-02-11',
  null
),
(
  'Albon critica curto periodo de descanso antes de 2026',
  'Alexander Albon apontou que o intervalo entre fim de temporada e testes iniciais ficou curto demais para os pilotos. O tema reacende a discussao sobre calendario, recuperacao fisica e carga mental no paddock.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/alexander-albon-reclama-tempo-brutal-descanso-antes-f1-2026-nao-suficiente/',
  'F1',
  'Equipe CRE',
  '3 min',
  '2026-02-11',
  null
),
(
  'Globo detalha nova cobertura da Formula 1 para 2026',
  'A emissora apresentou o plano de transmissao para a nova fase da Formula 1, incluindo programa adicional e equipe de reportagem distribuida por regioes. A mudanca pode ampliar alcance e rotina de acompanhamento dos fans.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/globo-detalha-cobertura-apresenta-nova-programacao-formula-1-2026/',
  'Midia',
  'Equipe CRE',
  '2 min',
  '2026-02-11',
  null
),
(
  'Norris vence no Mexico e assume lideranca da temporada',
  'Lando Norris confirmou o favoritismo no fim de semana do Mexico, converteu pole em vitoria e passou a liderar o campeonato. O resultado aumenta a pressao sobre rivais diretos na reta decisiva da temporada.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/lando-norris-passeia-mexico-ve-oscar-piastri-5o-assume-lideranca-f1-2025-gabriel-bortoleto-10o/',
  'F1',
  'Equipe CRE',
  '5 min',
  '2026-02-11',
  null
),
(
  'Verstappen critica postura de Piastri no duelo com Norris',
  'Max Verstappen avaliou o episodio de corrida e disse que teria tomado decisao diferente na disputa com Lando Norris. A declaracao reforca o debate sobre prioridades de equipe e agressividade em momentos-chave.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/nao-teria-deixado-lando-norris-passar-max-verstappen-reprova-atitude-oscar-piastri-gp-italia/',
  'F1',
  'Equipe CRE',
  '3 min',
  '2026-02-11',
  null
),
(
  'McLaren mantem regra interna para disputa de titulo',
  'A McLaren reafirmou que nao vai impor ordem de equipe entre seus pilotos na fase final da temporada. A diretriz preserva disputa direta e exige execucao perfeita de estrategia para evitar perdas internas.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/mclaren-mantem-regra-papaia-decisao-da-f1-lando-norris-oscar-piastri-merecem-lutar-titulo/',
  'F1',
  'Equipe CRE',
  '2 min',
  '2026-02-11',
  null
),
(
  'Russell e fase de pressao: Steiner analisa momento',
  'Gunther Steiner voltou a comentar o contexto de George Russell e a necessidade de resposta consistente em classificacao e corrida. O recorte destaca como fases de oscilacao mudam a leitura de desempenho no campeonato.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/gunther-steiner-diz-george-russell-fase-terrivel-mercedes/',
  'F1',
  'Equipe CRE',
  '3 min',
  '2026-02-11',
  null
),
(
  'Norris aponta erro operacional da McLaren em etapa decisiva',
  'Lando Norris avaliou que a equipe deixou escapar eficiencia em um fim de semana importante, transformando um cenario favoravel em prova de risco. A leitura reforca a importancia de detalhes operacionais na briga por pontos.\n\nFonte: https://www.grandepremio.com.br/f1/noticias/lando-norris-acusa-mclaren-erro-equipe-facil-dificil-muita-coisa/',
  'F1',
  'Equipe CRE',
  '4 min',
  '2026-02-11',
  null
);

do $$
declare
  has_created_by boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'created_by'
  ) into has_created_by;

  if has_created_by then
    execute $sql$
      insert into public.posts (
        title,
        excerpt,
        tag,
        author,
        read_time,
        publish_date,
        cover_url,
        created_by
      )
      select
        n.title,
        n.excerpt,
        n.tag,
        n.author,
        n.read_time,
        n.publish_date,
        n.cover_url,
        (select id from auth.users order by created_at asc limit 1)
      from tmp_gp_news n
    $sql$;
  else
    execute $sql$
      insert into public.posts (
        title,
        excerpt,
        tag,
        author,
        read_time,
        publish_date,
        cover_url
      )
      select
        n.title,
        n.excerpt,
        n.tag,
        n.author,
        n.read_time,
        n.publish_date,
        n.cover_url
      from tmp_gp_news n
    $sql$;
  end if;
end $$;
