import fs from 'fs'
import path from 'path'
import extract from 'extract-zip'

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

export async function unzipFile(opinionData: string) {
  try {
    const bytes = Buffer.from(opinionData, 'hex')
    const zipFilePath = `${__dirname}/opinion.zip`
    fs.writeFileSync(zipFilePath, bytes)
    const dir = `${__dirname}/opinion`
    await extract(zipFilePath, { dir })
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
