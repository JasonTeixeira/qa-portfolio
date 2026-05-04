import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AiVoiceAgentFlow() {
  return (
    <DiagramFrame
      viewBox="0 0 1200 500"
      title="AI Voice Agent Pipeline"
      desc="An inbound call enters automatic speech recognition, which feeds an LLM intent classifier; the LLM dispatches in parallel to CRM, calendar, and knowledge tool calls, then composes a TTS response back to the caller."
    >
      {/* Inbound call */}
      <Box x={30} y={210} w={140} h={80} label="Inbound Call" sublabel="PSTN / SIP" accent={COLORS.violet} />

      {/* ASR */}
      <Box x={210} y={210} w={140} h={80} label="ASR" sublabel="transcription" accent={COLORS.cyan} />

      {/* LLM intent */}
      <Box x={390} y={200} w={170} h={100} label="LLM Intent" sublabel="classify + plan" accent={COLORS.cyan} fontSize={15} />

      {/* Tool calls (parallel) */}
      <Box x={620} y={70} w={200} h={70} label="CRM Tool" sublabel="lookup customer" accent={COLORS.amber} />
      <Box x={620} y={170} w={200} h={70} label="Calendar Tool" sublabel="check availability" accent={COLORS.amber} />
      <Box x={620} y={270} w={200} h={70} label="Knowledge Tool" sublabel="RAG over docs" accent={COLORS.amber} />
      <Box x={620} y={370} w={200} h={70} label="Handoff Tool" sublabel="escalate to human" accent={COLORS.rose} />

      {/* Compose */}
      <Box x={870} y={200} w={150} h={100} label="Compose" sublabel="response text" accent={COLORS.cyan} />

      {/* TTS */}
      <Box x={1060} y={210} w={130} h={80} label="TTS" sublabel="voice output" accent={COLORS.emerald} />

      {/* Pipeline arrows */}
      <Arrow x1={170} y1={250} x2={210} y2={250} />
      <Arrow x1={350} y1={250} x2={390} y2={250} label="text" />

      {/* LLM -> tools fanout */}
      <Arrow x1={560} y1={235} x2={620} y2={105} dashed label="parallel" />
      <Arrow x1={560} y1={245} x2={620} y2={205} dashed />
      <Arrow x1={560} y1={260} x2={620} y2={305} dashed />
      <Arrow x1={560} y1={275} x2={620} y2={405} dashed color={COLORS.rose} />

      {/* Tools -> compose */}
      <Arrow x1={820} y1={105} x2={870} y2={220} />
      <Arrow x1={820} y1={205} x2={870} y2={240} label="results" />
      <Arrow x1={820} y1={305} x2={870} y2={260} />

      {/* Compose -> TTS -> caller */}
      <Arrow x1={1020} y1={250} x2={1060} y2={250} />

      {/* Voice loop back to caller */}
      <path d="M 1125 290 Q 1125 460 100 460 Q 100 290 100 290" stroke={COLORS.emerald} strokeWidth={1.5} fill="none" strokeDasharray="4 4" markerEnd="url(#arrow-emerald-back)" opacity={0.7} />
      <Label x={620} y={450} text="VOICE → CALLER" color={COLORS.emerald} size={10} />

      <defs>
        <marker id="arrow-emerald-back" markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.emerald} />
        </marker>
      </defs>
    </DiagramFrame>
  )
}
