import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { authAPI } from "./services/api";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const eyePath    = "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";
const eyeOffPath = "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22";
const checkPath  = "M20 6 9 17l-5-5";
const mailPath   = "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  :root{
    --bg:#080a12;--card:#0e1120;--card2:#141728;--border:#1e2235;--border2:#252a40;
    --purple:#7c5cfc;--purple2:#5b3fd4;--teal:#00d4aa;--orange:#ff6b35;
    --text:#e8eaf2;--text2:#8b90a8;--text3:#5a5f7a;--danger:#ef4444;--success:#22c55e;
    --font:'Sora',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font);}
  .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
  .orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.12;}
  .auth-card{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:36px;width:100%;max-width:440px;position:relative;z-index:1;}
  .logo-row{display:flex;align-items:center;gap:12px;margin-bottom:28px;}
  .logo-icon{width:44px;height:44px;background:linear-gradient(135deg,#7c5cfc,#5b3fd4);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;}
  .logo-text{font-size:18px;font-weight:800;background:linear-gradient(90deg,#7c5cfc,#00d4aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .page-title{font-size:24px;font-weight:800;margin-bottom:4px;}
  .page-sub{font-size:13px;color:var(--text3);margin-bottom:24px;}
  .role-tabs{display:flex;gap:8px;margin-bottom:20px;}
  .role-tab{flex:1;padding:9px;border-radius:10px;border:1.5px solid var(--border2);text-align:center;font-size:12.5px;font-weight:600;cursor:pointer;transition:all 0.2s;color:var(--text2);}
  .role-tab.active{border-color:#7c5cfc;background:rgba(124,92,252,0.1);color:#7c5cfc;}
  .form-group{margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:600;color:var(--text2);margin-bottom:5px;display:block;}
  .form-input{width:100%;background:var(--card2);border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border 0.2s;}
  .form-input:focus{border-color:#7c5cfc;}
  .input-wrap{position:relative;}
  .input-wrap .form-input{padding-right:40px;}
  .eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text3);background:none;border:none;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;font-family:var(--font);transition:all 0.2s;margin-bottom:10px;}
  .btn:disabled{opacity:0.55;cursor:not-allowed;}
  .btn-primary{background:linear-gradient(135deg,#7c5cfc,#5b3fd4);color:#fff;box-shadow:0 4px 15px rgba(124,92,252,0.3);}
  .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,92,252,0.4);}
  .btn-google{background:#fff;color:#1f1f1f;border:1.5px solid #e5e7eb;font-weight:700;}
  .btn-google:hover:not(:disabled){background:#f9fafb;box-shadow:0 2px 8px rgba(0,0,0,0.15);}
  .btn-outline{background:transparent;border:1.5px solid var(--border2);color:var(--text2);}
  .btn-outline:hover:not(:disabled){border-color:#7c5cfc;color:#7c5cfc;}
  .divider{display:flex;align-items:center;gap:12px;margin:14px 0;}
  .divider-line{flex:1;height:1px;background:var(--border);}
  .divider-text{font-size:12px;color:var(--text3);white-space:nowrap;}
  .error-box{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#ef4444;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;display:flex;gap:8px;align-items:flex-start;}
  .success-box{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#22c55e;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;}
  .auth-switch{text-align:center;margin-top:16px;font-size:13px;color:var(--text3);}
  .auth-switch span{color:#7c5cfc;cursor:pointer;font-weight:600;}
  .auth-switch span:hover{text-decoration:underline;}
  .verify-box{text-align:center;padding:8px 0;}
  .verify-icon{width:64px;height:64px;background:rgba(0,212,170,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
  .spin{animation:spin 1s linear infinite;display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .google-logo{width:20px;height:20px;flex-shrink:0;}
  .resend-link{color:#7c5cfc;cursor:pointer;font-size:12px;text-decoration:underline;background:none;border:none;font-family:var(--font);}
  .resend-link:disabled{color:var(--text3);cursor:not-allowed;text-decoration:none;}
  @media(max-width:480px){.auth-card{padding:24px;margin:16px;}}
`;

// Google SVG logo
const GoogleLogo = () => (
  <svg className="google-logo" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Spinner component
function Spinner() {
  return <span className="spin" />;
}

// ─── MAIN AUTH COMPONENT ──────────────────────────────────────────────────────
export default function AuthPage({ onLogin }) {
  const [mode,         setMode]         = useState("login");
  const [role, setRole] = useState("student");
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoading,setGoogleLoading]= useState(false);
  const [error,        setError]        = useState("");
  const [phase,        setPhase]        = useState("form"); // "form" | "verify"
  const [pendingUser,  setPendingUser]  = useState(null);
  const [resendTimer,  setResendTimer]  = useState(0);

  const clearMessages = () => { setError(""); };

  // ── Countdown for resend button ─────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // ── Sync user to our SQLite backend ─────────────────────────────────────────
  const syncToBackend = async (firebaseUser, selectedRole) => {
    // Try login first
    try {
      await authAPI.login(firebaseUser.email, firebaseUser.uid);
    } catch {
      // Register if not exists
      try {
        await authAPI.register(
          firebaseUser.displayName || firebaseUser.email.split("@")[0],
          firebaseUser.email,
          firebaseUser.uid,
          selectedRole
        );
      } catch { /* already exists */ }
    }

    // Get actual integer ID from our database
    const usersRes = await authAPI.getAllUsers();
    const dbUser   = usersRes.users.find(u => u.email === firebaseUser.email);

    return {
      id:    dbUser ? dbUser.id : 1,   // ← Real integer ID from SQLite
      name:  firebaseUser.displayName || firebaseUser.email.split("@")[0],
      email: firebaseUser.email,
      role:  selectedRole,
      photo: firebaseUser.photoURL || null,
    };
};

  // ── Google Sign-in ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    clearMessages(); setGoogleLoading(true);
    try {
      const result      = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const userData    = await syncToBackend(firebaseUser, role);
      onLogin(userData);
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Check your internet connection.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email/Password Register ─────────────────────────────────────────────────
  const handleRegister = async () => {
    clearMessages();
    if (!name.trim())      return setError("Full name is required.");
    if (!email.trim())     return setError("Email address is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // Create Firebase account
      const credential  = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      // Set display name in Firebase
      await updateProfile(firebaseUser, { displayName: name });

      // Send verification email
      await sendEmailVerification(firebaseUser);

      // Save to our backend DB
      await syncToBackend({ ...firebaseUser, displayName: name }, role);

      // Move to verification phase
      setPendingUser({ ...firebaseUser, displayName: name, role });
      setPhase("verify");
      startResendTimer();
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email/Password Login ────────────────────────────────────────────────────
  const handleLogin = async () => {
    clearMessages();
    if (!email.trim() || !password) return setError("Email and password are required.");

    setLoading(true);
    try {
      const credential  = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      if (!firebaseUser.emailVerified) {
        // Account exists but email not verified yet
        setPendingUser({ ...firebaseUser, role });
        setPhase("verify");
        await signOut(auth);
        setLoading(false);
        return;
      }

      const userData = await syncToBackend(firebaseUser, role);
      onLogin(userData);
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("No account found with this email. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification email ────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const credential = await signInWithEmailAndPassword(auth, pendingUser.email, password);
      await sendEmailVerification(credential.user);
      await signOut(auth);
      startResendTimer();
    } catch {
      setError("Could not resend email. Please try again.");
    }
  };

  // ── Check if email is now verified ──────────────────────────────────────────
  const handleCheckVerified = async () => {
    clearMessages(); setLoading(true);
    try {
      const credential  = await signInWithEmailAndPassword(auth, pendingUser?.email || email, password);
      const firebaseUser = credential.user;

      await firebaseUser.reload();

      if (firebaseUser.emailVerified) {
        const userData = await syncToBackend(firebaseUser, role);
        onLogin(userData);
      } else {
        await signOut(auth);
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch {
      setError("Verification check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER: Email verification waiting screen ────────────────────────────
  if (phase === "verify") return (
    <>
      <style>{CSS}</style>
      <div className="auth-page">
        <div className="orb" style={{ width:400, height:400, background:"#7c5cfc", top:-100, left:-100 }} />
        <div className="orb" style={{ width:300, height:300, background:"#00d4aa", bottom:-80, right:-80 }} />
        <div className="auth-card">
          <div className="logo-row">
            <div className="logo-icon">🔮</div>
            <div>
              <div className="logo-text">Exam Oracle</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>ML Study System</div>
            </div>
          </div>

          <div className="verify-box">
            <div className="verify-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={mailPath} />
              </svg>
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Verify your email</h2>
            <p style={{ color:"var(--text3)", fontSize:13, lineHeight:1.6, marginBottom:20 }}>
              A verification link has been sent to<br />
              <strong style={{ color:"var(--text)" }}>{pendingUser?.email || email}</strong><br />
              Click the link in that email to activate your account.
            </p>

            {error && <div className="error-box">⚠️ {error}</div>}

            <div style={{ background:"var(--card2)", border:"1px solid var(--border)", borderRadius:12, padding:16, marginBottom:20, textAlign:"left" }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>Steps to verify:</div>
              {[
                "Open your inbox for " + (pendingUser?.email || email),
                "Find the email from Exam Oracle / Firebase",
                "Click the verification link in that email",
                "Come back here and click \"I have verified\" below",
              ].map((s, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:6, fontSize:12.5, color:"var(--text2)" }}>
                  <span style={{ color:"#7c5cfc", fontWeight:700, minWidth:16 }}>{i+1}.</span>
                  {s}
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleCheckVerified} disabled={loading}>
              {loading ? <Spinner /> : <><Icon path={checkPath} size={16} color="#fff" /> I have verified my email</>}
            </button>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 }}>
              <span style={{ fontSize:12, color:"var(--text3)" }}>Didn't receive the email?</span>
              <button className="resend-link" onClick={handleResend} disabled={resendTimer > 0}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend email"}
              </button>
            </div>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <button className="btn btn-outline" onClick={() => { setPhase("form"); setError(""); }}>
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ─── RENDER: Main login / register form ───────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="auth-page">
        <div className="orb" style={{ width:500, height:500, background:"#7c5cfc", top:-120, left:-120 }} />
        <div className="orb" style={{ width:400, height:400, background:"#00d4aa", bottom:-100, right:-80 }} />
        <div className="orb" style={{ width:200, height:200, background:"#ff6b35", top:"40%", right:"15%" }} />

        <div className="auth-card">
          {/* Logo */}
          <div className="logo-row">
            <div className="logo-icon">🔮</div>
            <div>
              <div className="logo-text">Exam Oracle</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>ML-Powered Study System</div>
            </div>
          </div>
{/* Role Selection */}
<div className="role-tabs">
  {[["student","🎓 Student"],["teacher","👨‍🏫 Teacher"]].map(([r,l]) => (
    <div key={r} className={`role-tab ${role===r?"active":""}`} onClick={()=>setRole(r)}>
      {l}
    </div>
  ))}
</div>
          <h2 className="page-title">
            {mode === "login" ? "Welcome back 👋" : "Create account 🚀"}
          </h2>
          <p className="page-sub">
            {mode === "login" ? "Sign in to continue your learning journey" : "Join Exam Oracle for free"}
          </p>


          {/* Google Sign-in */}
          <button className="btn btn-google" onClick={handleGoogleSignIn} disabled={googleLoading || loading}>
            {googleLoading ? <Spinner /> : <GoogleLogo />}
            {googleLoading ? "Signing in with Google..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or use email & password</span>
            <div className="divider-line" />
          </div>

          {/* Error message */}
          {error && <div className="error-box">⚠️ <span>{error}</span></div>}

          {/* Name field — register only */}
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())} />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input className="form-input" type={showPass ? "text" : "password"}
                placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())} />
              <button className="eye-btn" onClick={() => setShowPass(!showPass)}>
                <Icon path={showPass ? eyePath : eyeOffPath} size={16} color="var(--text3)" />
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            className="btn btn-primary"
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading || googleLoading}
            style={{ marginTop: 4 }}
          >
            {loading ? <Spinner /> : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          {/* Switch mode */}
          <div className="auth-switch">
            {mode === "login"
              ? <>Don't have an account? <span onClick={() => { setMode("register"); clearMessages(); }}>Sign Up</span></>
              : <>Already have an account? <span onClick={() => { setMode("login"); clearMessages(); }}>Sign In</span></>
            }
          </div>
        </div>
      </div>
    </>
  );
}
