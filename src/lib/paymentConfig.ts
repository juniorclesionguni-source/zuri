// ponytail: as credenciais sandbox do M-Pesa ainda não estão configuradas no servidor
// (MPESA_API_KEY/MPESA_PUBLIC_KEY/MPESA_SERVICE_PROVIDER_CODE). Até lá, o pagamento
// corre simulado no cliente (Checkout/Processing). Assim que a Vodacom estiver ligada,
// muda para false e apaga os ramos "simulado" desses dois ecrãs.
export const PAYMENT_SIMULATED = true
