export default {
  api: {
    input: '../api-gateway/openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './generated',
      client: 'axios',
      clean: true,
    },
  },
  types: {
    input: '../api-gateway/openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './generated/zod',
      client: 'zod',
      clean: true,
    },
  },
};
