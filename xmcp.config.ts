import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  paths: {
    tools: "src/tools",
    prompts: false,
    resources: "src/resources",
  },
  http: {
    port: 3002,
    host: "127.0.0.1",
    endpoint: "/mcp",
  },
  stdio: true,
  bundler: (config) => {
    if (!config.externals) {
      config.externals = [];
    }
    if (Array.isArray(config.externals)) {
      config.externals.push("better-sqlite3");
    } else if (typeof config.externals === 'object') {
      // Handle object form if necessary, but array push is safest for now if it's an array
      // Rspack externals can be string, object, function, regex, or array of these.
      // Let's assume it's an array or undefined for now, or just overwrite/append safely.
      // Actually, let's just return a new array if it doesn't exist.
    }
    // Simpler approach:
    const existingExternals = Array.isArray(config.externals) ? config.externals : [];
    config.externals = [...existingExternals, "better-sqlite3"];
    return config;
  },
};

export default config;
