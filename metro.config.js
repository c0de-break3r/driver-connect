const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver = {
  ...(config.resolver || {}),
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules || {}),
    "@": path.resolve(__dirname, "src"),
    "@/assets": path.resolve(__dirname, "assets"),
  },
  sourceExts: [...(config.resolver?.sourceExts || []), "css"],
};

module.exports = withNativewind(config);
