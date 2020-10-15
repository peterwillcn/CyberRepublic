import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button, Modal } from 'antd'
import I18N from '@/I18N'
import RelevanceForm from '@/module/form/RelevanceForm/Container'
import TeamInfoList from './TeamInfoList'
import RelevanceList from './RelevanceList'


class RelevanceSection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      data: [],
      relevances: props.initialValue ? props.initialValue : []
    }
  }

  setData = value => {
    this.setState({data: value})
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  showModal = () => {
    this.setState({ visible: true, index: -1 })
  }

  changeValue = value => {
    const { onChange, callback } = this.props
    const { relevances } = this.state
    this.setState(
      { values: [...relevances, value.relevances] }, () => {
        onChange(this.state.relevances)
        callback('relevances')
      })
  }

  handleDelete = index => {
    const { relevances } = this.state
    this.setState(
      {
        relevances: [...relevances.slice(0, index), ...relevances.slice(index + 1)]
      },
      () => {
        this.changeValue({ relevances: this.state.relevances })
      }
    )
  }

  handleEdit = index => {
    this.setState({ index, visible: true })
  }

  handleSubmit = values => {
    const { relevances, index } = this.state
    if (index >= 0) {
      const rs = relevances.map((item, key) => {
        if (index === key) {
          return values
        }
        return item
      })
      this.setState({ relevances: rs, visible: false }, () => {
        this.changeValue({ relevances: this.state.relevances })
      })
      return
    }
    this.setState(
      {
        relevances: [...relevances, values],
        visible: false
      },
      () => {
        this.changeValue({ relevances: this.state.relevances })
      }
    )
  }

  render() {
    const { relevances, index } = this.state
    return (
      <Wrapper>
        <Header>
          <Button onClick={this.showModal}>
            {I18N.get('suggestion.plan.createRelevance')}
          </Button>
        </Header>
        {relevances.length ? (
          <RelevanceList
            list={relevances}
            onDelete={this.handleDelete}
            onEdit={this.handleEdit}/>
        ) : null}
        <Modal
          maskClosable={false}
          visible={this.state.visible}
          onCancel={this.hideModal}
          footer={null}
          width={770}
        >
          {this.state.visible === true ? (
            <RelevanceForm
              item={index >= 0 ? relevances[index] : null}
              onSubmit={this.handleSubmit}
              onCancel={this.hideModal}
              callback={this.setData}
            />
          ) : null}
        </Modal>
      </Wrapper>
    )
  }
}

RelevanceSection.propTypes = {
  title: PropTypes.string,
  onChange: PropTypes.func,
  initialValue: PropTypes.array
}

export default RelevanceSection

const Wrapper = styled.div`
  margin-bottom: 24px;
`
const Header = styled.div`
  margin-top: 20px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .ant-btn {
    border: 1px solid #000000;
    color: #000000;
    &:hover {
      border: 1px solid #008d85;
      color: #008d85;
    }
  }
`
const Label = styled.div`
  font-size: 17px;
  line-height: 24px;
  color: #000000;
`
