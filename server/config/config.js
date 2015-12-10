module.exports = {
  server: {
    host: '127.0.0.1',
    port: 8000
  },
  database: {
    host: '127.0.0.1',
    port: 27017,
    db: 'ContractFix',
    username: '',
    password: ''
  },
  key: {
    privateKey: 'f16fc55d48f2494d',
    tokenExpiry: 1 * 60 * 60 * 1000 //1 hour
  },
  email: {
    username: 'test@test.com',
    accountName: 'ContractFix',
    verifyEmailUrl: 'verifyEmail'
  }
};
