/* global __dirname */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Include the repo-root convex/_generated directory so Metro can watch and resolve
// the generated API file even though it lives outside the mobile workspace.
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, "..", "convex", "_generated"),
];

config.resolver = {
  ...(config.resolver || {}),
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules || {}),
    "@": path.resolve(__dirname, "src"),
    "@/assets": path.resolve(__dirname, "assets"),
    "convex/_generated": path.resolve(__dirname, "..", "convex", "_generated"),
    "convex/_generated/api": path.resolve(__dirname, "..", "convex", "_generated", "api.js"),
  },
  sourceExts: [...(config.resolver?.sourceExts || []), "css"],
};

module.exports = withNativewind(config, {
  inlineRem: 16,
});
