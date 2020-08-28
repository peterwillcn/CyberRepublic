import Base from './Base'
import { Document } from 'mongoose'
import { constant } from '../constant'

export default class extends Base {
  private model: any
  protected init() {
    this.model = this.getDBModel('CVote_Tracking_Message')
  }

  public async create(param: any): Promise<Document> {
    const { content, proposalId } = param
    const doc: any = {
      content,
      proposalId,
      createdBy: this.currentUser._id
    }
    try {
      const rs = await this.model.save(doc)
      return rs
    } catch (error) {
      console.log(error)
      return
    }
  }

  public async list(param: any): Promise<Object> {
    const { proposalId } = param
    const proposal = await this.getProposalById(proposalId)
    if (!proposalId || !proposal) {
      throw 'invalid proposal'
    }

    const query: any = {
      proposalId
    }

    const list = await this.model
      .getDBInstance()
      .find(query)
      .populate('comment.createdBy', constant.DB_SELECTED_FIELDS.USER.NAME)
      .sort({ createdAt: 1 })

    return { list }
  }

  public async getProposalById(id): Promise<any> {
    return await this.getDBModel('CVote').findOne({ _id: id })
  }
}
