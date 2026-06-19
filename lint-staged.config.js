{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.py": [
      "ruff format .",
      "ruff check --fix"
    ],
    "*.{java,kt}": [
      "./gradlew spotlessApply"
    ]
  }
}