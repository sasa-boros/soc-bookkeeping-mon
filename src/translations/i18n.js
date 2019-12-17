const path = require('path')
const fs = require('fs')
const electron = require('electron')
let app = electron.app ? electron.app : electron.remote.app
let loadedLanguage

const fallbackLanguage = 'en-US'
const defaultLanguage = 'sr-RS'
let localeLanguage = app.getLocale()
let usedLanguage

function loadLocaleLanguage () {
  if (fs.existsSync(path.join(__static, '/translations', localeLanguage + '.json'))) {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__static, '/translations', localeLanguage + '.json'), 'utf8'))
    usedLanguage = localeLanguage
  } else {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__static, '/translations', fallbackLanguage + '.json'), 'utf8'))
    usedLanguage = fallbackLanguage
  }
}

function loadDefaultLanguage () {
  if (fs.existsSync(path.join(__static, '/translations', defaultLanguage + '.json'))) {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__static, '/translations', defaultLanguage + '.json'), 'utf8'))
    usedLanguage = defaultLanguage
  } else {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__static, '/translations', fallbackLanguage + '.json'), 'utf8'))
    usedLanguage = fallbackLanguage
  }
}

function setLanguage (language) {
  if (fs.existsSync(path.join(__static, '/translations', language + '.json'))) {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__static, '/translations', language + '.json'), 'utf8'))
    usedLanguage = language
  } else {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__static, '/translations', fallbackLanguage + '.json'), 'utf8'))
    usedLanguage = fallbackLanguage
  }
}

function getTranslation (phrase) {
  let translation = loadedLanguage[phrase]
  if (translation === undefined) {
    translation = phrase
  }
  return translation
}

loadDefaultLanguage()

module.exports = {
  setLanguage: setLanguage,
  getTranslation: getTranslation,
  loadLocaleLanguage: loadLocaleLanguage,
  usedLanguage: usedLanguage
}