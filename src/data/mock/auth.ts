export async function mockLogin(email: string, _password: string) {
  await new Promise((r) => setTimeout(r, 800))
  return { user: { id: 'u1', name: 'Teresa Massingue', email }, jwt: 'mock-jwt' }
}

export async function mockGetProfile() {
  return { id: 'u1', name: 'Teresa Massingue', email: 'teresa.massingue@gmail.com', genres: ['Romance', 'Ficção'] }
}
