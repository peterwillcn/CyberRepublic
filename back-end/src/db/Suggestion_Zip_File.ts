import Base from './Base'
import { SuggestionZipFile } from './schema/SuggestionZipFileSchema'

export default class extends Base {
  protected getSchema() {
    return SuggestionZipFile
  }
  protected getName() {
    return 'suggestion_zip_file'
  }
}
