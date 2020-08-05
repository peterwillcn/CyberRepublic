import React, { Component } from 'react'
import { Radio, InputNumber, Input, Checkbox } from 'antd'
import styled from 'styled-components'
import I18N from '@/I18N'
import { SUGGESTION_TYPE } from '@/constant'
const {
  NEW_MOTION,
  CHANGE_PROPOSAL,
  CHANGE_SECRETARY,
  TERMINATE_PROPOSAL
} = SUGGESTION_TYPE

class SelectSuggType extends Component {
  constructor(props) {
    super(props)
    const value = props.initialValue
    this.state = {
      type: (value && value.type) || '1',
      newSecretaryDID: (value && value.newSecretaryDID) || '',
      proposalNum: value && value.proposalNum,
      newOwnerDID: (value && value.newOwnerDID) || '',
      termination: value && value.termination,
      changeOwner: value && value.newOwnerDID ? true : false,
      changeAddress: value && value.newAddress ? true : false,
      newAddress: value && value.newAddress
    }
  }

  changeValue() {
    const { onChange, callback } = this.props
    const {
      type,
      newOwnerDID,
      newSecretaryDID,
      proposalNum,
      termination,
      changeAddress,
      changeOwner,
      newAddress
    } = this.state
    let data
    switch (type) {
      case CHANGE_PROPOSAL:
        if (changeOwner && !changeAddress) {
          data = { type, newOwnerDID, proposalNum, newAddress: '' }
        }
        if (changeAddress && !changeOwner) {
          data = { type, newAddress, proposalNum, newOwnerDID: '' }
        }
        if (changeAddress && changeOwner) {
          data = { type, newOwnerDID, newAddress, proposalNum }
        }
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
    callback('type')
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

  handleCheckboxChange = (e, field) => {
    this.setState({ [field]: e.target.checked }, () => {
      this.changeValue()
    })
  }

  render() {
    const {
      type,
      newOwnerDID,
      newSecretaryDID,
      proposalNum,
      termination,
      changeOwner,
      changeAddress,
      newAddress
    } = this.state
    return (
      <div>
        <Radio.Group
          onChange={(e) => this.handleChange(e, 'type')}
          value={type}
        >
          {[
            NEW_MOTION,
            CHANGE_PROPOSAL,
            TERMINATE_PROPOSAL,
            CHANGE_SECRETARY
          ].map((item) => (
            <Radio value={item} key={item}>
              {I18N.get(`suggestion.form.type.${item}`)}
            </Radio>
          ))}
        </Radio.Group>
        {type === CHANGE_PROPOSAL && (
          <Section>
            <div className="number">
              <Label>{I18N.get('suggestion.form.type.proposalNum')}</Label>
              <InputNumber
                onChange={this.handleNumChange}
                value={proposalNum}
                min={1}
              />
            </div>
            <Checkbox
              checked={changeOwner}
              onChange={(e) => this.handleCheckboxChange(e, 'changeOwner')}
            >
              {I18N.get('suggestion.form.type.changeProposalOwner')}
            </Checkbox>
            <Checkbox
              checked={changeAddress}
              onChange={(e) => this.handleCheckboxChange(e, 'changeAddress')}
            >
              {I18N.get('suggestion.form.type.changeProposalAddress')}
            </Checkbox>
            {changeOwner && (
              <div className="sub">
                <Label>
                  {I18N.get('suggestion.form.type.proposalNewOwner')}
                </Label>
                <Input
                  onChange={(e) => this.handleChange(e, 'newOwnerDID')}
                  value={newOwnerDID}
                  placeholder={I18N.get('suggestion.form.type.ownerInfo')}
                />
              </div>
            )}
            {changeAddress && (
              <div className="sub">
                <Label>
                  {I18N.get('suggestion.form.type.proposalNewAddress')}
                </Label>
                <Input
                  onChange={(e) => this.handleChange(e, 'newAddress')}
                  value={newAddress}
                />
              </div>
            )}
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
              min={1}
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
  .sub {
    margin-top: 16px;
  }
`
