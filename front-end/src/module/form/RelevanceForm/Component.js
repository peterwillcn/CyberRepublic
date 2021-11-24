import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form, Select, Button, Icon } from 'antd'
import BaseComponent from '@/model/BaseComponent'
import I18N from '@/I18N'
import CodeMirrorEditor from '@/module/common/CodeMirrorEditor'
import _ from 'lodash'

const FormItem = Form.Item

class RelevanceForm extends BaseComponent {
  constructor(props) {
    super(props)
    this.fetchProposal = _.debounce(this.fetchProposal.bind(this), 800)
    this.state = {
      item: this.props.item,
      data: [],
      value: undefined
    }
  }

  handleSubmit = (e) => {
    e.stopPropagation() // prevent event bubbling
    e.preventDefault()
    const { form, onSubmit } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        const data =
          _.find(this.state.data, { proposal: values.proposal }) ||
          this.state.item
        onSubmit({
          ...values,
          title: data.title,
          proposal: data.proposal,
          proposalHash: data.proposalHash
        })
      }
    })
  }

  fetchProposal = async (value) => {
    this.setState({ data: [] })
    const { getProposalTitle, callback } = this.props
    const rs = await getProposalTitle(value)
    if (rs) {
      const data = rs.map((obj) => ({
        title: obj.title,
        proposal: obj._id,
        proposalHash: obj.proposalHash
      }))
      this.setState({ data }, () => {
        callback(data)
      })
    }
  }

  handleChange = (value) => {
    this.setState({ value })
  }

  ord_render() {
    const { getFieldDecorator } = this.props.form
    const { item } = this.props
    const option = _.map(this.state.data, (o) => (
      <Select.Option key={o.proposal}>{o.title}</Select.Option>
    ))
    const proposalTitle = item && item.title
    let title = I18N.get('suggestion.plan.createRelevance')
    if (!_.isEmpty(item)) {
      title = I18N.get('suggestion.plan.editRelevance')
    }

    return (
      <Wrapper>
        <Title>{title}</Title>
        <Form onSubmit={this.handleSubmit}>
          <Label>{I18N.get('from.SuggestionForm.proposal')}</Label>
          <FormItem>
            {getFieldDecorator('proposal', {
              rules: [
                {
                  required: true,
                  message: I18N.get('suggestion.form.error.required')
                }
              ]
            })(
              <Select
                showSearch
                showArrow={true}
                size="large"
                filterOption={false}
                onSearch={this.fetchProposal}
                onChange={this.handleChange}
                suffixIcon={
                  <Icon
                    type="search"
                    spin={false}
                    style={{ height: '100px !improtant' }}
                  />
                }
                defaultActiveFirstOption={false}
                placeholder={proposalTitle}
                notFoundContent={null}
                defaultOpen={false}
                style={{ width: '100%' }}
              >
                {option}
              </Select>
            )}
          </FormItem>

          <Label gutter={-8}>{I18N.get('from.SuggestionForm.detail')}</Label>
          <FormItem>
            {getFieldDecorator('relevanceDetail', {
              rules: [
                {
                  required: true,
                  message: I18N.get('suggestion.form.error.required')
                }
              ],
              initialValue:
                item && item.relevanceDetail ? item.relevanceDetail : ''
            })(
              <CodeMirrorEditor
                content={
                  item && item.relevanceDetail ? item.relevanceDetail : ''
                }
                name="responsibility"
                autofocus={false}
              />
            )}
          </FormItem>

          <Actions>
            <Button
              className="cr-btn cr-btn-default"
              onClick={() => {
                this.props.onCancel()
              }}
            >
              {I18N.get('suggestion.cancel')}
            </Button>
            <Button className="cr-btn cr-btn-primary" htmlType="submit">
              {item
                ? I18N.get('suggestion.form.button.update')
                : I18N.get('suggestion.form.button.create')}
            </Button>
          </Actions>
        </Form>
      </Wrapper>
    )
  }
}

RelevanceForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  item: PropTypes.object
}

export default Form.create()(RelevanceForm)

const Wrapper = styled.div`
  max-width: 650px;
  margin: 0 auto;
`
const Title = styled.div`
  font-size: 30px;
  line-height: 42px;
  color: #000000;
  text-align: center;
  margin-bottom: 42px;
`
const Label = styled.div`
  font-size: 17px;
  color: #000;
  display: block;
  margin-bottom: ${(props) => (props.gutter ? props.gutter : 10)}px;
  > span {
    color: #ff0000;
  }
`
const Actions = styled.div`
  display: flex;
  justify-content: center;
  > button {
    margin: 0 8px;
  }
`
