export default function MoisLoading() {
  return (
    <div className="dash" aria-busy="true" role="status">
      <span className="sr">Chargement de ton mois</span>
      <section className="a-bal">
        <div className="card stack" style={{ padding: "var(--space-6)" }}>
          <div className="skel" style={{ width: 96, height: 14 }} />
          <div className="skel" style={{ width: 240, height: 52 }} />
          <div className="skel" style={{ height: 8, borderRadius: 999 }} />
          <div className="skel" style={{ width: "70%", height: 14 }} />
          <div className="stats">
            <div className="skel" style={{ height: 40 }} />
            <div className="skel" style={{ height: 40 }} />
            <div className="skel" style={{ height: 40 }} />
          </div>
        </div>
      </section>
      <section className="a-cats">
        <div className="skel" style={{ width: 140, height: 14, marginBottom: "var(--space-3)" }} />
        <div className="cat-grid">
          <div className="skel" style={{ height: 150, borderRadius: 20 }} />
          <div className="skel" style={{ height: 150, borderRadius: 20 }} />
          <div className="skel" style={{ height: 150, borderRadius: 20 }} />
          <div className="skel" style={{ height: 150, borderRadius: 20 }} />
        </div>
      </section>
      <section className="a-proj">
        <div className="skel" style={{ height: 230, borderRadius: 20 }} />
      </section>
    </div>
  );
}
