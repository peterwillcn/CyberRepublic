import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import _ from 'lodash'
import { CVOTE_STATUS } from '@/constant'
import Tracking from './list/Container'
import CreateForm from './create/Container'

export default class extends BaseComponent {
  ord_render() {
    return (
      <div>
        {this.renderForm()}
        {this.renderTracking()}
      </div>
    )
  }

  renderTracking() {
    const { proposal } = this.props
    return <Tracking proposal={proposal} />
  }

  renderForm() {
    const { proposal, currentUserId } = this.props
    const isOwner = _.get(proposal, 'proposer._id') === currentUserId
    const isActive = [CVOTE_STATUS.ACTIVE, CVOTE_STATUS.FINAL].includes(
      proposal.status
    )
    return isOwner && isActive && <CreateForm proposal={proposal} />
  }
}
