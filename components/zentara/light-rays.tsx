/** Fundo roxo fixo atrás de toda a página Zentara. */
export function LightRays() {
  return (
    <div aria-hidden="true" data-testid="zentara-fundo" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.35),transparent_60%)]" />
    </div>
  );
}
