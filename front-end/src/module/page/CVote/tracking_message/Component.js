import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import I18N from '@/I18N'
import _ from 'lodash'
import styled from 'styled-components'
import { CVOTE_STATUS } from '@/constant'
import Tracking from './list/Container'
import CreateForm from './create/Container'

export default class extends BaseComponent {
  ord_render() {
    return (
      <Wrapper>
        {this.renderTitle()}
        {this.renderForm()}
        {this.renderTracking()}
      </Wrapper>
    )
  }

  renderTitle() {
    return <Title>{I18N.get('proposal.fields.trackingMessage')}</Title>
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

const Wrapper = styled.div``

const Title = styled.div`
  font-size: 20px;
  margin-bottom: 32px;
`
