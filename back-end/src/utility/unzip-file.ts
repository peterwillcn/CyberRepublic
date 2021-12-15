const decompress = require('decompress')

export const unzipFile = async (opinionData: string) => {
  try {
    const bytes = Buffer.from(opinionData, 'hex')
    const files = await decompress(bytes)
    if (files.length > 0) {
      const file = files.find((el: any) => el.path === 'opinion.json')
      console.log(`file...`, file)
      if (file && file.data) {
        const text = file.data.toString()
        const opinion = JSON.parse(text).content
        return opinion
      }
    }
  } catch (err) {
    console.log(`unzipFile err...`, err)
  }
}
