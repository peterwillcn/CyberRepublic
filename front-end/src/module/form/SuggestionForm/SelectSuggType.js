import React, { Component } from 'react'
import { Radio } from 'antd'
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
      newSecretary: (value && value.secretary) || ''
    }
  }

  changeValue(value) {
    const { onChange, callback } = this.props
    onChange(value)
    callback('type')
  }

  handleChange = (e) => {
    this.setState({
      type: e.target.value
    })
  }

  render() {
    const { type } = this.state
    return (
      <Wrap>
        <Radio.Group onChange={this.handleChange} value={this.state.type}>
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
        {type === CHANGE_PROPOSAL_OWNER && <div>change owner</div>}
        {type === CHANGE_SECRETARY && <div>change secretary</div>}
        {type === TERMINATE_PROPOSAL && <div>terminate proposal</div>}
      </Wrap>
    )
  }
}

export default SelectSuggType

const Wrap = styled.div``
