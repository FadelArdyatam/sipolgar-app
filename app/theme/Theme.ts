// Create a modular theming system

// Default theme colors
export type ThemeColors = {
    primary: string
    primaryDark: string
    primaryLight: string
    secondary: string
    secondaryDark: string
    secondaryLight: string
    accent: string
    background: string
    card: string
    text: string
    textSecondary: string
    border: string
    error: string
    success: string
    warning: string
    info: string
  }
  
  // Theme types
  export type ThemeName = "default" | "blue" | "green" | "purple" | "dark"
  
  // Default theme
  export const defaultTheme: ThemeColors = {
    primary: "#3b82f6", // Blue
    primaryDark: "#2563eb",
    primaryLight: "#60a5fa",
    secondary: "#10b981", // Green
    secondaryDark: "#059669",
    secondaryLight: "#34d399",
    accent: "#f59e0b", // Amber
    background: "#f9fafb",
    card: "#ffffff",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  }
  
  // Blue theme
  export const blueTheme: ThemeColors = {
    primary: "#2563eb", // Darker blue
    primaryDark: "#1d4ed8",
    primaryLight: "#3b82f6",
    secondary: "#06b6d4", // Cyan
    secondaryDark: "#0891b2",
    secondaryLight: "#22d3ee",
    accent: "#ec4899", // Pink
    background: "#f0f9ff",
    card: "#ffffff",
    text: "#1e3a8a",
    textSecondary: "#64748b",
    border: "#e5e7eb",
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  }
  
  // Green theme
  export const greenTheme: ThemeColors = {
    primary: "#059669", // Green
    primaryDark: "#047857",
    primaryLight: "#10b981",
    secondary: "#6366f1", // Indigo
    secondaryDark: "#4f46e5",
    secondaryLight: "#818cf8",
    accent: "#d946ef", // Fuchsia
    background: "#f0fdf4",
    card: "#ffffff",
    text: "#064e3b",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  }
  
  // Purple theme
  export const purpleTheme: ThemeColors = {
    primary: "#8b5cf6", // Purple
    primaryDark: "#7c3aed",
    primaryLight: "#a78bfa",
    secondary: "#f472b6", // Pink
    secondaryDark: "#ec4899",
    secondaryLight: "#f9a8d4",
    accent: "#10b981", // Green
    background: "#f5f3ff",
    card: "#ffffff",
    text: "#4c1d95",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  }
  
  // Dark theme
  export const darkTheme: ThemeColors = {
    primary: "#60a5fa", // Lighter blue for dark mode
    primaryDark: "#3b82f6",
    primaryLight: "#93c5fd",
    secondary: "#4ade80", // Green
    secondaryDark: "#22c55e",
    secondaryLight: "#86efac",
    accent: "#f472b6", // Pink
    background: "#1f2937",
    card: "#111827",
    text: "#f9fafb",
    textSecondary: "#d1d5db",
    border: "#374151",
    error: "#f87171",
    success: "#34d399",
    warning: "#fbbf24",
    info: "#60a5fa",
  }
  
  // Theme collection
  export const themes: Record<ThemeName, ThemeColors> = {
    default: defaultTheme,
    blue: blueTheme,
    green: greenTheme,
    purple: purpleTheme,
    dark: darkTheme,
  }
  
  // Default export
  export default defaultTheme
  
  