import React from "react";

export default function RegisterPage() {
  return (
    <>
      <style>{`
        /* component-scoped classes (keeps things predictable across projects) */
        .rp-bg-img { position: fixed; inset: 0; z-index: -2; overflow: hidden; }
        .rp-bg-img img { width:100%; height:100%; object-fit:cover; filter: blur(6px) brightness(0.75); transform: scale(1.02); }

        .rp-overlay { position: fixed; inset: 0; z-index: -1; background: rgba(0,0,0,0.45); }

        /* Page container: center card vertically and horizontally */
        .rp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;     /* center vertically */
          justify-content: center; /* center horizontally */
          padding: 55px 16px;      /* spacing around */
          box-sizing: border-box;
        }

        /* Card: modal-like */
        .rp-card {
          width: 90%;
          max-width: 900px;
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          flex-wrap: nowrap; /* <-- prevent stacking on normal screens */
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 10px 26px rgba(0,0,0,0.45);
        }

        /* left image and right panel */
        .rp-image { flex: 1 1 50%; min-width: 260px; }
        .rp-image img { width:100%; height:100%; object-fit:cover; filter: brightness(0.9); }

        .rp-panel {
          flex: 1 1 50%;
          min-width: 260px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
          backdrop-filter: blur(10px);
        }

        /* Buttons */
        .rp-btn {
          width: 100%;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 650;
          background: rgba(255,255,255,0.12);
          color: white;
          border: 1.5px solid rgba(255,255,255,0.55);
          cursor: pointer;
          transition: background .18s ease;
          margin-bottom: 12px;
        }
        .rp-btn:hover { background: rgba(255,255,255,0.22); }
        .rp-btn:last-of-type { margin-bottom: 20px; }

        .rp-back {
          display: inline-block;
          background: rgba(255,255,255,0.16);
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.55);
          padding: 7px 16px;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: background .18s ease;
        }
        .rp-back:hover { background: rgba(255,255,255,0.24); }

        /* Responsive: only stack when screen is narrow */
        @media (max-width: 820px) {
          .rp-card { flex-wrap: wrap; }
          .rp-image { width: 100%; height: 220px; } /* image on top */
          .rp-panel { width: 100%; padding: 24px; }
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="rp-bg-img">
        <img src="/assets/download.webp" alt="Background" />
      </div>

      {/* Dark overlay */}
      <div className="rp-overlay" />

      {/* CONTENT – centered modal */}
      <div className="rp-page">
        <div className="rp-card" role="region" aria-label="Register card">
          {/* LEFT: IMAGE */}
          <div className="rp-image">
            <img src="/assets/download.webp" alt="Library preview" />
          </div>

          {/* RIGHT: REGISTER PANEL */}
          <div className="rp-panel">
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 10 }}>
              <span style={{
                background: "linear-gradient(135deg,#ffae42,#ffd98e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Register
              </span>{" "}
              Account
            </h1>

            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", marginBottom: 20 }}>
              Choose how you want to create your account.
            </p>

            <button className="rp-btn" onClick={() => (window.location.href = "/register/student")}>
              🎓 Register as Student
            </button>

            <button className="rp-btn" onClick={() => (window.location.href = "/register/librarian")}>
              📚 Register as Librarian
            </button>

            <div style={{ textAlign: "center" }}>
              <button className="rp-back" onClick={() => (window.location.href = "/")}>
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
