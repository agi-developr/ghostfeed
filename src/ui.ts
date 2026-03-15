import chalk from "chalk";

const ICONS: Record<string, string> = {
  scout: "🔍",
  strategist: "🧠",
  writer: "✍️",
  voice: "🎙️",
  visual: "🎨",
  caption: "📝",
  assemble: "🎬",
  memory: "💾",
  loop: "🔄",
  done: "✅",
  error: "❌",
  info: "ℹ️",
};

export function log(agent: string, message: string) {
  const icon = ICONS[agent] || "▸";
  const label = chalk.bold.cyan(`[${agent.toUpperCase()}]`);
  console.log(`${icon} ${label} ${message}`);
}

export function header(text: string) {
  console.log("");
  console.log(chalk.bold.magenta(`━━━ ${text} ━━━`));
  console.log("");
}

export function divider() {
  console.log(chalk.dim("─".repeat(50)));
}
