const path = require("path");

module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.test.jsx", "<rootDir>/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/tests/fileMock.cjs",
    "^@assets/(.*)$": path.resolve(__dirname, "src/assets/$1"),
    "^@features/(.*)$": path.resolve(__dirname, "src/features/$1"),
    "^@shared/(.*)$": path.resolve(__dirname, "src/shared/$1"),
    "^@ui/(.*)$": path.resolve(__dirname, "src/shared/ui/$1"),
    "^@lib/(.*)$": path.resolve(__dirname, "src/lib/$1"),
    "^@hooks/(.*)$": path.resolve(__dirname, "src/hooks/$1"),
    "^@/(.*)$": path.resolve(__dirname, "src/$1"),
  },
};
