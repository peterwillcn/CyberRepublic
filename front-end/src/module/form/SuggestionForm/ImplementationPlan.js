import React, { Component } from 'react'
import styled from 'styled-components'
import I18N from '@/I18N'
import Milestones from './Milestones'
import CodeMirrorEditor from '@/module/common/CodeMirrorEditor'
import _ from 'lodash'

class ImplementationPlan extends Component {
  constructor(props) {
    super(props)
    const value = props.initialValue
    this.state = {
      // plan: props.initialValue ? props.initialValue : {}
      plan: (value && value.plan) || {},
      planIntro: (value && value.planIntro) || '',
      changeNum: this.props.controVar
    }
    sessionStorage.setItem(
      'plan-milestone',
      JSON.stringify((value && _.get(value, 'plan.milestone')) || [])
    )
  }

  componentDidUpdate(preProps) {
    const init = preProps.initialValue
    const { controVar } = this.props
    const { milestone, changeNum } = this.state
    if (changeNum !== controVar){
      this.setState({
        plan: (init && _.get(init,'plan')) || {},
        planIntro: (init && _.get(init,'planIntro')) || '',
        changeNum: controVar
      })
      if (!_.isEmpty(_.get(init,'plan.milestone')) && init.plan.milestone !== milestone){
        sessionStorage.setItem(
          'plan-milestone',
          JSON.stringify(init.plan.milestone)
        )
      }
    }
  }

  changeValue = value => {
    const { onChange, callback } = this.props
    const { plan } = this.state
    this.setState({ plan: { ...plan, ...value } }, () => {
      onChange(this.state.plan)
      callback('plan')
    })
  }

  render() {
    const { plan, planIntro, changeNum } = this.state
    const { callback, getFieldDecorator, controVar } = this.props
    return (
      <div>
        <Title>{I18N.get('suggestion.plan.milestones')}</Title>
        <Milestones onChange={this.changeValue} initialValue={plan.milestone} controVar={controVar} />
        <Section>
          <Label>{`${I18N.get('suggestion.plan.introduction')}`}</Label>
          {getFieldDecorator('planIntro',{
            initialValue: planIntro
          })(
            <CodeMirrorEditor
              callback={callback}
              content={planIntro}
              controVar={changeNum}
              activeKey='planIntro'
              name='planIntro'
            />
          )
          }
        </Section>
      </div>
    )
  }
}

export default ImplementationPlan

const Title = styled.div`
  font-size: 17px;
  line-height: 24px;
  color: #000000;
  margin-bottom: 20px;
`

const Section = styled.div`
  margin-top: 24px;
  .ant-btn {
    margin-top: 16px;
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