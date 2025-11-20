// Extend the NodeJS.ProcessEnv interface to include API_KEY.
// This merges with the existing declaration from @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
