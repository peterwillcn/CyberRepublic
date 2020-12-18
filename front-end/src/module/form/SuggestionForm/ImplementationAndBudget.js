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
    this.timer = -1
    this.count = 0
    const { budget, budgetIntro, elaAddress} = this.props.initialValues
    this.state = {
      budgetVisable: !_.isEmpty(budget) || budgetIntro || elaAddress ? true : false,
      disabled: !_.isEmpty(budget) || budgetIntro || elaAddress ? true : false,
      addressErr: '',
      itemErr: '',
      changeNum: this.props.controVar,
      milestone: []
    }
    if (this.count == 0 && !_.isEmpty(budget) || budgetIntro || elaAddress) {
      this.props.budgetValidator.setBudgetValidator(true)
      this.count = 1
    }
  }

  componentDidUpdate() {
    const { controVar } = this.props
    const { changeNum } = this.state
    if (controVar!== changeNum) {
      this.setState({
        changeNum: controVar
      })
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
    const { milestone } = this.state
    const address = _.get(value, 'elaAddress')
    const pItems = _.get(value, 'paymentItems')
    if (!this.validateAddress(address)) {
      this.setState({
        addressErr: I18N.get('suggestion.form.error.elaAddress')
      })
      return cb(I18N.get('suggestion.form.error.elaAddress'))
    }
    if (_.isEmpty(pItems)) {
      this.setState({
        addressErr: I18N.get('suggestion.form.error.schedule')
      })
      return cb(I18N.get('suggestion.form.error.schedule'))
    }
    if (milestone.length != pItems.length) {
      this.setState({
        addressErr: I18N.get('suggestion.form.error.payment')
      })
      return cb(I18N.get('suggestion.form.error.payment'))
    }
    this.setState({addressErr:""})
    return cb()
  }

  getImplementation() {
    const { getFieldDecorator } = this.props
    const { changeNum } = this.state
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
        controVar={changeNum}
        getFieldDecorator={getFieldDecorator}
        callback={this.props.callback}
      />
    )
  }

  getBudget() {
    const { getFieldDecorator } = this.props
    const { changeNum } = this.state
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
        controVar={changeNum}
        getFieldDecorator={getFieldDecorator}
        callback={this.props.callback}
      />
    )
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.toggle()
    }, 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  hiddenBudget = () => {
    this.setState({
      budgetVisable: !this.state.budgetVisable
    })
    this.props.budgetValidator.setBudgetValidator(!this.state.budgetVisable)
    this.props.budgetValidator.setState({
      errorKeys: {..._.omit(this.props.budgetValidator.state.errorKeys,['budget','planBudget'])}
    })
    this.toggle()
  }

  toggle = () => {
    const data = this.props.form.getFieldValue("budget")
    const budgetIntro = this.props.form.getFieldValue("budgetIntro")
    const plan = this.props.form.getFieldValue("plan")
    if (!_.isEmpty(budgetIntro)
      || !_.isEmpty(data.elaAddress)
      || (data.paymentItems instanceof Array && data.paymentItems.length > 0)
    ) {
      this.setState({
        disabled: true,
        milestone: _.get(plan, "milestone")
      })
    } else {
      this.setState({
        disabled: false,
        milestone: _.get(plan, "milestone")
      })
    }
  }

  ord_render() {
    const implementation = this.getImplementation()
    const budget = this.getBudget()
    const errorTxt = this.state.addressErr || this.state.itemErr
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
          <ErrorLab>{errorTxt}</ErrorLab>
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

const ErrorLab = styled.div`
  color: red;
`