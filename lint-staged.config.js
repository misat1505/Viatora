const prettierWrite = (filenames) => {
  const chunks = [];
  const chunkSize = 20;

  for (let i = 0; i < filenames.length; i += chunkSize) {
    chunks.push(
      `prettier --write ${filenames
        .slice(i, i + chunkSize)
        .map((f) => `"${f}"`)
        .join(' ')}`,
    );
  }

  return chunks;
};

export default {
  // =========================
  // TypeScript / JavaScript
  // =========================
  '**/*.{ts,tsx,js,jsx}': [prettierWrite],

  // =========================
  // Python
  // =========================
  '**/*.py': [() => 'ruff format .', () => 'ruff check --fix'],

  // =========================
  // Java / Kotlin (Spring)
  // =========================
  '**/*.{java,kt}': [() => './gradlew spotlessApply'],

  // =========================
  // Config / Docs
  // =========================
  '**/*.{json,md,yml,yaml,css}': [prettierWrite],
};
