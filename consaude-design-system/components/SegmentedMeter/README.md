# SegmentedMeter

Medidor segmentado — a assinatura "Finance Score" da referência — para taxas e progresso com uma ou duas faixas.

**Você fornece**: `value` (0–100), `secondary` (0–100, ≥ value, faixa `chart-2`), `segments` (20–32), `title`, `valueLabel` (texto do valor), `legend` (`[{ label, swatch, value }]`), `thin`.

- Dashboard: taxa de conformidade. Relatório: progresso da revisão (Corrigidos, Revisados, Pendentes). Sempre com valor em texto e legenda; exposto como `role="meter"`.
