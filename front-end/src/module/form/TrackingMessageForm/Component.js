import React, { Component } from 'react'
import { Form, Button, Row, message } from 'antd'
import I18N from '@/I18N'
import styled from 'styled-components'
import _ from 'lodash'
import CodeMirrorEditor from '@/module/common/CodeMirrorEditor'
const FormItem = Form.Item

class TrackingMessageForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  ord_loading(f = false) {
    this.setState({ loading: f })
  }

  onSubmit = async (e) => {
    e.preventDefault()
    const { form, create, onCreated, proposal, onCancel } = this.props

    form.validateFields(async (err, values) => {
      if (err) return
      const { content } = values
      const param = {
        proposalId: proposal._id,
        content
      }
      this.ord_loading(true)
      try {
        await create(param)
        message.success(I18N.get('proposal.msg.created'))
        onCancel()
        this.ord_loading(false)
        await onCreated()
      } catch (error) {
        message.error(error.message)
        this.ord_loading(false)
      }
    })
  }

  render() {
    const { proposal, currentUserId, onCancel } = this.props
    const { getFieldDecorator } = this.props.form
    if (proposal.proposer._id !== currentUserId) {
      return null
    }
    return (
      <div>
        <Form onSubmit={this.onSubmit}>
          <Title>{I18N.get('proposal.btn.addTrackingMessage')}</Title>
          <FormItem>
            {getFieldDecorator('content', {
              rules: [
                {
                  required: true,
                  message: I18N.get('proposal.form.error.required')
                }
              ]
            })(
              <CodeMirrorEditor
                name="tracking-message"
                upload={false}
                autofocus={false}
              />
            )}
          </FormItem>
          <Row gutter={16} type="flex" justify="center">
            <FormItem>
              <Button
                className="cr-btn cr-btn-default"
                onClick={onCancel}
                style={{ marginRight: 16 }}
              >
                {I18N.get('proposal.btn.cancel')}
              </Button>
              <Button
                loading={this.state.loading}
                className="cr-btn cr-btn-primary"
                htmlType="submit"
              >
                {I18N.get('proposal.btn.create')}
              </Button>
            </FormItem>
          </Row>
        </Form>
      </div>
    )
  }
}

export default Form.create()(TrackingMessageForm)

const Title = styled.div`
  text-align: center;
  font-size: 20px;
`
