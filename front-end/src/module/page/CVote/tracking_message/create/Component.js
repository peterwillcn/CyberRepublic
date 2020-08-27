import React from 'react'
import _ from 'lodash'
import BaseComponent from '@/model/BaseComponent'
import CVoteTrackingMessageForm from '@/module/form/CVoteTrackingMessageForm/Container'
import { Button, Icon } from 'antd'
import I18N from '@/I18N'
import styled from 'styled-components'

export default class extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      creating: false
    }
  }

  ord_render() {
    const form = this.renderForm()
    return (
      <Wrapper>
        <Button className="cr-btn cr-btn-primary" type="primary">
          <Text>{I18N.get('proposal.btn.addTrackingMessage')}</Text>
          <Icon type="plus-circle" />
        </Button>
        {form}
      </Wrapper>
    )
  }

  renderForm() {
    const props = {
      ...this.props,
      onCreated: this.onCreated
      // onCancel: this.onCancel,
    }
    return <CVoteTrackingMessageForm {...props} />
  }

  getQuery = () => {
    const query = {
      proposalId: _.get(this.props, 'proposal._id')
    }
    return query
  }

  refetch = async () => {
    this.ord_loading(true)
    const { list } = this.props
    const param = this.getQuery()
    await list(param)
    this.ord_loading(false)
  }

  onCreated = () => {
    this.refetch()
  }
}

const Wrapper = styled.div``
const Text = styled.span`
  vertical-align: top;
`
