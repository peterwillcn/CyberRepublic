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
      <Container>
        {this.renderTitle()}
        <button>Add tracking message</button>
        {this.renderTracking()}
      </Container>
    )
  }

  renderTitle() {
    return (
      <Title id="tracking-message">
        {I18N.get('proposal.fields.trackingMessage')}
      </Title>
    )
  }

  renderTracking() {
    const { proposal } = this.props
    return <Tracking proposal={proposal} />
  }

  renderForm() {
    const { proposal, currentUserId } = this.props
    const isOwner = _.get(proposal, 'proposer._id') === currentUserId
    const isActive = proposal.status === CVOTE_STATUS.ACTIVE

    return isOwner && isActive && <CreateForm proposal={proposal} />
  }
}

const Container = styled.div``

const Title = styled.div`
  font-size: 20px;
`
