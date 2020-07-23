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
      <Wrap>
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
          <div>
            <div>
              proposal new owner DID:{' '}
              <Input
                onChange={(e) => this.handleChange(e, 'newOwner')}
                value={newOwner}
              />
            </div>
            <div>
              Proposal Number{' '}
              <InputNumber
                onChange={this.handleNumChange}
                value={proposalNum}
                min={0}
              />
            </div>
          </div>
        )}
        {type === CHANGE_SECRETARY && (
          <div>
            new secretary DID:{' '}
            <Input
              onChange={(e) => this.handleChange(e, 'newSecretary')}
              value={newSecretary}
            />
          </div>
        )}
        {type === TERMINATE_PROPOSAL && (
          <div>
            Proposal Number{' '}
            <InputNumber
              onChange={this.handleNumChange}
              value={proposalNum}
              min={0}
            />
          </div>
        )}
      </Wrap>
    )
  }
}

export default SelectSuggType

const Wrap = styled.div``
