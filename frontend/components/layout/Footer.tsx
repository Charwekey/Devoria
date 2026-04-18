export function Footer() {
  return (
    <footer style={{ marginTop: "auto", borderTop: "1px solid var(--color-border)", padding: "3rem 0" }}>
      <div className="container flex-between" style={{ flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-h3" style={{ color: "var(--color-primary-dark)" }}>Devoria</h3>
          <p className="text-small">Where Learning Meets Real-World Impact</p>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          <a href="#" className="text-small hover-lift" style={{ textDecoration: "none" }}>About</a>
          <a href="/projects" className="text-small hover-lift" style={{ textDecoration: "none" }}>Projects</a>
          <a href="/login" className="text-small hover-lift" style={{ textDecoration: "none" }}>Login</a>
        </div>
      </div>
    </footer>
  );
}
