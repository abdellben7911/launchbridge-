export function MeshOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="orb" style={{ width: 520, height: 520, background: "var(--primary)", top: "-10%", left: "-10%" }} />
      <div className="orb" style={{ width: 460, height: 460, background: "var(--secondary)", top: "20%", right: "-12%", animationDelay: "-4s" }} />
      <div className="orb" style={{ width: 380, height: 380, background: "var(--primary-dark)", bottom: "-15%", left: "30%", animationDelay: "-9s" }} />
    </div>
  );
}
