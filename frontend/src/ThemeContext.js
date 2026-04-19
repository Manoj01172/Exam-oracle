import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("exam_oracle_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("exam_oracle_theme", theme);

    // Apply CSS variables based on theme
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--bg",      "#f0f2f8");
      root.style.setProperty("--card",    "#ffffff");
      root.style.setProperty("--card2",   "#f5f6fa");
      root.style.setProperty("--border",  "#e2e4ed");
      root.style.setProperty("--border2", "#d0d3e0");
      root.style.setProperty("--text",    "#1a1d2e");
      root.style.setProperty("--text2",   "#4a5068");
      root.style.setProperty("--text3",   "#8b90a8");
    } else {
      root.style.setProperty("--bg",      "#080a12");
      root.style.setProperty("--card",    "#0e1120");
      root.style.setProperty("--card2",   "#141728");
      root.style.setProperty("--border",  "#1e2235");
      root.style.setProperty("--border2", "#252a40");
      root.style.setProperty("--text",    "#e8eaf2");
      root.style.setProperty("--text2",   "#8b90a8");
      root.style.setProperty("--text3",   "#5a5f7a");
    }
  }, [theme]);

  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <div
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        width: 36, height: 36, borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--card2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: 18, transition: "all 0.2s",
        flexShrink: 0,
      }}>
      {theme === "dark" ? "☀️" : "🌙"}
    </div>
  );
}
