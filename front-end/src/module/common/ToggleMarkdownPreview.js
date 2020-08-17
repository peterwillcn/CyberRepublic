import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import styled from 'styled-components'
import { Icon } from 'antd'

class ToggleMarkdownPreview extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = { show: false }
  }

  onClick = (e) => {
    this.setState({ show: !this.state.show })
    this.props.togglePreview()
  }

  ord_render() {
    const { show } = this.state
    return (
      <Wrapper>
        <label onClick={this.onClick}>
          <figure>
            {show ? <Icon type="eye" /> : <Icon type="eye-invisible" />}
          </figure>
        </label>
      </Wrapper>
    )
  }
}

export default ToggleMarkdownPreview

const Wrapper = styled.div`
  label {
    cursor: pointer;
    display: inline-block;
    z-index: 99;
    overflow: hidden;
    margin-left: 8px;
  }

  label figure {
    width: 24px;
    height: 24px;
    background-color: #008d85;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  label svg {
    fill: #fff;
    width: 16px;
    height: 16px;
  }
`
