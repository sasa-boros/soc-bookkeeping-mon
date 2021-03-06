const fs = require('fs');
const os = require('os')
const path = require('path');
const elerem = require('electron').remote
const app = elerem.app
const dialog = elerem.dialog
const currentWindow = elerem.getCurrentWindow()
const AutoNumeric = require('autonumeric')
import store from '@/store'

const amountNumberOptions = {
  decimalCharacter : ',',
  digitGroupSeparator : '.',
  maximumValue: 99999999,
  minimumValue: 0,
  modifyValueOnWheel: false,
  watchExternalChanges: true
}

const largeAmountNumberOptions = {
  decimalCharacter : ',',
  digitGroupSeparator : '.',
  maximumValue: 999999999,
  minimumValue: 0,
  modifyValueOnWheel: false,
  watchExternalChanges: true
}

const partitionPositionNumberOptions = {
  minimumValue: 0, 
  maximumValue: 99,
  decimalPlaces: 0,
  digitGroupSeparator: '',
  modifyValueOnWheel: false
}

function asRoman(num) {
  if (num == NaN || num == null || num == undefined) 
    return null;
  if (num <= 0) {
    return num
  }
  var digits = String(+num).split(""),
  key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
  "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
  "","I","II","III","IV","V","VI","VII","VIII","IX"],
  roman_num = "",
  i = 3;
  while (i--)
    roman_num = (key[+digits.pop() + (i * 10)] || "") + roman_num;
  return Array(+digits.join("") + 1).join("M") + roman_num;
}

function asFloat (formattedNumberAsString, numberOptions, nullAsZero) {
  if (!formattedNumberAsString || formattedNumberAsString.trim() == '') {
    if (nullAsZero) {
      return 0.0
    }
    return null
  }
  return parseFloat(AutoNumeric.unformat(formattedNumberAsString, numberOptions))
}

function asInt (formattedNumberAsString, numberOptions) {
  if (!formattedNumberAsString || formattedNumberAsString.trim() == '') {
    return null
  }
  return parseInt(AutoNumeric.unformat(formattedNumberAsString, numberOptions))
}

function asFormatedString (n, numberOptions) {
  if(n == null || n == undefined) {
    return ""
  }
  return AutoNumeric.format(n.toString(), numberOptions)
}

function numberToSerbianDinars (n) {
  if (!n || isNaN(n) || n.toString().trim() === '') {
    return null
  }
  var nFloored = Math.floor(n)
  var flooredAndDecimalStrings = n.toString().split('.')
  var flooredString = flooredAndDecimalStrings[0]
  if(flooredString == '') {
    flooredString = '0'
  }
  var decimalString
  var unitsMale
  var unitsFemale
  var tens
  var hundreds
  var scales
  var start
  var end
  var chunks = []
  var chunksLen
  var chunk
  var ints
  var i
  var word
  var words
  var paras = ''
  var dinars = ''
  /* Array of units as words */
  unitsMale = ['', 'један', 'два', 'три', 'четири', 'пет', 'шест', 'седам', 'осам', 'девет', 'десет', 'једанаест', 'дванаест', 'тринаест', 'четрнаест', 'петнаест', 'шеснаест', 'седамнаест', 'осамнаест', 'деветнаест']
  unitsFemale = ['', 'једна', 'две', 'три', 'четири', 'пет', 'шест', 'седам', 'осам', 'девет', 'десет', 'једанаест', 'дванаест', 'тринаест', 'четрнаест', 'петнаест', 'шеснаест', 'седамнаест', 'осамнаест', 'деветнаест']

  /* Array of tens as words */
  tens = ['', '', 'двадесет', 'тридесет', 'четрдесет', 'педесет', 'шездесет', 'седамдесет', 'осамдесет', 'деведесет']

  /* Array of tens as words */
  hundreds = ['', 'сто', 'двестa', 'тристa', 'четиристо', 'петсто', 'шестсто', 'седамсто', 'осамсто', 'деветсто']

  /* Array of scales as words */
  scales = ['', 'хиљад', 'милион', 'милијард', 'билион', 'билијард', 'трилион', 'трилијард', 'квадрилион', 'квадрилијард']

  if (parseInt(flooredString) === 0) {
    dinars = 'нула динара'
  } else {
    /* Split user arguemnt into 3 digit chunks from right to left */
    start = flooredString.length
    while (start > 0) {
      end = start
      chunks.push(flooredString.slice((start = Math.max(0, start - 3)), end))
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length
    if (chunksLen > scales.length) {
      return null
    }

    /* Stringify each integer in each chunk */
    words = []
    var femaleScale = false
    for (i = 0; i < chunksLen; i++) {
      chunk = parseInt(chunks[i])
      femaleScale = (i % 2 === 1)
      if (chunk) {
        /* Split chunk into array of individual integers */
        ints = chunks[i].split('').reverse().map(parseFloat)

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10
        }

        /* Add scale word if chunk is not zero and array item exists */
        if ((word = scales[i])) {
          if (femaleScale) {
            /* If scales finishes with 2,3,4
              for example: dve hiljade, tri milijarde, cetiri bilijarde */
            if (ints[0] === 2 || ints[0] === 3 || ints[0] === 4) {
              word += 'е'
            } else {
              /* If scales are thousands or scale finishes with 1
                for example: jedna hiljada, osam hiljada, jedna milijarda */
              if (i === 1 || ints[0] === 1) {
                word += 'а'
              } else {
                /* for example: osam milijardi, sto petnaest bilijardi */
                word += 'и'
              }
            }
          } else {
            /* for example: jedan trilion, dva trilionA, dvadesset trilionA */
            if (ints[0] !== 1) {
              word += 'а'
            }
          }
          words.push(word)
        }

        /* Add unit word if array item exists */
        if (femaleScale) {
          if ((word = unitsFemale[ints[0]])) {
            words.push(word)
          }
        } else {
          if ((word = unitsMale[ints[0]])) {
            words.push(word)
          }
        }

        /* Add tens word if array item exists */
        if ((word = tens[ints[1]])) {
          /* If units of the chunk are between 0 and 9, add an and */
          if (ints[0] > 0 && ints[0] <= 9) {
            words.push('и')
          }
          words.push(word)
        }

        /* Add hundreds word if array item exists */
        if ((word = hundreds[ints[2]])) {
          words.push(word)
        }
      }
    }
    var dinarWord = ' динар'
    if ((nFloored % 10 !== 1) || (nFloored % 100 === 11)) {
      dinarWord += 'а'
    }
    dinars = words.reverse().join(' ') + dinarWord
  }

  if (flooredAndDecimalStrings.length > 1) {
    decimalString = flooredAndDecimalStrings[1].substring(0, 2)
    if (decimalString.length === 1) {
      decimalString += '0'
    }
    ints = decimalString.split('').reverse().map(parseFloat)

    /* If tens integer is 1, i.e. 10, then add 10 to units integer */
    if (ints[1] === 1) {
      ints[0] += 10
    }

    /* Add tens word if array item exists */
    if ((word = tens[ints[1]])) {
      paras = paras + ' ' + word
      /* If units of the chunk are between 0 and 9, add an and */
      if (ints[0] > 0 && ints[0] <= 9) {
        paras += ' и'
      }
    }
    /* Add unit word if array item exists */
    if ((word = unitsFemale[ints[0]])) {
      paras = paras + ' ' + word
    }
    if (paras !== '') {
      paras += ' пар'
      if (ints[0] === 2 || ints[0] === 3 || ints[0] === 4) {
        paras += 'е'
      } else {
        paras += 'a'
      }
    }
  }
  return dinars + ((paras !== '') ? ', ' : '') + paras
}

function mapAnnualReportDataToAnnualReportDataForm (annualReportData, incomeCodes, outcomeCodes) {
  const annualReportDataForm = {
    transferFromPreviousYear: "",
    shareValueDepreciatedDuringYear: "",
    realEstateLandValue: "",
    realEstateBuildingsValue: "",
    realEstateLandSurface: "",
    realEstateBuildingsSurface: "",
    totalIncomePerCodePredicted: [],
    totalOutcomePerCodeAllowed: []
  }
  if (annualReportData) {
    annualReportDataForm.transferFromPreviousYear = asFormatedString(annualReportData.transferFromPreviousYear, largeAmountNumberOptions)
    annualReportDataForm.shareValueDepreciatedDuringYear = asFormatedString(annualReportData.shareValueDepreciatedDuringYear, largeAmountNumberOptions)
    annualReportDataForm.realEstateLandValue = asFormatedString(annualReportData.realEstateLandValue, largeAmountNumberOptions)
    annualReportDataForm.realEstateBuildingsValue = asFormatedString(annualReportData.realEstateBuildingsValue, largeAmountNumberOptions)
    annualReportDataForm.realEstateLandSurface = annualReportData.realEstateLandSurface ? annualReportData.realEstateLandSurface : ""
    annualReportDataForm.realEstateBuildingsSurface = annualReportData.realEstateBuildingsSurface ? annualReportData.realEstateBuildingsSurface : ""
  }
  for (let i=0; i < incomeCodes.length; i++) {
    const incomeCode = incomeCodes[i]
    incomeCode._id = undefined
    if (annualReportData && annualReportData.totalIncomePerCodePredicted) {
      let totalIncomePerCodePredicted = annualReportData.totalIncomePerCodePredicted.find(tipcp => {
        return tipcp.incomeCode.partition == incomeCode.partition && tipcp.incomeCode.position == incomeCode.position
      })
      annualReportDataForm.totalIncomePerCodePredicted.push({incomeCode: incomeCode, income: totalIncomePerCodePredicted ? asFormatedString(totalIncomePerCodePredicted.income, largeAmountNumberOptions) : ""})
    } else {
      annualReportDataForm.totalIncomePerCodePredicted.push({incomeCode: incomeCode, income: ""})
    }
  }
  for (let i=0; i < outcomeCodes.length; i++) {
    const outcomeCode = outcomeCodes[i]
    outcomeCode._id = undefined
    if (annualReportData && annualReportData.totalOutcomePerCodeAllowed) {
      let totalOutcomePerCodeAllowed = annualReportData.totalOutcomePerCodeAllowed.find(topca => {
        return topca.outcomeCode.partition == outcomeCode.partition && topca.outcomeCode.position == outcomeCode.position
      })
      annualReportDataForm.totalOutcomePerCodeAllowed.push({outcomeCode: outcomeCode, outcome: totalOutcomePerCodeAllowed ? asFormatedString(totalOutcomePerCodeAllowed.outcome, largeAmountNumberOptions) : "" })
    } else {
      annualReportDataForm.totalOutcomePerCodeAllowed.push({outcomeCode: outcomeCode, outcome: "" })
    }
  }
  return annualReportDataForm
}

function mapAnnualReportDataFormToAnnualReportData (annualReportDataForm) {
  var annualReportData = {}
  annualReportData._id = annualReportDataForm._id
  annualReportData.year = store.state.CommonValues.bookingYear
  annualReportData.totalIncomePerCodePredicted = []
  annualReportDataForm.totalIncomePerCodePredicted.forEach(tipcp => {
    annualReportData.totalIncomePerCodePredicted.push({incomeCode: tipcp.incomeCode, income: asFloat(tipcp.income, largeAmountNumberOptions)})
  })
  annualReportData.totalOutcomePerCodeAllowed = []
  annualReportDataForm.totalOutcomePerCodeAllowed.forEach(topca => {
    annualReportData.totalOutcomePerCodeAllowed.push({outcomeCode: topca.outcomeCode, outcome: asFloat(topca.outcome, largeAmountNumberOptions)})
  })
  annualReportData.transferFromPreviousYear = asFloat(annualReportDataForm.transferFromPreviousYear, largeAmountNumberOptions)
  annualReportData.shareValueDepreciatedDuringYear = asFloat(annualReportDataForm.shareValueDepreciatedDuringYear, largeAmountNumberOptions)
  annualReportData.realEstateLandValue = asFloat(annualReportDataForm.realEstateLandValue, largeAmountNumberOptions)
  annualReportData.realEstateBuildingsValue = asFloat(annualReportDataForm.realEstateBuildingsValue, largeAmountNumberOptions)
  annualReportData.realEstateLandSurface = annualReportDataForm.realEstateLandSurface
  annualReportData.realEstateBuildingsSurface = annualReportDataForm.realEstateBuildingsSurface
  return annualReportData
}

function getCodeCombinations (codes) {
  var parts = {}
  if (codes) {
    codes.forEach(function (code) {
      const part = code.partition
      const pos = code.position
      if (!parts[part]) {
        parts[part] = []
      }
      parts[part].push(pos)
    })
  }
  return parts
}

function mapCodeToCodeForm (code) {
  const codeForm = {}
  codeForm._id = code._id
  codeForm.partition = asFormatedString(code.partition, partitionPositionNumberOptions)
  codeForm.position = asFormatedString(code.position, partitionPositionNumberOptions)
  codeForm.description = code.description
  codeForm.tax = code.tax
  return codeForm
}

function mapCodeFormToCode (codeForm) {
  const code = {}
  code._id = codeForm._id
  code.year = store.state.CommonValues.bookingYear
  code.partition = asInt(codeForm.partition, partitionPositionNumberOptions)
  code.position = asInt(codeForm.position, partitionPositionNumberOptions)
  code.description = codeForm.description
  code.tax = codeForm.tax
  return code
}

function mapShareToShareForm (share) {
  const shareForm = {}
  shareForm._id = share._id
  shareForm.createdAt = share.createdAt;
  shareForm.updatedAt = share.updatedAt;
  shareForm.series = share.series
  shareForm.ordinal = share.ordinal
  shareForm.name = share.name
  shareForm.nominalValue = asFormatedString(share.nominalValue, largeAmountNumberOptions)
  return shareForm
}

function mapShareFormToShare (shareForm, year) {
  const share = {}
  share._id = shareForm._id
  share.year = store.state.CommonValues.bookingYear
  share.createdAt = shareForm.createdAt;
  share.updatedAt = shareForm.updatedAt;
  share.series = shareForm.series
  share.ordinal = shareForm.ordinal
  share.name = shareForm.name
  share.nominalValue = asFloat(shareForm.nominalValue, largeAmountNumberOptions)
  return share
}

function mapSavingToSavingForm (saving) {
  const savingForm = {}
  savingForm._id = saving._id
  savingForm.createdAt = saving.createdAt;
  savingForm.updatedAt = saving.updatedAt;
  savingForm.account = saving.account
  savingForm.savingEntity = saving.savingEntity
  savingForm.amount = asFormatedString(saving.amount, largeAmountNumberOptions)
  savingForm.amountDeposited = asFormatedString(saving.amountDeposited, largeAmountNumberOptions)
  savingForm.amountWithdrawn = asFormatedString(saving.amountWithdrawn, largeAmountNumberOptions)
  return savingForm
}

function mapSavingFormToSaving (savingForm) {
  const saving = {}
  saving._id = savingForm._id
  saving.year = store.state.CommonValues.bookingYear
  saving.createdAt = savingForm.createdAt;
  saving.updatedAt = savingForm.updatedAt;
  saving.account = savingForm.account
  saving.savingEntity = savingForm.savingEntity
  saving.name = savingForm.name
  saving.amount = asFloat(savingForm.amount, largeAmountNumberOptions)
  saving.amountDeposited = asFloat(savingForm.amountDeposited, largeAmountNumberOptions)
  saving.amountWithdrawn = asFloat(savingForm.amountWithdrawn, largeAmountNumberOptions)
  return saving
}

function mapItemToItemForm (item) {
  const itemForm = {}
  itemForm._id = item._id
  itemForm.createdAt = item.createdAt;
  itemForm.updatedAt = item.updatedAt;
  itemForm.name = item.name
  itemForm.value = asFormatedString(item.value, largeAmountNumberOptions)
  return itemForm
}

function mapItemFormToItem (itemForm) {
  const item = {}
  item._id = itemForm._id
  item.createdAt = itemForm.createdAt;
  item.updatedAt = itemForm.updatedAt;
  item.year = store.state.CommonValues.bookingYear
  item.name = itemForm.name
  item.value = asFloat(itemForm.value, largeAmountNumberOptions)
  return item
}

function mapDebtToDebtForm (debt) {
  const debtForm = {}
  debtForm._id = debt._id
  debtForm.createdAt = debt.createdAt;
  debtForm.updatedAt = debt.updatedAt;
  debtForm.description = debt.description
  debtForm.amount = asFormatedString(debt.amount, largeAmountNumberOptions)
  return debtForm
}

function mapDebtFormToDebt (debtForm) {
  const debt = {}
  debt._id = debtForm._id
  debt.createdAt = debtForm.createdAt;
  debt.updatedAt = debtForm.updatedAt;
  debt.year = store.state.CommonValues.bookingYear
  debt.description = debtForm.description
  debt.amount = asFloat(debtForm.amount, largeAmountNumberOptions)
  return debt
}

const partPosNumber = ['first', 'second', 'third', 'fourth', 'fifth']

function mapPaymentSlipToPaymentSlipForm (paymentSlip) {
  const paymentSlipForm = {};
  paymentSlipForm._id = paymentSlip._id;
  paymentSlipForm.createdAt = paymentSlip.createdAt;
  paymentSlipForm.updatedAt = paymentSlip.updatedAt;
  paymentSlipForm.isValid = paymentSlip.isValid;
  paymentSlipForm.ordinal =  paymentSlip.ordinal;
  paymentSlipForm.annualReportPage = paymentSlip.annualReportPage;
  paymentSlipForm.date = paymentSlip.date;
  // ensures reactivity
  for (let i = 0; i < partPosNumber.length; i++) {
    paymentSlipForm[partPosNumber[i] + 'Partition'] = null;
    paymentSlipForm[partPosNumber[i] + 'Position'] = null;
    paymentSlipForm[partPosNumber[i] + 'Income'] = null;
    paymentSlipForm[partPosNumber[i] + 'CodeValid'] = null
  }
  if (paymentSlip.incomePerCode) {
    for (let i = 0; i < paymentSlip.incomePerCode.length; i++) {
      paymentSlipForm[partPosNumber[i] + 'Partition'] = paymentSlip.incomePerCode[i].incomeCode.partition;
      paymentSlipForm[partPosNumber[i] + 'Position'] = paymentSlip.incomePerCode[i].incomeCode.position;
      paymentSlipForm[partPosNumber[i] + 'Income'] = asFormatedString(paymentSlip.incomePerCode[i].income, amountNumberOptions);
      paymentSlipForm[partPosNumber[i] + 'CodeValid'] = paymentSlip.incomePerCode[i].isValid
    }
  }
  paymentSlipForm.income = asFormatedString(paymentSlip.income, largeAmountNumberOptions);
  paymentSlipForm.incomeAsText = numberToSerbianDinars(paymentSlip.income);
  paymentSlipForm.town = paymentSlip.town;
  paymentSlipForm.townReceived = paymentSlip.townReceived;
  paymentSlipForm.reason = paymentSlip.reason;
  paymentSlipForm.payed = paymentSlip.payed;

  return paymentSlipForm;
}

function mapPaymentSlipFormToPaymentSlip(paymentSlipForm, incomeCodes, nullAsZero) {
  var paymentSlip = {};
  paymentSlip._id = paymentSlipForm._id;
  paymentSlip.createdAt = paymentSlipForm.createdAt;
  paymentSlip.updatedAt = paymentSlipForm.updatedAt;
  paymentSlip.isValid = paymentSlipForm.isValid;
  paymentSlip.date = paymentSlipForm.date;
  paymentSlip.year = store.state.CommonValues.bookingYear
  paymentSlip.income = asFloat(paymentSlipForm.income, largeAmountNumberOptions, nullAsZero);
  paymentSlip.town = paymentSlipForm.town;
  paymentSlip.townReceived = paymentSlipForm.townReceived;
  paymentSlip.reason = paymentSlipForm.reason;
  paymentSlip.payed = paymentSlipForm.payed;
  paymentSlip.incomePerCode = [];
  for (let i = 0; i < partPosNumber.length; i++) {
    let ic = incomeCodes.find(incomeCode => {
      return incomeCode.partition == paymentSlipForm[partPosNumber[i] + 'Partition'] && incomeCode.position == paymentSlipForm[partPosNumber[i] + 'Position'];
    })
    if (ic) {
      paymentSlip.incomePerCode.push({incomeCode: ic, income: asFloat(paymentSlipForm[partPosNumber[i] + 'Income'], amountNumberOptions, nullAsZero)});
    }
  }
  return paymentSlip;
}

function mapReceiptToReceiptForm (receipt) {
    const receiptForm = {};
    receiptForm._id = receipt._id;
    receiptForm.createdAt = receipt.createdAt;
    receiptForm.updatedAt = receipt.updatedAt;
    receiptForm.isValid = receipt.isValid;
    receiptForm.ordinal =  receipt.ordinal;
    receiptForm.annualReportPage = receipt.annualReportPage;
    receiptForm.date = receipt.date;
    receiptForm.isValid = receipt.isValid;
    // ensures reactivity
    for (let i = 0; i < partPosNumber.length; i++) {
      receiptForm[partPosNumber[i] + 'Partition'] = null;
      receiptForm[partPosNumber[i] + 'Position'] = null;
      receiptForm[partPosNumber[i] + 'Outcome'] = null;
      receiptForm[partPosNumber[i] + 'CodeValid'] = null
    }
    if (receipt.outcomePerCode) {
      for (let i = 0; i < receipt.outcomePerCode.length; i++) {
        receiptForm[partPosNumber[i] + 'Partition'] = receipt.outcomePerCode[i].outcomeCode.partition;
        receiptForm[partPosNumber[i] + 'Position'] = receipt.outcomePerCode[i].outcomeCode.position;
        receiptForm[partPosNumber[i] + 'Outcome'] = asFormatedString(receipt.outcomePerCode[i].outcome, amountNumberOptions);
        receiptForm[partPosNumber[i] + 'CodeValid'] = receipt.outcomePerCode[i].isValid
      }
    }
    receiptForm.outcome = asFormatedString(receipt.outcome, largeAmountNumberOptions);
    receiptForm.outcomeAsText = numberToSerbianDinars(receipt.outcome);
    receiptForm.churchMunicipality = receipt.churchMunicipality;
    receiptForm.town = receipt.town;
    receiptForm.reason = receipt.reason;
    receiptForm.townPayed = receipt.townPayed;
    receiptForm.received = receipt.received;

    return receiptForm;
}

function mapReceiptFormToReceipt (receiptForm, outcomeCodes, nullAsZero) {
    var receipt = {};
    receipt._id = receiptForm._id;
    receipt.createdAt = receiptForm.createdAt;
    receipt.updatedAt = receiptForm.updatedAt;
    receipt.isValid = receiptForm.isValid;
    receipt.date = receiptForm.date;
    receipt.year = store.state.CommonValues.bookingYear
    receipt.outcome = asFloat(receiptForm.outcome, largeAmountNumberOptions, nullAsZero);
    receipt.churchMunicipality = receiptForm.churchMunicipality;
    receipt.town = receiptForm.town;
    receipt.reason = receiptForm.reason;
    receipt.townPayed = receiptForm.townPayed;
    receipt.received = receiptForm.received;
    receipt.outcomePerCode = [];
    for (let i = 0; i < partPosNumber.length; i++) {
      let oc = outcomeCodes.find(outcomeCode => {
        return outcomeCode.partition == receiptForm[partPosNumber[i] + 'Partition'] && outcomeCode.position == receiptForm[partPosNumber[i] + 'Position'];
      })
      if (oc) {
        receipt.outcomePerCode.push({outcomeCode: oc, outcome: asFloat(receiptForm[partPosNumber[i] + 'Outcome'], amountNumberOptions, nullAsZero)});
      }
    }
    return receipt;
}

function saveAs (pathToFile, fileName, callback) {
  const localPath = path.join(os.homedir(), 'Desktop', fileName)
  const userChosenPath = dialog.showSaveDialog(currentWindow, { defaultPath: localPath })
  const fullPathToFile = path.join(app.getPath('userData'), pathToFile)
  if (userChosenPath) {
    fs.rename(fullPathToFile, userChosenPath, err => {
      if (err) {
        if (err.code === 'EXDEV') {
            copy(fullPathToFile, userChosenPath, callback);
        } else {
            callback(err);
        }
        return;
      }
      callback();
    })
  }
}

function open (filters) {
  const userChosenPath = dialog.showOpenDialog(currentWindow, { filters: filters })
  return userChosenPath
}

function copy(pathToFile, userChosenPath, callback) {
  var readStream = fs.createReadStream(pathToFile);
  var writeStream = fs.createWriteStream(userChosenPath);

  readStream.on('error', callback);
  writeStream.on('error', callback);

  readStream.on('close', function () {
      fs.unlink(pathToFile, callback);
  });

  readStream.pipe(writeStream);
}

function reloadApp () {
  currentWindow.reload()
}

module.exports = {
  asRoman: asRoman,
  amountNumberOptions: amountNumberOptions,
  largeAmountNumberOptions: largeAmountNumberOptions,
  partitionPositionNumberOptions: partitionPositionNumberOptions,
  asFloat: asFloat,
  asInt: asInt,
  asFormatedString: asFormatedString,
  numberToSerbianDinars: numberToSerbianDinars,
  getCodeCombinations: getCodeCombinations,
  mapAnnualReportDataToAnnualReportDataForm: mapAnnualReportDataToAnnualReportDataForm,
  mapAnnualReportDataFormToAnnualReportData: mapAnnualReportDataFormToAnnualReportData,
  mapCodeToCodeForm: mapCodeToCodeForm,
  mapCodeFormToCode: mapCodeFormToCode,
  mapPaymentSlipToPaymentSlipForm: mapPaymentSlipToPaymentSlipForm,
  mapPaymentSlipFormToPaymentSlip: mapPaymentSlipFormToPaymentSlip,
  mapReceiptToReceiptForm, mapReceiptToReceiptForm,
  mapReceiptFormToReceipt: mapReceiptFormToReceipt,
  mapShareToShareForm: mapShareToShareForm,
  mapShareFormToShare: mapShareFormToShare,
  mapSavingToSavingForm: mapSavingToSavingForm,
  mapSavingFormToSaving: mapSavingFormToSaving,
  mapItemToItemForm: mapItemToItemForm,
  mapItemFormToItem: mapItemFormToItem,
  mapDebtToDebtForm: mapDebtToDebtForm,
  mapDebtFormToDebt: mapDebtFormToDebt,
  saveAs: saveAs,
  open: open,
  reloadApp: reloadApp
}