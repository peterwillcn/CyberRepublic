import Base from './Base'
import * as S3 from 'aws-sdk/clients/s3'
import * as uuid from 'uuid'
import * as fs from 'fs'

let s3_client = undefined

export default class extends Base {
  private config: any
  protected init() {
    this.config = {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION
    }
    if (!s3_client) {
      this.initS3Client()
    }
  }

  private initS3Client() {
    s3_client = new S3({
      region: this.config.region,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCESS_SECRET
    })
  }

  /*
   * @param - file, req.files.file.
   * */
  public async saveFile(file) {
    const file_name = uuid.v4() + '_' + file.name
    const path = process.cwd() + '/.upload/'

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    await file.mv(path + file_name)

    return new Promise((resolve, reject) => {
      const uploadParams = {
        Bucket: this.config.bucket,
        Body: fs.createReadStream(path + file_name),
        Key: file_name
      }
      s3_client.upload(uploadParams, function (err: any, data: any) {
        if (err) {
          console.error('unable to upload:', err)
          reject(err)
        }
        // remove the uploaded file
        fs.unlinkSync(path + file_name)
        // get public url
        resolve(data.Location)
      })
    })
  }
}
