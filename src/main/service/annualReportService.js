const { AnnualReport } = require('../model/annualReport/annualReport')
const { IncomePage } = require('../model/annualReport/incomePage')
const { OutcomePage } = require('../model/annualReport/outcomePage')
const { TotalIncomePage } = require('../model/annualReport/totalIncomePage')
const { TotalOutcomePage } = require('../model/annualReport/totalOutcomePage')
const { SharesPage } = require('../model/annualReport/sharesPage')
const { TotalPage } = require('../model/annualReport/totalPage')
const annualReportCommonDao = require('../dao/annualReportCommonDao')
const annualReportDao = require('../dao/annualReportDao')
const incomeCodeDao = require('../dao/incomeCodeDao')
const outcomeCodeDao = require('../dao/outcomeCodeDao')
const paymentSlipDao = require('../dao/paymentSlipDao')
const receiptDao = require('../dao/receiptDao')
const shareDao = require('../dao/shareDao')
const savingDao = require('../dao/savingDao')
const itemDao = require('../dao/itemDao')
const debtDao = require('../dao/debtDao')

const { app } = require('electron')
const Big = require('big.js')
const fs = require('fs');
const path = require('path')
const Mustache = require('mustache');
const i18n = require('../../translations/i18n')
const AutoNumeric = require('autonumeric')

const { degrees, PDFDocument } = require('pdf-lib')

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

async function getAnnualReportCommonData () {
  console.log('Getting annual report common data')
  const common = await annualReportCommonDao.findOne()
  console.log(`Returning annual report common data: \n${JSON.stringify(common, null, 2)}`)
  return common
}

async function getAnnualReportData (year) {
  console.log(`Getting annual report data for year ${year}`)
  const annualReportData = await annualReportDao.findOneForYear(year)
  console.log(`Returning annual report data: \n${JSON.stringify(annualReportData, null, 2)}`)
  return annualReportData
}

async function createAnnualReportCommonData (common) {
  delete common._id
  console.log(`Creating annual report common data: \n${JSON.stringify(common, null, 2)}`)
  await annualReportCommonDao.removeAll(common)
  await annualReportCommonDao.insert(common)
  console.log('Successfully created annual report common data')
}

async function createAnnualReportData (annualReportData) {
  delete annualReportData._id
  console.log(`Creating annual report data: \n${JSON.stringify(annualReportData, null, 2)}`)
  await annualReportDao.removeOneForYear(annualReportData.year)
  await annualReportDao.insert(annualReportData)
  console.log('Successfully created annual report data')
}

async function getAnnualReport (year) {
  console.log(`Getting annual report for year ${year}`)
  const annualReportCommonData = await getAnnualReportCommonData()
  const annualReportData = await getAnnualReportData(year)
  const incomeCodes = await incomeCodeDao.findAll()
  const outcomeCodes = await outcomeCodeDao.findAll()
  const shares = await shareDao.findAllForYear(year)
  const savings = await savingDao.findAllForYear(year)
  const items = await itemDao.findAllForYear(year)
  const debts = await debtDao.findAllForYear(year)
  
  const annualReport = new AnnualReport()
  // common
  annualReport.year = year
  annualReport.churchMunicipality = annualReportCommonData ? annualReportCommonData.churchMunicipality : null
  annualReport.churchTown = annualReportCommonData ? annualReportCommonData.churchTown : null
  annualReport.incomeCodes = incomeCodes ? incomeCodes : []
  annualReport.outcomeCodes = outcomeCodes ? outcomeCodes : []
  // total income page
  annualReport.totalIncomePage = new TotalIncomePage()
  annualReport.totalIncomePage.totalIncomePerCodePredicted = annualReportData && annualReportData.totalIncomePerCodePredicted ? annualReportData.totalIncomePerCodePredicted : []
  annualReport.totalIncomePage.totalIncomePerCodePredicted.forEach(ipcp => {
    annualReport.totalIncomePage.totalIncomePredicted = annualReport.totalIncomePage.totalIncomePredicted.plus(ipcp.income ? Big(ipcp.income) : Big(0.0))
  })
  // total outcome page
  annualReport.totalOutcomePage = new TotalOutcomePage()
  annualReport.totalOutcomePage.totalOutcomePerCodeAllowed = annualReportData && annualReportData.totalOutcomePerCodeAllowed ? annualReportData.totalOutcomePerCodeAllowed : []
  annualReport.totalOutcomePage.totalOutcomePerCodeAllowed.forEach(opca => {
    annualReport.totalOutcomePage.totalOutcomeAllowed = annualReport.totalOutcomePage.totalOutcomeAllowed.plus(opca.outcome ? Big(opca.outcome) : Big(0.0))
  })
  annualReport.totalOutcomePage.transferFromPreviousYear = annualReportData && annualReportData.transferFromPreviousYear ? Big(annualReportData.transferFromPreviousYear) : Big(0.0)
  // shares page
  annualReport.sharesPage = new SharesPage()
  annualReport.sharesPage.shares = shares ? shares : []
  annualReport.sharesPage.savings = savings ? savings : []
  annualReport.sharesPage.shares.forEach(s => {
    annualReport.sharesPage.totalNominalValue = annualReport.sharesPage.totalNominalValue.plus(s.nominalValue ? Big(s.nominalValue) : Big(0.0))
  })
  annualReport.sharesPage.shareValueDepreciatedDuringYear = annualReportData && annualReportData.shareValueDepreciatedDuringYear ? Big(annualReportData.shareValueDepreciatedDuringYear) : Big(0.0)
  annualReport.sharesPage.nominalValueOnYearEnd = annualReport.sharesPage.totalNominalValue.minus(annualReport.sharesPage.shareValueDepreciatedDuringYear)
  annualReport.sharesPage.savings.forEach(s => {
    annualReport.sharesPage.totalSavingAmountAtYearStart = annualReport.sharesPage.totalSavingAmountAtYearStart.plus(s.amount ? Big(s.amount) : Big(0.0))
    annualReport.sharesPage.totalSavingAmountDeposited = annualReport.sharesPage.totalSavingAmountDeposited.plus(s.amountDeposited ? Big(s.amountDeposited) : Big(0.0))
    annualReport.sharesPage.totalSavingAmountWithdrawn = annualReport.sharesPage.totalSavingAmountWithdrawn.plus(s.amountWithdrawn ? Big(s.amountWithdrawn) : Big(0.0))
  })
  annualReport.sharesPage.totalSavingAmountPlusDeposited = annualReport.sharesPage.totalSavingAmountAtYearStart.plus(annualReport.sharesPage.totalSavingAmountDeposited)
  annualReport.sharesPage.savingAmountOnYearEnd = annualReport.sharesPage.totalSavingAmountPlusDeposited.minus(annualReport.sharesPage.totalSavingAmountWithdrawn)
  // total page
  annualReport.totalPage = new TotalPage()
  annualReport.totalPage.items = items ? items : []
  annualReport.totalPage.debts = debts ? debts : []
  annualReport.totalPage.realEstateLandValue = annualReportData && annualReportData.realEstateLandValue ? Big(annualReportData.realEstateLandValue) : Big(0.0)
  annualReport.totalPage.realEstateLandSurface= annualReportData ? annualReportData.realEstateLandSurface : null
  annualReport.totalPage.realEstateBuildingsValue = annualReportData && annualReportData.realEstateBuildingsValue ? Big(annualReportData.realEstateBuildingsValue) : Big(0.0)
  annualReport.totalPage.realEstateBuildingsSurface= annualReportData ? annualReportData.realEstateBuildingsSurface : null
  annualReport.totalPage.items.forEach(i => {
    annualReport.totalPage.totalItemValue = annualReport.totalPage.totalItemValue.plus(i.value ? Big(i.value) : Big(0.0))
  })
  annualReport.totalPage.debts.forEach(d => {
    annualReport.totalPage.totalDebt = annualReport.totalPage.totalDebt.plus(d.amount ? Big(d.amount) : Big(0.0))
  })

  for (let i = 0; i < 12; i++) {
    const incomePage = new IncomePage()
    const outcomePage = new OutcomePage()
    incomePage.ordinal = i + 1
    outcomePage.ordinal = incomePage.ordinal

    const paymentSlips = await paymentSlipDao.findBetweenDatesSortByOrdinalAsc(new Date(year, i, 1), new Date(year, i + 1, 1))
    const receipts = await receiptDao.findBetweenDatesSortByOrdinalAsc(new Date(year, i, 1), new Date(year, i + 1, 1))
    
    var paymentSlipsValid = checkIfEntitiesAreValid(paymentSlips)
    var receiptsValid = checkIfEntitiesAreValid(receipts)

    if (!paymentSlipsValid || !receiptsValid) {
      throw new Error('Invalid payment slips or receipts found')
    } 
    if (paymentSlips) {
      calculateIncomes(incomePage, annualReport, paymentSlips)
    }
    if (receipts) {
      calculateOutcomes(outcomePage, annualReport, receipts)
    }
    if (i !== 0) {
      incomePage.transferFromPreviousMonth = annualReport.outcomePages[i - 1].transferToNextMonth
    }
    incomePage.total = incomePage.totalIncome.plus(incomePage.transferFromPreviousMonth)
    outcomePage.total = incomePage.total
    outcomePage.transferToNextMonth = outcomePage.total.minus(outcomePage.totalOutcome)

    annualReport.incomePages.push(incomePage)
    annualReport.outcomePages.push(outcomePage)
  }
  annualReport.totalOutcomePage.netIncome = annualReport.totalIncomePage.totalIncome.minus(annualReport.totalOutcomePage.totalOutcome)
  annualReport.totalOutcomePage.transferToNextYear = annualReport.totalOutcomePage.netIncome.plus(annualReport.totalOutcomePage.transferFromPreviousYear)
  annualReport.totalPage.totalPropertyValue = annualReport.totalOutcomePage.transferToNextYear.plus(annualReport.sharesPage.nominalValueOnYearEnd).plus(annualReport.sharesPage.savingAmountOnYearEnd).plus(annualReport.totalPage.realEstateLandValue).plus(annualReport.totalPage.realEstateBuildingsValue).plus(annualReport.totalPage.totalItemValue)
  annualReport.totalPage.propertyValue = annualReport.totalPage.totalPropertyValue.minus(annualReport.totalPage.totalDebt)

  transformBigsToNumbers(annualReport);
  console.log(`Returning annual report: \n${JSON.stringify(annualReport, null, 2)}`)
  return annualReport
}

function checkIfEntitiesAreValid(entities) {
  if(!entities) {
    return true
  }
  for (let j=0; j < entities.length; j++) {
    if (!entities[j].isValid) {
      return false
    }
  }
  return true
}

function calculateIncomes (incomePage, annualReport, paymentSlips) {
  incomePage.paymentSlips = paymentSlips
  paymentSlips.forEach(ps => {
    incomePage.totalIncome = incomePage.totalIncome.plus(ps.income ? Big(ps.income) : Big(0.0))
    ps.incomePerCode.forEach(opc => {
      const pageTotalIncomePerCode = incomePage.totalIncomePerCode.find((tipc) => {
        return tipc.incomeCode.partition === opc.incomeCode.partition && tipc.incomeCode.position === opc.incomeCode.position
      })
      if (pageTotalIncomePerCode) {
        pageTotalIncomePerCode.income = pageTotalIncomePerCode.income.plus(opc.income ? Big(opc.income) : Big(0.0))
      } else {
        incomePage.totalIncomePerCode.push({ incomeCode: opc.incomeCode, income: Big(opc.income) })
      }
      const reportTotalIncomePerCode = annualReport.totalIncomePage.totalIncomePerCode.find((tipc) => {
        return tipc.incomeCode.partition === opc.incomeCode.partition && tipc.incomeCode.position === opc.incomeCode.position
      })
      if (reportTotalIncomePerCode) {
        reportTotalIncomePerCode.income = reportTotalIncomePerCode.income.plus(opc.income ? Big(opc.income) : Big(0.0))
      } else {
        annualReport.totalIncomePage.totalIncomePerCode.push({ incomeCode: opc.incomeCode, income: Big(opc.income) })
      }
    })
  })
  annualReport.totalIncomePage.totalIncome = annualReport.totalIncomePage.totalIncome.plus(incomePage.totalIncome)
}

function calculateOutcomes (outcomePage, annualReport, receipts) {
  outcomePage.receipts = receipts
  receipts.forEach((r) => {
    outcomePage.totalOutcome = outcomePage.totalOutcome.plus(r.outcome ? Big(r.outcome) : Big(0.0))
    r.outcomePerCode.forEach((opc) => {
      const pageTotalOutcomePerCode = outcomePage.totalOutcomePerCode.find((topc) => {
        return topc.outcomeCode.partition === opc.outcomeCode.partition && topc.outcomeCode.position === opc.outcomeCode.position
      })
      if (pageTotalOutcomePerCode) {
        pageTotalOutcomePerCode.outcome = pageTotalOutcomePerCode.outcome.plus(opc.outcome ? Big(opc.outcome) : Big(0.0))
      } else {
        outcomePage.totalOutcomePerCode.push({ outcomeCode: opc.outcomeCode, outcome: Big(opc.outcome) })
      }
      const reportTotalOutcomePerCode = annualReport.totalOutcomePage.totalOutcomePerCode.find((topc) => {
        return topc.outcomeCode.partition === opc.outcomeCode.partition && topc.outcomeCode.position === opc.outcomeCode.position
      })
      if (reportTotalOutcomePerCode) {
        reportTotalOutcomePerCode.outcome = reportTotalOutcomePerCode.outcome.plus(opc.outcome ? Big(opc.outcome) : Big(0.0))
      } else {
        annualReport.totalOutcomePage.totalOutcomePerCode.push({ outcomeCode: opc.outcomeCode, outcome: Big(opc.outcome) })
      }
    })
  })
  annualReport.totalOutcomePage.totalOutcome = annualReport.totalOutcomePage.totalOutcome.plus(outcomePage.totalOutcome)
}

function transformBigsToNumbers(annualReport) {
  for(let i=0; i<annualReport.incomePages.length; i++) {
    const incomePage = annualReport.incomePages[i]
    for(let j=0; j<incomePage.totalIncomePerCode.length; j++) {
      incomePage.totalIncomePerCode[j].income = parseFloat(incomePage.totalIncomePerCode[j].income)
    }
    incomePage.totalIncome = parseFloat(incomePage.totalIncome)
    incomePage.transferFromPreviousMonth = parseFloat(incomePage.transferFromPreviousMonth);
    incomePage.total = parseFloat(incomePage.total)
  }
  for(let i=0; i<annualReport.outcomePages.length; i++) {
    const outcomePage = annualReport.outcomePages[i]
    for(let j=0; j<outcomePage.totalOutcomePerCode.length; j++) {
      outcomePage.totalOutcomePerCode[j].outcome = parseFloat(outcomePage.totalOutcomePerCode[j].outcome)
    }
    outcomePage.totalOutcome = parseFloat(outcomePage.totalOutcome)
    outcomePage.transferToNextMonth = parseFloat(outcomePage.transferToNextMonth)
    outcomePage.total = parseFloat(outcomePage.total)
  }
  for(let i=0; i<annualReport.totalIncomePage.totalIncomePerCode.length; i++) {
    annualReport.totalIncomePage.totalIncomePerCode[i].income = parseFloat(annualReport.totalIncomePage.totalIncomePerCode[i].income)
  }
  for(let i=0; i<annualReport.totalIncomePage.totalIncomePerCodePredicted.length; i++) {
    annualReport.totalIncomePage.totalIncomePerCodePredicted[i].income = parseFloat(annualReport.totalIncomePage.totalIncomePerCodePredicted[i].income)
  }
  annualReport.totalIncomePage.totalIncomePredicted = parseFloat(annualReport.totalIncomePage.totalIncomePredicted)
  annualReport.totalIncomePage.totalIncome = parseFloat(annualReport.totalIncomePage.totalIncome)
  for(let i=0; i<annualReport.totalOutcomePage.totalOutcomePerCode.length; i++) {
    annualReport.totalOutcomePage.totalOutcomePerCode[i].outcome = parseFloat(annualReport.totalOutcomePage.totalOutcomePerCode[i].outcome)
  }
  for(let i=0; i<annualReport.totalOutcomePage.totalOutcomePerCodeAllowed.length; i++) {
    annualReport.totalOutcomePage.totalOutcomePerCodeAllowed[i].outcome = parseFloat(annualReport.totalOutcomePage.totalOutcomePerCodeAllowed[i].outcome)
  }
  annualReport.totalOutcomePage.totalOutcomeAllowed = parseFloat(annualReport.totalOutcomePage.totalOutcomeAllowed)
  annualReport.totalOutcomePage.totalOutcome = parseFloat(annualReport.totalOutcomePage.totalOutcome)
  annualReport.totalOutcomePage.netIncome = parseFloat(annualReport.totalOutcomePage.netIncome)
  annualReport.totalOutcomePage.transferFromPreviousYear = parseFloat(annualReport.totalOutcomePage.transferFromPreviousYear)
  annualReport.totalOutcomePage.transferToNextYear = parseFloat(annualReport.totalOutcomePage.transferToNextYear)

  annualReport.sharesPage.totalNominalValue = parseFloat(annualReport.sharesPage.totalNominalValue)
  annualReport.sharesPage.shareValueDepreciatedDuringYear = parseFloat(annualReport.sharesPage.shareValueDepreciatedDuringYear)
  annualReport.sharesPage.nominalValueOnYearEnd = parseFloat(annualReport.sharesPage.nominalValueOnYearEnd)
  annualReport.sharesPage.totalSavingAmountAtYearStart = parseFloat(annualReport.sharesPage.totalSavingAmountAtYearStart)
  annualReport.sharesPage.totalSavingAmountDeposited = parseFloat(annualReport.sharesPage.totalSavingAmountDeposited)
  annualReport.sharesPage.totalSavingAmountPlusDeposited = parseFloat(annualReport.sharesPage.totalSavingAmountPlusDeposited)
  annualReport.sharesPage.totalSavingAmountWithdrawn = parseFloat(annualReport.sharesPage.totalSavingAmountWithdrawn)
  annualReport.sharesPage.savingAmountOnYearEnd = parseFloat(annualReport.sharesPage.savingAmountOnYearEnd)

  annualReport.totalPage.realEstateLandValue = parseFloat(annualReport.totalPage.realEstateLandValue)
  annualReport.totalPage.realEstateBuildingsValue = parseFloat(annualReport.totalPage.realEstateBuildingsValue)
  annualReport.totalPage.totalItemValue = parseFloat(annualReport.totalPage.totalItemValue)
  annualReport.totalPage.totalPropertyValue = parseFloat(annualReport.totalPage.totalPropertyValue)
  annualReport.totalPage.totalDebt = parseFloat(annualReport.totalPage.totalDebt)
  annualReport.totalPage.propertyValue = parseFloat(annualReport.totalPage.propertyValue)
}

const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
]

const headlineTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/headline.html"), { encoding: 'utf8'});
Mustache.parse(headlineTemplate)
const manualPageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/manual-page.html"), { encoding: 'utf8'});
Mustache.parse(manualPageTemplate)
const incomePageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/income-page.html"), { encoding: 'utf8'})
Mustache.parse(incomePageTemplate)
const outcomePageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/outcome-page.html"), { encoding: 'utf8'})
Mustache.parse(outcomePageTemplate)
const totalIncomePageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/total-income-page.html"), { encoding: 'utf8'})
Mustache.parse(totalIncomePageTemplate)
const totalOutcomePageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/total-outcome-page.html"), { encoding: 'utf8'});
Mustache.parse(totalOutcomePageTemplate)
const sharesPageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/shares-page.html"), { encoding: 'utf8'})
Mustache.parse(sharesPageTemplate)
const totalPageTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/total-page.html"), { encoding: 'utf8'});
Mustache.parse(totalPageTemplate)
const totalHeadlineTemplate = fs.readFileSync(path.join(__static, "/templates/annual-report/total-headline.html"), { encoding: 'utf8'});
Mustache.parse(totalHeadlineTemplate)

async function getAnnualReportPages (annualReport) {
  console.log('Getting annual report pages')
  const annualReportPages = []
  
  populateHeadline(annualReport, annualReportPages)
  populateManualPage(annualReport, annualReportPages)

  var i = 0
  while (i < annualReport.incomePages.length || i < annualReport.outcomePages.length) {
    if (i < annualReport.incomePages.length) {
      populateIncomePage(annualReport, annualReport.incomePages[i], annualReportPages, 0, i + 1)
    }
    if (i < annualReport.outcomePages.length) {
      populateOutcomePage(annualReport, annualReport.outcomePages[i], annualReportPages, 0, i + 1)
    }
    i++
  }
  populateTotalIncomePage(annualReport, annualReportPages)
  populateTotalOutcomePage(annualReport, annualReportPages)
  populateSharesPage(annualReport, annualReportPages, 0, 0)
  populateTotalPage(annualReport, annualReportPages, 0, 0)
  populateTotalHeadline(annualReport, annualReportPages)

  console.log(`Returning annual report ${annualReportPages.length} pages`)
  return annualReportPages
}

function populateHeadline(annualReport, annualReportPages) {
  const headlineContext = {};
  if (!annualReport.year) {
    headlineContext.year = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  } else {
    headlineContext.year = annualReport.year;
  }
  headlineContext.church = annualReport.churchMunicipality
  headlineContext.pageNum = 0

  annualReportPages.push(Mustache.render(headlineTemplate, headlineContext));
}

function populateManualPage(annualReport, annualReportPages) {
  annualReportPages.push(manualPageTemplate);
}

function populateIncomePage (annualReport, incomePage, annualReportPages, paymentSlipStartIndex, pageNum) {
  var incomePageContext = {};
  incomePageContext.pageNum = pageNum
  incomePageContext.page = incomePage.ordinal;
  incomePageContext.monthLokativ = i18n.getTranslation(monthNames[incomePage.ordinal-1] + '.lokativ');

  var colsPerIncomeCodes = {}
  var col = 'D';
  // income codes
  annualReport.incomeCodes.forEach(ic => {
    incomePageContext[col+'6'] = asRoman(ic.partition) + '/' + ic.position;
    incomePageContext[col+'7'] = ic.description;
    colsPerIncomeCodes[ic.partition + '/' + ic.position] = col;
    col = String.fromCharCode(col.charCodeAt() + 1);
  });
  var row = 14;
  for (let i = paymentSlipStartIndex; i < incomePage.paymentSlips.length; i++) {
    if (row >= 41) {
      annualReportPages.push(Mustache.render(incomePageTemplate, incomePageContext));
      populateIncomePage(annualReport, incomePage, annualReportPages, i)
      return
    }
    const paymentSlip = incomePage.paymentSlips[i]
    // payment slip ordinal/date(day)/reason
    incomePageContext['A'+row] = paymentSlip.ordinal;
    let date = new Date(paymentSlip.date).getUTCDate();
    incomePageContext['B'+row] = date ? date + '.' : date;
    incomePageContext['C'+row] = paymentSlip.reason;
    // payment slip income per code
    paymentSlip.incomePerCode.forEach(ipc => {
      let incomeCodeText = ipc.incomeCode.partition + '/' + ipc.incomeCode.position;
      incomePageContext[colsPerIncomeCodes[incomeCodeText] + row] = formatAmount(ipc.income);
    });
    // payment slip total income
    incomePageContext['S'+row] = formatAmount(paymentSlip.income)
    row++;
  }
  // total per income code
  incomePage.totalIncomePerCode.forEach(tipc => {
    let incomeCodeText = tipc.incomeCode.partition + '/' + tipc.incomeCode.position;
    incomePageContext[colsPerIncomeCodes[incomeCodeText] + 41] = formatAmount(tipc.income);
  });
  // total incomes per page
  incomePageContext['S41'] = formatAmount(incomePage.totalIncome);
  incomePageContext['S42'] = formatAmount(incomePage.transferFromPreviousMonth);
  incomePageContext['S43'] = formatAmount(incomePage.total);

  annualReportPages.push(Mustache.render(incomePageTemplate, incomePageContext));
}

function populateOutcomePage (annualReport, outcomePage, annualReportPages, receiptStartIndex, pageNum) {
  var outcomePageContext = {};
  outcomePageContext.pageNum = pageNum
  outcomePageContext.page = outcomePage.ordinal;
  if (!annualReport.year) {
    outcomePageContext.year = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  } else {
    outcomePageContext.year = annualReport.year;
  }
  var colsPerOutcomeCodes = {}
  var col = 'D';
   // outcome codes
   annualReport.outcomeCodes.forEach(oc => {
    outcomePageContext[col+'6'] = asRoman(oc.partition) + '/' + oc.position;
    outcomePageContext[col+'7'] = oc.description;
    colsPerOutcomeCodes[oc.partition + '/' + oc.position] = col;
    col = String.fromCharCode(col.charCodeAt() + 1);
  });
  var row = 14;
  for (let i = receiptStartIndex; i < outcomePage.receipts.length; i++) {
    if (row >= 41) {
      annualReportPages.push(Mustache.render(outcomePageTemplate, outcomePageContext));
      populateOutcomePage(annualReport, outcomePage, annualReportPages, i)
      return
    }
    const receipt = outcomePage.receipts[i]
     // receipt ordinal/date(day)/reason
    outcomePageContext['A'+row] = receipt.ordinal;
    let date = new Date(receipt.date).getUTCDate();
    outcomePageContext['B'+row] = date ? date + '.' : date;
    outcomePageContext['C'+row] = receipt.reason;
    // receipt outcome per code
    receipt.outcomePerCode.forEach(opc => {
      let outcomeCodeText = opc.outcomeCode.partition + '/' + opc.outcomeCode.position;
      outcomePageContext[colsPerOutcomeCodes[outcomeCodeText] + row] = formatAmount(opc.outcome);
    });
    // receipt total outcome
    outcomePageContext['T'+row] = formatAmount(receipt.outcome)
    row++;
  }
  // total per outcome code
  outcomePage.totalOutcomePerCode.forEach(topc => {
    let outcomeCodeText = topc.outcomeCode.partition + '/' + topc.outcomeCode.position;
    outcomePageContext[colsPerOutcomeCodes[outcomeCodeText] + 41] = formatAmount(topc.outcome);
  });
  // total outcomes per page
  outcomePageContext['T41'] = formatAmount(outcomePage.totalOutcome);
  outcomePageContext['T42'] = formatAmount(outcomePage.transferToNextMonth);
  outcomePageContext['T43'] = formatAmount(outcomePage.total);

  annualReportPages.push(Mustache.render(outcomePageTemplate, outcomePageContext));
}

function populateTotalIncomePage(annualReport, annualReportPages) {
  var totalIncomePageContext = {};
  totalIncomePageContext.pageNum = 13
  var colsPerIncomeCodes = {}
  var col = 'B';
  annualReport.incomeCodes.forEach(ic => {
    totalIncomePageContext[col+'5'] = asRoman(ic.partition) + '/' + ic.position;
    totalIncomePageContext[col+'6'] = ic.description;
    colsPerIncomeCodes[ic.partition + '/' + ic.position] = col;
    col = String.fromCharCode(col.charCodeAt() + 1);
  });
  var row = 8;
  annualReport.incomePages.forEach(ip => {
    ip.totalIncomePerCode.forEach(tipc => {
      let incomeCodeText = tipc.incomeCode.partition + '/' + tipc.incomeCode.position;
      totalIncomePageContext[colsPerIncomeCodes[incomeCodeText] + row] = formatAmount(tipc.income);
    })
    totalIncomePageContext['Q'+row] = formatAmount(ip.totalIncome);
    row++;
  });
  annualReport.totalIncomePage.totalIncomePerCode.forEach(tipc => {
    let incomeCodeText = tipc.incomeCode.partition + '/' + tipc.incomeCode.position;
    totalIncomePageContext[colsPerIncomeCodes[incomeCodeText] + '20'] = formatAmount(tipc.income);
  })
  annualReport.totalIncomePage.totalIncomePerCodePredicted.forEach(tipcp => {
    let incomeCodeText = tipcp.incomeCode.partition + '/' + tipcp.incomeCode.position;
    totalIncomePageContext[colsPerIncomeCodes[incomeCodeText] + '21'] = formatAmount(tipcp.income);
  })
  totalIncomePageContext['Q20'] = formatAmount(annualReport.totalIncomePage.totalIncome)
  totalIncomePageContext['Q21'] = formatAmount(annualReport.totalIncomePage.totalIncomePredicted)

  annualReportPages.push(Mustache.render(totalIncomePageTemplate, totalIncomePageContext))
}

function populateTotalOutcomePage(annualReport, annualReportPages) {
  var totalOutcomePageContext = {};
  totalOutcomePageContext.pageNum = 13
  if (!annualReport.year) {
    totalOutcomePageContext.year = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  } else {
    totalOutcomePageContext.year = annualReport.year;
  }
  var colsPerOutcomeCodes = {}
  var col = 'B';
  annualReport.outcomeCodes.forEach(oc => {
    totalOutcomePageContext[col+'5'] = asRoman(oc.partition) + '/' + oc.position;
    totalOutcomePageContext[col+'6'] = oc.description;
    colsPerOutcomeCodes[oc.partition + '/' + oc.position] = col;
    col = String.fromCharCode(col.charCodeAt() + 1);
  });
  var row = 8;
  annualReport.outcomePages.forEach(op => {
    op.totalOutcomePerCode.forEach(topc => {
      let outcomeCodeText = topc.outcomeCode.partition + '/' + topc.outcomeCode.position;
      totalOutcomePageContext[colsPerOutcomeCodes[outcomeCodeText] + row] = formatAmount(topc.outcome);
    });
    totalOutcomePageContext['R'+row] = formatAmount(op.totalOutcome);
    row++;
  });
  annualReport.totalOutcomePage.totalOutcomePerCode.forEach(topc => {
    let outcomeCodeText = topc.outcomeCode.partition + '/' + topc.outcomeCode.position;
    totalOutcomePageContext[colsPerOutcomeCodes[outcomeCodeText] + '20'] = formatAmount(topc.outcome);
  })
  annualReport.totalOutcomePage.totalOutcomePerCodeAllowed.forEach(topca => {
    let outcomeCodeText = topca.outcomeCode.partition + '/' + topca.outcomeCode.position;
    totalOutcomePageContext[colsPerOutcomeCodes[outcomeCodeText] + '21'] = formatAmount(topca.outcome);
  })
  totalOutcomePageContext['R20'] = formatAmount(annualReport.totalOutcomePage.totalOutcome);
  totalOutcomePageContext['R21'] = formatAmount(annualReport.totalOutcomePage.totalOutcomeAllowed);
  totalOutcomePageContext['R24'] = formatAmount(annualReport.totalIncomePage.totalIncome);
  totalOutcomePageContext['R25'] = formatAmount(annualReport.totalOutcomePage.totalOutcome);
  totalOutcomePageContext['R26'] = formatAmount(annualReport.totalOutcomePage.netIncome);
  totalOutcomePageContext['R27'] = formatAmount(annualReport.totalOutcomePage.transferFromPreviousYear);
  totalOutcomePageContext['R28'] = formatAmount(annualReport.totalOutcomePage.transferToNextYear);

  annualReportPages.push(Mustache.render(totalOutcomePageTemplate, totalOutcomePageContext));
}

function populateSharesPage(annualReport, annualReportPages, sharesStartIndex, savingsStartIndex) {
  const sharesPageContext = {}
  sharesPageContext.pageNum = 14
  var newSharesStartIndex, newSavingsStartIndex
  if (sharesStartIndex || sharesStartIndex == 0) {
    let row = 7
    for (let i=sharesStartIndex; i<annualReport.sharesPage.shares.length; i++) {
      if (row >= 15) {
        newSharesStartIndex = i
        break
      }
      const share = annualReport.sharesPage.shares[i]
      sharesPageContext['A'+row] = share.series
      sharesPageContext['B'+row] = share.ordinal
      sharesPageContext['C'+row] = share.name
      sharesPageContext['D'+row] = formatAmount(share.nominalValue)
      row++
    }
  }
  if (savingsStartIndex || savingsStartIndex == 0) {
    let row = 7
    for (let i=savingsStartIndex; i<annualReport.sharesPage.savings.length; i++) {
      if (row >= 13) {
        newSavingsStartIndex = i
        break
      }
      const saving = annualReport.sharesPage.savings[i]
      sharesPageContext['E'+row] = saving.account
      sharesPageContext['F'+row] = saving.savingEntity
      sharesPageContext['G'+row] = formatAmount(saving.amount)
      sharesPageContext['H'+row] = formatAmount(saving.amountDeposited)
      sharesPageContext['I'+row] = formatAmount(saving.amountWithdrawn)
      row++
    }
  }
  if(newSharesStartIndex || newSavingsStartIndex) {
    annualReportPages.push(Mustache.render(sharesPageTemplate, sharesPageContext))
    populateSharesPage(annualReport, annualReportPages, newSharesStartIndex, newSavingsStartIndex)
    return
  }
  sharesPageContext['D15'] = formatAmount(annualReport.sharesPage.totalNominalValue)
  sharesPageContext['D16'] = formatAmount(annualReport.sharesPage.shareValueDepreciatedDuringYear)
  sharesPageContext['D17'] = formatAmount(annualReport.sharesPage.nominalValueOnYearEnd)
  sharesPageContext['G13'] = formatAmount(annualReport.sharesPage.totalSavingAmountAtYearStart)
  sharesPageContext['G14'] = formatAmount(annualReport.sharesPage.totalSavingAmountDeposited)
  sharesPageContext['G15'] = formatAmount(annualReport.sharesPage.totalSavingAmountPlusDeposited)
  sharesPageContext['G16'] = formatAmount(annualReport.sharesPage.totalSavingAmountWithdrawn)
  sharesPageContext['G17'] = formatAmount(annualReport.sharesPage.savingAmountOnYearEnd)

  annualReportPages.push(Mustache.render(sharesPageTemplate, sharesPageContext))
}

function populateTotalPage(annualReport, annualReportPages, itemsStartIndex, debtsStartIndex) {
  const totalPageContext = {}
  totalPageContext.pageNum = 14
  if (!annualReport.year) {
    totalPageContext.year = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  } else {
    totalPageContext.year = annualReport.year
  }
  totalPageContext.church = annualReport.churchMunicipality
  if (itemsStartIndex == 0 && debtsStartIndex == 0) {
    totalPageContext['E5'] = formatAmount(annualReport.totalOutcomePage.transferToNextYear)
    totalPageContext['E6'] = formatAmount(annualReport.sharesPage.savingAmountOnYearEnd)
    totalPageContext['E7'] = formatAmount(annualReport.sharesPage.nominalValueOnYearEnd)
    totalPageContext['C8'] = annualReport.totalPage.realEstateBuildingsSurface
    totalPageContext['E8'] = formatAmount(annualReport.totalPage.realEstateBuildingsValue)
    totalPageContext['E9'] = formatAmount(annualReport.totalPage.realEstateLandValue)
    totalPageContext['C9'] = annualReport.totalPage.realEstateLandSurface
  }
  var newItemsStartIndex, newDebtsStartIndex
  if (itemsStartIndex || itemsStartIndex == 0) {
    let row = 11
    for (let i=itemsStartIndex; i<annualReport.totalPage.items.length; i++) {
      if (row >= 16) {
        newItemsStartIndex = i
        break
      }
      const item = annualReport.totalPage.items[i]
      totalPageContext['A'+row] = item.name
      totalPageContext['E'+row] = formatAmount(item.value)
      row++
    }
  }
  if (debtsStartIndex || debtsStartIndex == 0) {
    let row = 5
    for (let i=debtsStartIndex; i<annualReport.totalPage.debts.length; i++) {
      if (row >= 16) {
        newDebtsStartIndex = i
        break
      }
      const debt = annualReport.totalPage.debts[i]
      totalPageContext['F'+row] = debt.description
      totalPageContext['G'+row] = formatAmount(debt.amount)
      row++
    }
  }
  if(newItemsStartIndex || newDebtsStartIndex) {
    annualReportPages.push(Mustache.render(totalPageTemplate, totalPageContext))
    populateTotalPage(annualReport, annualReportPages, newItemsStartIndex, newDebtsStartIndex)
    return
  }
  totalPageContext['E16'] = formatAmount(annualReport.totalPage.totalPropertyValue)
  totalPageContext['G16'] = formatAmount(annualReport.totalPage.totalDebt)
  totalPageContext['G17'] = formatAmount(annualReport.totalPage.totalPropertyValue)
  totalPageContext['G18'] = formatAmount(annualReport.totalPage.totalDebt)
  totalPageContext['G19'] = formatAmount(annualReport.totalPage.propertyValue)

  annualReportPages.push(Mustache.render(totalPageTemplate, totalPageContext))
}

function populateTotalHeadline(annualReport, annualReportPages) {
  const headlineContext = {};
  if (!annualReport.year) {
    headlineContext.year = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  } else {
    headlineContext.year = annualReport.year;
  }
  headlineContext.church = annualReport.churchMunicipality
  headlineContext.pageNum = 15

  annualReportPages.push(Mustache.render(totalHeadlineTemplate, headlineContext));
}

const amountNumberOptions = {
  decimalCharacter : ',',
  digitGroupSeparator : '.'
}

function formatAmount (n) {
  if(!n) {
    return null
  }
  return AutoNumeric.format(n.toString(), amountNumberOptions)
}

async function createAnnualReportPdf (webContents) {
  webContents.printToPDF(pdfSettings(), async function(err, data) {
    if (err) {
      console.error(err)
      throw new Error('Failed creating annual report pdf')
    }
    try {
      const pdfDoc = await PDFDocument.load(data)
      pdfDoc.getPages().forEach(page => {
        page.setRotation(degrees(90))
      })
      const pdfBytes = await pdfDoc.save()
      fs.writeFileSync(path.join(app.getPath('userData'), '/annual-report.pdf'), pdfBytes);
    } catch(err) {
      console.error(err)
      throw new Error('Failed creating annual report pdf')
    }
  })
}

function pdfSettings () {
  var settings = {
      landscape: false,
      marginsType: 0,
      printBackground: false,
      printSelectionOnly: false,
      pageSize: "A4",
  };
  return settings;
}

module.exports = {
  getAnnualReportCommonData: getAnnualReportCommonData,
  getAnnualReportData: getAnnualReportData,
  createAnnualReportCommonData: createAnnualReportCommonData,
  createAnnualReportData: createAnnualReportData,
  getAnnualReport: getAnnualReport,
  getAnnualReportPages: getAnnualReportPages,
  createAnnualReportPdf: createAnnualReportPdf
}
