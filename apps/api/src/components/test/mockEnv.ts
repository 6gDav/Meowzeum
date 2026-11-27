process.env.TURSO_DATABASE_URL = 'file::memory:'
process.env.SECRET_JWT = 'test-secret'
process.env.INTERNAL_API_KEY = 'test-key'

//Bun is not available in vitest (node), so we fake the used parts
const fakePassword = {
  hash: async (password: string) => `hashed:${password}`,
  verify: async (password: string, hash: string) => hash === `hashed:${password}`,
}

if (typeof Bun === 'undefined') {
  Object.defineProperty(globalThis, 'Bun', {
    configurable: true,
    value: {
      password: fakePassword,
      file: () => ({ arrayBuffer: async () => new ArrayBuffer(4) }),
    },
  })
} else {
  Object.assign(Bun.password, fakePassword)
}
