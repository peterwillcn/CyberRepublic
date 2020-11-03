import React, { Component } from 'react'
import { Radio, InputNumber, Input, Checkbox, Select } from 'antd'
import styled from 'styled-components'
import I18N from '@/I18N'
import { SUGGESTION_TYPE } from '@/constant'
const { Option } = Select
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
      newAddress: value && value.newAddress,
      proposals: []
    }
  }

  componentDidMount = async () => {
    const docs = await this.props.getActiveProposals()
    const proposals = docs.map((el) => ({
      value: el.vid,
      text: `#${el.vid} ${el.title}`
    }))
    this.setState({ proposals })
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
      newAddress,
      proposalNumErr,
      terminationErr,
      newOwnerDIDErr,
      newAddressErr,
      newSecretaryDIDErr
    } = this.state
    let data = { type }
    switch (type) {
      case CHANGE_PROPOSAL:
        if (proposalNumErr) {
          data.hasErr = true
        }
        data.proposalNum = proposalNum
        data.changeOwner = changeOwner
        data.changeAddress = changeAddress
        if (changeOwner && !changeAddress) {
          if (newOwnerDIDErr) {
            data.hasErr = true
          }
          data.newOwnerDID = newOwnerDID
        }
        if (changeAddress && !changeOwner) {
          if (newAddressErr) {
            data.hasErr = true
          }
          data.newAddress = newAddress
        }
        if (changeAddress && changeOwner) {
          if (newOwnerDIDErr || newAddressErr) {
            data.hasErr = true
          }
          data.newOwnerDID = newOwnerDID
          data.newAddress = newAddress
        }
      case CHANGE_SECRETARY:
        data.newSecretaryDID = newSecretaryDID
        if (newSecretaryDIDErr) {
          data.hasErr = true
        }
        break
      case TERMINATE_PROPOSAL:
        data.termination = termination
        if (terminationErr) {
          data.hasErr = true
        }
        break
      default:
        break
    }
    onChange(data)
    callback('type')
  }

  validateAddress = (value) => {
    const reg = /^[E8][a-zA-Z0-9]{33}$/
    return reg.test(value)
  }

  handleAddress = (e) => {
    const value = e.target.value
    this.setState(
      { newAddress: value, newAddressErr: !this.validateAddress(value) },
      () => {
        this.changeValue()
      }
    )
  }

  handleChange = (e, field) => {
    const error = `${field}Err`
    if (field === 'type') {
      this.props.changeType(e.target.value)
    }
    this.setState({ [field]: e.target.value, [error]: !e.target.value }, () => {
      this.changeValue()
    })
  }

  handleNumChange = (value) => {
    this.setState({ proposalNum: value, proposalNumErr: !value }, () => {
      this.changeValue()
    })
  }

  handleTerminationChange = (value) => {
    this.setState({ termination: value, terminationErr: !value }, () => {
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
      newAddress,
      proposalNumErr,
      newOwnerDIDErr,
      newAddressErr,
      terminationErr,
      newSecretaryDIDErr
    } = this.state
    return (
      <Wrapper>
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
            <div key={item} className="radio-item">
              <Radio value={item}>
                {I18N.get(`suggestion.form.type.${item}`)}
              </Radio>
              <Desc>{I18N.get(`suggestion.form.type.desc.${item}`)}</Desc>
            </div>
          ))}
        </Radio.Group>

        {type === CHANGE_PROPOSAL && (
          <Section>
            <div className="number">
              <Label>{I18N.get('suggestion.form.type.proposalNum')}</Label>
              <Select
                onChange={this.handleNumChange}
                defaultValue={proposalNum}
                className={proposalNumErr ? null : 'no-error'}
              >
                {this.state.proposals.map((el) => (
                  <Option value={el.value} key={el.value}>
                    {el.text}
                  </Option>
                ))}
              </Select>
              {proposalNumErr && (
                <Error>{I18N.get('suggestion.form.error.proposalNum')}</Error>
              )}
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
              <div className={`sub ${newOwnerDIDErr ? null : 'no-error'}`}>
                <Label>
                  {I18N.get('suggestion.form.type.proposalNewOwner')}
                </Label>
                <Input
                  onChange={(e) => this.handleChange(e, 'newOwnerDID')}
                  value={newOwnerDID}
                  placeholder="ibHXCt4ixWjZfbS8oNhjAfBzA8LKyyyyyy"
                />
                {newOwnerDIDErr && (
                  <Error>{I18N.get('suggestion.form.error.newOwner')}</Error>
                )}
              </div>
            )}
            {changeAddress && (
              <div className={`sub ${newAddressErr ? null : 'no-error'}`}>
                <Label>
                  {I18N.get('suggestion.form.type.proposalNewAddress')}
                </Label>
                <Input onChange={this.handleAddress} value={newAddress} />
                {newAddressErr && (
                  <Error>{I18N.get('suggestion.form.error.elaAddress')}</Error>
                )}
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
              placeholder="ibHXCt4ixWjZfbS8oNhjAfBzA8LKxxxxxx"
            />
            {newSecretaryDIDErr && (
              <Error>{I18N.get('suggestion.form.error.secretary')}</Error>
            )}
          </Section>
        )}
        {type === TERMINATE_PROPOSAL && (
          <Section>
            <Label>{I18N.get('suggestion.form.type.proposalNum')}</Label>
            <Select
              onChange={this.handleTerminationChange}
              defaultValue={termination}
            >
              {this.state.proposals.map((el) => (
                <Option value={el.value} key={el.value}>
                  {el.text}
                </Option>
              ))}
            </Select>
            {terminationErr && (
              <Error>{I18N.get('suggestion.form.error.proposalNum')}</Error>
            )}
          </Section>
        )}
      </Wrapper>
    )
  }
}

export default SelectSuggType

const Wrapper = styled.div`
  .ant-radio-group {
    display: flex;
    flex-direction: row;
    @media (max-width: 768px) {
      flex-direction: column;
    }
    flex-wrap: wrap;
    .radio-item {
      width: 50%;
      @media (max-width: 768px) {
        width: unset;
      }
    }
  }
  .ant-radio-wrapper,
  .ant-checkbox-wrapper {
    color: #686868;
  }
  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    @media (max-width: 768px) {
      margin-left: 0;
    }
  }
`

const Label = styled.div`
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 6px;
  color: #686868;
`
const Section = styled.div`
  margin-top: 24px;
  max-width: 520px;
  .number {
    margin-bottom: 16px;
    .no-error .ant-select-selection {
      border-color: #d9d9d9;
      &:active {
        border-color: #d9d9d9;
      }
      &:focus {
        box-shadow: unset;
      }
    }
    .no-error .ant-select-arrow {
      color: #d9d9d9;
    }
  }
  .sub {
    margin-top: 16px;
  }
  .sub.no-error .ant-input {
    border-color: #d9d9d9;
    &:not([disabled]):hover {
      border-color: #d9d9d9;
    }
    &:focus {
      box-shadow: unset;
    }
  }
`
const Error = styled.div`
  color: red;
  font-size: 14px;
  line-height: 1;
`
const Desc = styled.div`
  font-weight: 300;
  font-size: 12px;
  line-height: 17px;
  color: #919191;
  padding-left: 24px;
`
