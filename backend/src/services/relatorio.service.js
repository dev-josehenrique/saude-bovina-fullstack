const prisma = require('../lib/prisma');

// Consultas SQL do trabalho de Banco de Dados (relatorios.py), com casts para tipos serializáveis em JSON.

const animaisPorVeterinario = () =>
  prisma.$queryRaw`
    SELECT v.id_veterinario, v.nome AS veterinario,
           COUNT(DISTINCT t.id_bovino)::int AS total_animais_tratados,
           COUNT(t.id_tratamento)::int AS total_tratamentos
    FROM veterinario v
    LEFT JOIN tratamento t ON v.id_veterinario = t.id_veterinario
    GROUP BY v.id_veterinario, v.nome
    ORDER BY total_animais_tratados DESC, v.nome`;

const pesoMedioAdultos = () =>
  prisma.$queryRaw`
    WITH ultima_pesagem AS (
      SELECT DISTINCT ON (id_bovino) id_bovino, peso, data
      FROM pesagem
      ORDER BY id_bovino, data DESC
    )
    SELECT r.linhagem AS raca, b.sexo, ROUND(AVG(up.peso), 2)::float8 AS media_peso
    FROM raca r
    JOIN bovino b ON r.id_raca = b.id_raca
    JOIN ultima_pesagem up ON b.id_bovino = up.id_bovino
    WHERE b.data_nascimento <= CURRENT_DATE - INTERVAL '18 months'
    GROUP BY r.linhagem, b.sexo
    ORDER BY r.linhagem, b.sexo`;

const historicoLotacao = () =>
  prisma.$queryRaw`
    WITH movimentacoes AS (
      SELECT id_piquete, data_entrada AS data_mov, 1 AS qtd FROM piquete_bovino WHERE data_entrada IS NOT NULL
      UNION ALL
      SELECT id_piquete, data_saida AS data_mov, -1 AS qtd FROM piquete_bovino WHERE data_saida IS NOT NULL
    ),
    saldos_diarios AS (
      SELECT p.nome AS piquete, m.data_mov,
             SUM(CASE WHEN m.qtd = 1 THEN 1 ELSE 0 END) AS entradas,
             SUM(CASE WHEN m.qtd = -1 THEN 1 ELSE 0 END) AS saidas,
             SUM(m.qtd) AS saldo_dia
      FROM movimentacoes m
      JOIN piquete p ON m.id_piquete = p.id_piquete
      GROUP BY p.nome, m.data_mov
    ),
    acumulado AS (
      SELECT piquete, data_mov, entradas, saidas, saldo_dia,
             SUM(saldo_dia) OVER (PARTITION BY piquete ORDER BY data_mov) AS lotacao_final
      FROM saldos_diarios
    )
    SELECT piquete, to_char(data_mov, 'YYYY-MM-DD') AS data_mov,
           entradas::int, saidas::int, saldo_dia::int, lotacao_final::int
    FROM acumulado
    ORDER BY acumulado.data_mov, piquete`;

module.exports = { animaisPorVeterinario, pesoMedioAdultos, historicoLotacao };
