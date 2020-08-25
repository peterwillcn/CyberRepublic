import React from 'react'
import _ from 'lodash'
import BaseComponent from '@/model/BaseComponent'
import CVoteTrackingMessageForm from '@/module/form/CVoteTrackingMessageForm/Container'
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
    return <Container>{form}</Container>
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

export const Container = styled.div``
