import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          overflow: "hidden",
        }}
      >
        <img
          src="/assets/download.webp"
          alt="Background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(10px) brightness(0.85)",
            transform: "scale(1.03)",
          }}
        />
      </div>

      {/* OVERLAY */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: -1,
        }}
      />

      {/* MAIN BOX */}
      <main
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 10px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            padding: "36px 40px",
            borderRadius: "32px",
            backdropFilter: "blur(16px)",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* HERO */}
          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontSize: "0.9rem",
                margin: 0,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              LMS PORTAL
            </p>

            <h1
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                lineHeight: 1.25,
                margin: "10px 0",
              }}
            >
              A Modern Library
              <br />
              That Does It All.
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.6,
                margin: "0 0 18px",
              }}
            >
              Manage books, students, and staff effortlessly with a clean,
              modern interface tailored for campuses.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "14px",
              }}
            >
              <Link
                to="/register"
                style={{
                  background:
                    "linear-gradient(90deg,#9A5B34,#E8D1A7,#442D1C)",
                  color: "#1a1a1a",
                  borderRadius: "999px",
                  padding: "12px 30px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 8px 22px rgba(0,0,0,0.45)",
                }}
              >
                Get Started
              </Link>

              <Link
                to="/login"
                style={{
                  padding: "12px 28px",
                  borderRadius: "999px",
                  border: "2px solid rgba(255,255,255,0.85)",
                  fontSize: "0.98rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  textDecoration: "none",
                  backdropFilter: "blur(2px)",
                }}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* ROUNDED STRIP */}
          <div
            style={{
              background: "linear-gradient(90deg,#9A5B34,#E8D1A7,#442D1C)",
              padding: "14px 24px",
              textAlign: "center",
              borderRadius: "18px",
              maxWidth: "100%",
              margin: "0 auto 12px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              Seamless Library Automation for Modern Campuses
            </h2>
          </div>

          {/* SMALLER CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // <-- smaller width
              gap: "18px", // smaller gap
              marginTop: "12px",
            }}
          >
            {[
              {
                title: "Services",
                text: "Track books, manage students, automate reminders, and more.",
              },
              {
                title: "About",
                text: "Built for schools and colleges focused on digital efficiency.",
              },
              {
                title: "Contact",
                text: "Email: support@lmsportal.com — we’re here to help.",
              },
            ].map((box) => (
              <div
                key={box.title}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "14px", // smaller
                  padding: "18px",      // smaller
                  border: "1px solid rgba(255,255,255,0.2)",
                  minHeight: "130px",    // smaller height
                }}
              >
                <h3
                  style={{
                    fontSize: "1.05rem", // smaller text
                    marginBottom: "6px",
                  }}
                >
                  {box.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.88rem", // smaller body
                    opacity: 0.9,
                    lineHeight: 1.4,
                  }}
                >
                  {box.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
