const defaultPaymentSlipDao = require('../dao/defaultPaymentSlipDao')

async function getDefaultPaymentSlip () {
  console.log('Getting default payment slip')
  const defaultPaymentSlip = await defaultPaymentSlipDao.findOne()
  console.log(`Returning default payment slip: \n${JSON.stringify(defaultPaymentSlip, null, 2)}`)
  return defaultPaymentSlip
}

async function createDefaultPaymentSlip (defaultPaymentSlip) {
  delete defaultPaymentSlip._id
  console.log(`Creating default payment slip: \n${JSON.stringify(defaultPaymentSlip, null, 2)}`)
  await defaultPaymentSlipDao.removeAll()
  await defaultPaymentSlipDao.insert(defaultPaymentSlip)
  console.log('Successfully created default payment slip')
}

module.exports = {
  getDefaultPaymentSlip: getDefaultPaymentSlip,
  createDefaultPaymentSlip: createDefaultPaymentSlip
}
