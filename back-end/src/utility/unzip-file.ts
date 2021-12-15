import * as fs from 'fs'
import * as path from 'path'
const extract = require('extract-zip')

const deleteFolderRecursive = function (directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(directoryPath)
  }
}

async function extractZip(source: string, target: string) {
  try {
    await extract(source, { dir: target })
    console.log('Extraction complete')
  } catch (err) {
    console.log('Oops: extractZip failed', err)
  }
}

export const unzipFile = async (opinionData: string) => {
  try {
    const bytes = Buffer.from(opinionData, 'hex')
    const zipFilePath = `${__dirname}/opinion.zip`
    fs.writeFileSync(zipFilePath, bytes)
    const dir = `${__dirname}/opinion`
    await extractZip(zipFilePath, dir)
    fs.unlinkSync(zipFilePath)
    const opinionFilePath = `${__dirname}/opinion/opinion.json`
    const text = fs.readFileSync(opinionFilePath, 'utf-8')
    const opinion = JSON.parse(text).content
    deleteFolderRecursive(dir)
    return opinion
  } catch (err) {
    console.log(`unzipFile err...`, err)
  }
}
