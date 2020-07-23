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
      newSecretary: (value && value.newSecretary) || null,
      proposalNum: (value && value.proposalNum) || null,
      newOwner: (value && value.newOwner) || null
    }
  }

  changeValue() {
    const { onChange } = this.props
    const { type, newOwner, newSecretary, proposalNum } = this.state
    let data
    switch (type) {
      case CHANGE_PROPOSAL_OWNER:
        data = { type, newOwner, proposalNum }
        break
      case CHANGE_SECRETARY:
        data = { type, newSecretary }
        break
      case TERMINATE_PROPOSAL:
        data = { type, proposalNum }
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

  render() {
    const { type, newOwner, newSecretary, proposalNum } = this.state
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
              <Label>Proposal Number</Label>
              <InputNumber
                onChange={this.handleNumChange}
                value={proposalNum}
                min={0}
              />
            </div>
            <div>
              <Label>Proposal New Owner</Label>
              <Input
                onChange={(e) => this.handleChange(e, 'newOwner')}
                value={newOwner}
                placeholder="please input the new owner's DID"
              />
            </div>
          </Section>
        )}
        {type === CHANGE_SECRETARY && (
          <Section>
            <Label>New Secretary</Label>
            <Input
              onChange={(e) => this.handleChange(e, 'newSecretary')}
              value={newSecretary}
              placeholder="please input the new secretary's DID"
            />
          </Section>
        )}
        {type === TERMINATE_PROPOSAL && (
          <Section>
            <Label>Proposal Number</Label>
            <InputNumber
              onChange={this.handleNumChange}
              value={proposalNum}
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
