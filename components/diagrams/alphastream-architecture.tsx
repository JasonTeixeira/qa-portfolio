import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AlphastreamArchitecture() {
  return (
    <DiagramFrame
      title="AlphaStream ML Pipeline"
      desc="Market data flows through 200+ engineered indicators into a five-model ensemble (XGBoost, LightGBM, Random Forest, Ridge, Ensemble Voter) which is walk-forward validated and emits signals with SHAP explainers."
    >
      {/* Market Data */}
      <Box x={40} y={250} w={160} h={70} label="Market Data" sublabel="OHLCV + alt" accent={COLORS.emerald} />

      {/* Feature engine */}
      <Box x={250} y={250} w={180} h={70} label="200+ Indicators" sublabel="momentum / vol / regime" accent={COLORS.cyan} />

      {/* Five models in vertical stack */}
      <Box x={490} y={60} w={200} h={56} label="XGBoost" sublabel="gradient boosting" accent={COLORS.violet} />
      <Box x={490} y={140} w={200} h={56} label="LightGBM" sublabel="histogram-based" accent={COLORS.violet} />
      <Box x={490} y={220} w={200} h={56} label="Random Forest" sublabel="bagging" accent={COLORS.violet} />
      <Box x={490} y={300} w={200} h={56} label="Ridge" sublabel="linear baseline" accent={COLORS.violet} />
      <Box x={490} y={380} w={200} h={56} label="Ensemble Voter" sublabel="weighted soft-vote" accent={COLORS.amber} />

      {/* Walk-forward */}
      <Box x={750} y={220} w={180} h={70} label="Walk-Forward CV" sublabel="rolling windows" accent={COLORS.amber} />

      {/* Signal output */}
      <Box x={980} y={180} w={180} h={56} label="Signal" sublabel="long / flat / short" accent={COLORS.cyan} />
      <Box x={980} y={260} w={180} h={56} label="SHAP Values" sublabel="explainability" accent={COLORS.emerald} />

      {/* Arrows */}
      <Arrow x1={200} y1={285} x2={250} y2={285} label="ingest" />
      <Arrow x1={430} y1={278} x2={490} y2={88} dashed />
      <Arrow x1={430} y1={282} x2={490} y2={168} dashed />
      <Arrow x1={430} y1={285} x2={490} y2={248} dashed label="features" />
      <Arrow x1={430} y1={290} x2={490} y2={328} dashed />
      <Arrow x1={430} y1={295} x2={490} y2={408} dashed />

      {/* Models -> ensemble voter */}
      <Arrow x1={690} y1={88} x2={590} y2={380} color={COLORS.violet} dashed />
      <Arrow x1={690} y1={168} x2={590} y2={388} color={COLORS.violet} dashed />
      <Arrow x1={690} y1={248} x2={590} y2={400} color={COLORS.violet} dashed />
      <Arrow x1={690} y1={328} x2={590} y2={412} color={COLORS.violet} dashed />

      {/* Ensemble voter -> walk-forward */}
      <Arrow x1={690} y1={408} x2={750} y2={270} label="predictions" />

      {/* Walk-forward -> signal + SHAP */}
      <Arrow x1={930} y1={245} x2={980} y2={205} label="output" />
      <Arrow x1={930} y1={270} x2={980} y2={285} />

      {/* Legend */}
      <Label x={40} y={540} text="MODELS" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={110} y1={536} x2={140} y2={536} stroke={COLORS.violet} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={148} y={540} text="DATA FLOW" color={COLORS.textMuted} size={10} anchor="start" />
      <line x1={240} y1={536} x2={270} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} />
      <Label x={278} y={540} text="OUTPUT" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
