import { defineConfig } from "orval";

export default defineConfig({
  "hh.ru": {
    input: "https://api.hh.ru/openapi/specification/public",
    output: {
      mode: "split",
      client: "fetch",
      target: "src/api/orval/api.ts",
      baseUrl: "https://api.hh.ru",
      prettier: true,
      override: {
        mutator: {
          path: "src/api/orval/mutator.ts",
          name: "customFetch",
        },
      },
    },
  },
});
