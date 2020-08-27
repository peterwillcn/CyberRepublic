import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import I18N from '@/I18N'
import _ from 'lodash'
import ImplementationPlan from './ImplementationPlan'
import PaymentSchedule from './PaymentSchedule'
import { Switch,Form, message } from 'antd'

class ImplementationAndBudget extends BaseComponent {
  constructor(props) {
    super(props)
    const { budget, budgetIntro, elaAddress} = this.props.initialValues
    this.timer = -1
    this.state = {
      budgetVisable: !_.isEmpty(budget) || budgetIntro || elaAddress ? true : false,
      disabled: !_.isEmpty(budget) || budgetIntro || elaAddress ? true : false,
    }
  }

  validatePlan = (rule, value, cb) => {
    if (value && _.isEmpty(value.milestone)) {
      return cb(I18N.get('suggestion.form.error.milestones'))
    }
    return cb()
  }

  validateAddress = (value) => {
    const reg = /^[E8][a-zA-Z0-9]{33}$/
    return reg.test(value)
  }

  validateBudget = (rule, value, cb) => {
    const address = _.get(value, 'elaAddress')
    const pItems = _.get(value, 'paymentItems')

    if (!this.validateAddress(address)) {
      return cb(I18N.get('suggestion.form.error.elaAddress'))
    }
    if (_.isEmpty(pItems)) {
      return cb(I18N.get('suggestion.form.error.schedule'))
    }
    return cb()
  }

  getImplementation() {
    const { getFieldDecorator } = this.props
    const rules = [
      {
        required: true,
        message: I18N.get('suggestion.form.error.required')
      }
    ]
    const initialValues = _.isEmpty(this.props.initialValues)
      ? { type: '1' }
      : this.props.initialValues

    rules.push({
      validator: this.validatePlan
    })

    return getFieldDecorator('plan', {
      // rules,
      initialValue: initialValues.plan
    })(
      <ImplementationPlan
        initialValue={initialValues}
        getFieldDecorator={getFieldDecorator}
        callback={this.props.callback}
      />
    )
  }

  getBudget() {
    const { getFieldDecorator } = this.props
    const initialValues = _.isEmpty(this.props.initialValues)
      ? { type: '1' }
      : this.props.initialValues
    const rules = [
      {
        required: true,
        message: I18N.get('suggestion.form.error.required')
      }
    ]
    let initialBudget = {}
    if (initialValues.budget && typeof initialValues.budget !== 'string') {
      initialBudget = initialValues.budget && {
        budgetAmount: initialValues.budgetAmount,
        elaAddress: initialValues.elaAddress,
        paymentItems: initialValues.budget,
        budgetIntro: initialValues.budgetIntro
      }
    } else {
      initialBudget = {
        budgetAmount: initialValues.budget,
        elaAddress: '',
        paymentItems: [],
        budgetIntro: ''
      }
    }

    rules.push({
      validator: this.validateBudget
    })
    let condition = {initialValue: initialBudget}
    if (this.state.budgetVisable) {
      condition = {
        rules,
        initialValue: initialBudget
      }
    }

    return getFieldDecorator('budget', condition)(
      <PaymentSchedule
        initialValue={initialBudget}
        getFieldDecorator={getFieldDecorator}
        callback={this.props.callback}
      />
    )
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.toggle()
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  hiddenBudget = () => {
    this.setState({
      budgetVisable: !this.state.budgetVisable
    })
    this.toggle()
  }

  toggle = () => {
    const data = this.props.form.getFieldValue("budget")
    const temp = localStorage.getItem("draft-suggestion")
    if (!_.isEmpty(temp.budgetIntro)
      || !_.isEmpty(data.elaAddress)
      || data.paymentItems.length > 0
    ) {
      this.setState({
        disabled: true
      })
    } else {
      this.setState({
        disabled: false
      })
    }
  }

  ord_render() {
    const implementation = this.getImplementation()
    const budget = this.getBudget()
    return (
      <div>
        <div>{implementation}</div>
        <Label>{I18N.get(`suggestion.fields.budget`)}</Label>
        <Switch
          onChange={this.hiddenBudget}
          defaultChecked={this.state.disabled}
          disabled={this.state.disabled} />
        <BudgetBlock
          style={{ display: this.state.budgetVisable ? 'block' : 'none' }}
        >
          {budget}
        </BudgetBlock>
      </div>
    )
  }
}

ImplementationAndBudget.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  list: PropTypes.array,
  editable: PropTypes.bool
}

export default ImplementationAndBudget

const BudgetBlock = styled.div`
  transition: all 300ms ease-in-out;
`
const Label = styled.div`
  margin: 50px 0 30px 0;
  font-size: 17px;
  line-height: 24px;
  color: #000000;
`