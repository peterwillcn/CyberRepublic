import React, { Component } from 'react'
import { Radio } from 'antd'
import styled from 'styled-components'
import I18N from '@/I18N'
import { SUGGESTION_TYPE } from '@/constant'

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

  render() {
    return (
      <Wrap>
        <Radio.Group>
          <Radio value={SUGGESTION_TYPE.NEW_MOTION}>
            {I18N.get('suggestion.form.type.newMotion')}
          </Radio>
          <Radio value={SUGGESTION_TYPE.MOTION_AGAINST}>
            {I18N.get('suggestion.form.type.motionAgainst')}
          </Radio>
          <Radio value={SUGGESTION_TYPE.CHANGE_PROPOSAL_OWNER}>
            {I18N.get('suggestion.form.type.changeProposalOwner')}
          </Radio>
          <Radio value={SUGGESTION_TYPE.CHANGE_SECRETARY}>
            {I18N.get('suggestion.form.type.changeSecretary')}
          </Radio>
          <Radio value={SUGGESTION_TYPE.TERMINATE_PROPOSAL}>
            {I18N.get('suggestion.form.type.terminateProposal')}
          </Radio>
          <Radio value={SUGGESTION_TYPE.ANYTHING_ELSE}>
            {I18N.get('suggestion.form.type.anythingElse')}
          </Radio>
        </Radio.Group>
      </Wrap>
    )
  }
}

export default SelectSuggType

const Wrap = styled.div``
