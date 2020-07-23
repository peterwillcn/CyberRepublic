import React, { Component } from 'react'
import { Radio, InputNumber, Input } from 'antd'
import styled from 'styled-components'
import I18N from '@/I18N'
import { SUGGESTION_TYPE } from '@/constant'
const {
  NEW_MOTION,
  MOTION_AGAINST,
  ANYTHING_ELSE,
  CHANGE_PROPOSAL_OWNER,
  CHANGE_SECRETARY,
  TERMINATE_PROPOSAL
} = SUGGESTION_TYPE

class SelectSuggType extends Component {
  constructor(props) {
    super(props)
    const value = props.initialValue
    this.state = {
      type: (value && value.type) || '1',
      newSecretaryDID: (value && value.newSecretaryDID) || null,
      proposalNum: (value && value.proposalNum) || null,
      newOwnerDID: (value && value.newOwnerDID) || null,
      termination: (value && value.termination) || null
    }
  }

  changeValue() {
    const { onChange } = this.props
    const {
      type,
      newOwnerDID,
      newSecretaryDID,
      proposalNum,
      termination
    } = this.state
    let data
    switch (type) {
      case CHANGE_PROPOSAL_OWNER:
        data = { type, newOwnerDID, proposalNum }
        break
      case CHANGE_SECRETARY:
        data = { type, newSecretaryDID }
        break
      case TERMINATE_PROPOSAL:
        data = { type, termination }
        break
      default:
        data = { type }
        break
    }
    onChange(data)
  }

  handleChange = (e, field) => {
    this.setState({ [field]: e.target.value }, () => {
      this.changeValue()
    })
  }

  handleNumChange = (value) => {
    this.setState({ proposalNum: value }, () => {
      this.changeValue()
    })
  }

  handleTerminationChange = (value) => {
    this.setState({ termination: value }, () => {
      this.changeValue()
    })
  }

  render() {
    const {
      type,
      newOwnerDID,
      newSecretaryDID,
      proposalNum,
      termination
    } = this.state
    return (
      <div>
        <Radio.Group
          onChange={(e) => this.handleChange(e, 'type')}
          value={type}
        >
          <Radio value={NEW_MOTION}>
            {I18N.get('suggestion.form.type.newMotion')}
          </Radio>
          <Radio value={MOTION_AGAINST}>
            {I18N.get('suggestion.form.type.motionAgainst')}
          </Radio>
          <Radio value={CHANGE_PROPOSAL_OWNER}>
            {I18N.get('suggestion.form.type.changeProposalOwner')}
          </Radio>
          <Radio value={CHANGE_SECRETARY}>
            {I18N.get('suggestion.form.type.changeSecretary')}
          </Radio>
          <Radio value={TERMINATE_PROPOSAL}>
            {I18N.get('suggestion.form.type.terminateProposal')}
          </Radio>
          <Radio value={ANYTHING_ELSE}>
            {I18N.get('suggestion.form.type.anythingElse')}
          </Radio>
        </Radio.Group>
        {type === CHANGE_PROPOSAL_OWNER && (
          <Section>
            <div className="number">
              <Label>{I18N.get('suggestion.form.type.proposalNum')}</Label>
              <InputNumber
                onChange={this.handleNumChange}
                value={proposalNum}
                min={0}
              />
            </div>
            <div>
              <Label>{I18N.get('suggestion.form.type.proposalNewOwner')}</Label>
              <Input
                onChange={(e) => this.handleChange(e, 'newOwnerDID')}
                value={newOwnerDID}
                placeholder={I18N.get('suggestion.form.type.ownerInfo')}
              />
            </div>
          </Section>
        )}
        {type === CHANGE_SECRETARY && (
          <Section>
            <Label>{I18N.get('suggestion.form.type.newSecretary')}</Label>
            <Input
              onChange={(e) => this.handleChange(e, 'newSecretaryDID')}
              value={newSecretaryDID}
              placeholder={I18N.get('suggestion.form.type.secretaryInfo')}
            />
          </Section>
        )}
        {type === TERMINATE_PROPOSAL && (
          <Section>
            <Label>{I18N.get('suggestion.form.type.proposalNum')}</Label>
            <InputNumber
              onChange={this.handleTerminationChange}
              value={termination}
              min={0}
            />
          </Section>
        )}
      </div>
    )
  }
}

export default SelectSuggType

const Label = styled.div`
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 6px;
`
const Section = styled.div`
  margin-top: 24px;
  max-width: 390px;
  .number {
    margin-bottom: 16px;
  }
`
