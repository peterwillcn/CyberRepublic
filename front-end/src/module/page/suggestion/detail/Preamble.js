import React, { Component } from 'react'
import I18N from '@/I18N'
import _ from 'lodash'
import PopoverProfile from '@/module/common/PopoverProfile'
import moment from 'moment/moment'
import { Col, message } from 'antd'
import { SUGGESTION_TYPE, SUGGESTION_STATUS } from '@/constant'
const {
  CHANGE_PROPOSAL,
  CHANGE_SECRETARY,
  TERMINATE_PROPOSAL
} = SUGGESTION_TYPE

import TagsContainer from '../common/tags/Container'
import { Item, ItemTitle, ItemText, CopyButton } from './style'

class Preamble extends Component {
  copyToClip(content) {
    var aux = document.createElement('input')
    aux.setAttribute('value', content)
    document.body.appendChild(aux)
    aux.select()
    const err = document.execCommand('copy')
    document.body.removeChild(aux)
    if (err) {
      message.success(I18N.get('btn.CopyHash'))
    }
  }

  renderPreambleItem(header, value, item) {
    let text = <ItemText>{value}</ItemText>
    let btn = null
    const {
      detail: { createdBy },
      user
    } = this.props
    if (item === 'username') {
      text = <PopoverProfile owner={createdBy} curUser={user} />
    }
    if (item === 'txHash') {
      text = <a href={`https://blockchain.elastos.org/tx/${value}`}>{value}</a>
    }
    if (item === 'proposalHash') {
      btn = (
        <CopyButton onClick={() => this.copyToClip(value)}>
          {I18N.get('suggestion.btn.copyHash')}
        </CopyButton>
      )
    }
    return (
      <Item>
        <Col span={6}>
          <ItemTitle>{header}</ItemTitle>
        </Col>
        <Col span={18} style={{ wordBreak: 'break-all' }}>
          {text}
          {btn}
        </Col>
      </Item>
    )
  }

  render() {
    const { detail } = this.props
    let status = I18N.get('suggestion.status.posted')
    if (_.get(detail, 'reference.0.vid')) {
      status = <TagsContainer data={detail} />
    } else if (_.some(detail.tags, (tag) => tag.type === 'INFO_NEEDED')) {
      status = I18N.get('suggestion.status.moreInfoRequired')
    } else if (
      _.some(detail.tags, (tag) => tag.type === 'UNDER_CONSIDERATION')
    ) {
      status = I18N.get('suggestion.status.underConsideration')
    } else if (_.get(detail, 'status') === SUGGESTION_STATUS.CANCELLED) {
      status = I18N.get(`suggestion.status.${SUGGESTION_STATUS.CANCELLED}`)
    }
    return (
      <div>
        {detail.displayId &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.suggestion'),
            `#${detail.displayId}`
          )}
        {_.get(detail, 'validPeriod') &&
          this.renderPreambleItem(
            I18N.get('suggestion.form.fields.validPeriod'),
            `${detail.validPeriod}${I18N.get('suggestion.form.unit')}`
          )}
        {detail.type &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.type'),
            `${I18N.get(`suggestion.form.type.${detail.type}`)}`
          )}
        {detail.type &&
          detail.type === CHANGE_SECRETARY &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.secretary'),
            `did:elastos:${detail.newSecretaryDID}`
          )}
        {detail.type &&
          detail.type === CHANGE_PROPOSAL &&
          detail.newOwnerDID &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.owner'),
            `did:elastos:${detail.newOwnerDID}`
          )}
        {detail.type &&
          detail.type === CHANGE_PROPOSAL &&
          detail.newAddress &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.address'),
            detail.newAddress
          )}
        {detail.type &&
          detail.type === CHANGE_PROPOSAL &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.targetProposalNum'),
            `#${detail.targetProposalNum}`
          )}
        {detail.type &&
          detail.type === TERMINATE_PROPOSAL &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.closeProposalNum'),
            `#${detail.closeProposalNum}`
          )}
        {this.renderPreambleItem(
          I18N.get('suggestion.fields.preambleSub.title'),
          detail.title
        )}
        {detail.createdBy &&
          detail.createdBy.username &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.creator'),
            detail.createdBy.username,
            'username'
          )}
        {this.renderPreambleItem(
          I18N.get('suggestion.fields.preambleSub.status'),
          status
        )}
        {this.renderPreambleItem(
          I18N.get('suggestion.fields.preambleSub.created'),
          moment(detail.createdAt).format('MMM D, YYYY')
        )}
        {_.get(detail, 'signature.data') &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.signature'),
            detail.signature.data,
            'signature'
          )}
        {detail.type &&
          detail.type === CHANGE_PROPOSAL &&
          _.get(detail, 'newOwnerSignature.data') &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.newOwnerSignature'),
            detail.newOwnerSignature.data
          )}
        {detail.type &&
          detail.type === CHANGE_SECRETARY &&
          _.get(detail, 'newSecretarySignature.data') &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.newSecretarySignature'),
            detail.newSecretarySignature.data
          )}
        {_.get(detail, 'reference.0.txHash') &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.txHash'),
            _.get(detail, 'reference.0.txHash'),
            'txHash'
          )}
        {_.get(detail, 'reference.0.proposalHash') &&
          this.renderPreambleItem(
            I18N.get('suggestion.fields.preambleSub.proposalHash'),
            _.get(detail, 'reference.0.proposalHash'),
            'proposalHash'
          )}
      </div>
    )
  }
}

export default Preamble
