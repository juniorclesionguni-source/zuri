export async function mockInitiatePayment(_phone: string, _amount: number) {
  await new Promise((r) => setTimeout(r, 500))
  return { transactionId: 'TXN-' + Date.now(), status: 'pending' }
}

export async function mockPollPayment(_txId: string): Promise<'pending' | 'active'> {
  await new Promise((r) => setTimeout(r, 2600))
  return 'active'
}
