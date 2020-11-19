import React from 'react'
import { Form, Input, Button, Row, Tabs, message, Select } from 'antd'
import _ from 'lodash'
import BaseComponent from '@/model/BaseComponent'
import I18N from '@/I18N'
import { ABSTRACT_MAX_WORDS, TAB_KEYS, NEW_TAB_KEYS } from '@/constant'
import CircularProgressbar from '@/module/common/CircularProgressbar'
import CodeMirrorEditor from '@/module/common/CodeMirrorEditor'
import RelevanceSection from './RelevanceSection'
import { wordCounter } from '@/util'
import { SUGGESTION_BUDGET_TYPE, SUGGESTION_TYPE } from '@/constant'
import { Container, TabPaneInner, Note, TabText, CirContainer } from './style'
import SelectSuggType from './SelectSuggType'
import ImplementationAndBudget from './ImplementationAndBudget'
import TeamInfoSection from './TeamInfoSection'
import DuplicateModal from '../DuplicateModalForm/Container'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select

const WORD_LIMIT = ABSTRACT_MAX_WORDS

const { ADVANCE, COMPLETION } = SUGGESTION_BUDGET_TYPE
const {
  NEW_MOTION,
  CHANGE_PROPOSAL,
  CHANGE_SECRETARY,
  TERMINATE_PROPOSAL
} = SUGGESTION_TYPE

class C extends BaseComponent {
  constructor(props) {
    super(props)
    const type = _.get(props, 'initialValues.type')
    const isNewType = _.includes(
      [CHANGE_PROPOSAL, CHANGE_SECRETARY, TERMINATE_PROPOSAL],
      type
    )
    this.timer = -1
    this.state = {
      loading: false,
      activeKey: !isNewType ? TAB_KEYS[0] : NEW_TAB_KEYS[0],
      errorKeys: {},
      type: type ? type : NEW_MOTION,
      tabs: !isNewType ? TAB_KEYS : NEW_TAB_KEYS,
      dupData: {},
      controVar: 1
    }
    const sugg = props.initialValues
    if (
      sugg &&
      sugg.plan &&
      typeof sugg.plan !== 'string' &&
      sugg.plan.milestone
    ) {
      sessionStorage.setItem(
        'plan-milestone',
        JSON.stringify(sugg.plan.milestone)
      )
    }
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.handleSaveDraft()
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
    sessionStorage.removeItem('plan-milestone')
  }

  getActiveKey(key) {
    const { tabs } = this.state
    if (!tabs.includes(key)) return this.state.activeKey
    return key
  }

  handleSave = (e, callback) => {
    e.preventDefault()
    const { form } = this.props
    this.setState({ loading: true })
    form.validateFields(async (err, values) => {
      if (err) {
        this.setState({
          loading: false,
          errorKeys: err,
          activeKey: this.getActiveKey(Object.keys(err)[0])
        })
        return
      }
      const milestone = _.get(values, 'plan.milestone')
      const pItems = _.get(values, 'budget.paymentItems')

      const initiation =
        !_.isEmpty(pItems) && pItems instanceof Array  &&
        pItems.filter(
          (item) => item.type === ADVANCE && item.milestoneKey === '0'
        )
      const completion =
        !_.isEmpty(pItems) && pItems instanceof Array && 
        pItems.filter((item) => {
          return (
            item.type === COMPLETION &&
            item.milestoneKey === (milestone.length - 1).toString()
          )
        })
      if (
        !_.isEmpty(pItems) && pItems instanceof Array && 
        (milestone.length !== pItems.length ||
          initiation.length > 1 ||
          completion.length !== 1)
      ) {
        this.setState({ loading: false })
        message.error(I18N.get('suggestion.form.error.payment'))
        return
      }

      const budget = _.get(values, 'budget')
      const budgetIntro = _.get(values, 'budgetIntro')
      const planIntro = _.get(values, 'planIntro')
      // exclude old suggestion data
      if (budget && typeof budget !== 'string') {
        values.budget = pItems instanceof Array ? budget.paymentItems : []
        values.budgetAmount = budget.budgetAmount
        values.elaAddress = budget.elaAddress
      }
      if (budgetIntro) {
        values.budgetIntro = budgetIntro
      }
      if (planIntro) {
        values.planIntro = planIntro
      }
      if (values.plan && values.teamInfo) {
        values.plan[`teamInfo`] = values.teamInfo
      }
      const rs = this.formatType(values, false)
      if (rs) {
        await callback(rs)
      }
      this.setState({ loading: false })
    })
  }

  handleSubmit = (e) => {
    const { onSubmit } = this.props
    this.handleSave(e, onSubmit)
  }

  handleEditSaveDraft = (e) => {
    const { onSaveDraft } = this.props
    this.handleSave(e, onSaveDraft)
  }

  formatType = (values, saveDraft) => {
    const type = _.get(values, 'type')
    if (type && typeof type !== 'string') {
      values.type = type.type
      switch (type.type) {
        case CHANGE_PROPOSAL:
          if (!saveDraft) {
            if (!type.proposalNum || (!type.newAddress && !type.newOwnerDID)) {
              message.error(I18N.get('suggestion.form.error.changeWhat'))
              return
            }
            if (type.changeAddress && !type.newAddress) {
              message.error(I18N.get('suggestion.form.error.elaAddress'))
              return
            }
            if (type.changeOwner && !type.newOwnerDID) {
              message.error(I18N.get('suggestion.form.error.newOwner'))
              return
            }
          }
          if (type.newAddress) {
            values.newAddress = type.newAddress
          }
          if (type.newOwnerDID) {
            values.newOwnerDID = type.newOwnerDID
          }
          values.targetProposalNum = type.proposalNum
          break
        case CHANGE_SECRETARY:
          if (!saveDraft && !type.newSecretaryDID) {
            message.error(I18N.get('suggestion.form.error.secretary'))
            return
          }
          values.newSecretaryDID = type.newSecretaryDID
          break
        case TERMINATE_PROPOSAL:
          if (!saveDraft && !type.termination) {
            message.error(I18N.get('suggestion.form.error.proposalNum'))
            return
          }
          values.closeProposalNum = type.termination
          break
        default:
          break
      }
    }
    return values
  }

  handleSaveDraft = () => {
    const { isEditMode, form } = this.props
    if (!isEditMode && this.props.onSaveDraft) {
      const values = form.getFieldsValue()
      const budget = form.getFieldValue('budget')
      const planIntro = form.getFieldValue('planIntro')
      const budgetIntro = form.getFieldValue('budgetIntro')
      if (values.plan && values.teamInfo) {
        values.plan[`teamInfo`] = values.teamInfo
      }
      if (budget) {
        values.budget = budget.paymentItems instanceof Array ? budget.paymentItems : []
        values.budgetAmount = budget.budgetAmount
        values.elaAddress = budget.elaAddress
        values.budgetIntro = budgetIntro
      }
      if (planIntro) {
        values.planIntro = planIntro
      }
      const rs = this.formatType(values, true)
      this.props.onSaveDraft(rs)
    }
  }

  handleContinue = (e) => {
    e.preventDefault()
    const { form } = this.props
    const { tabs } = this.state
    form.validateFields((err, values) => {
      if (err) {
        this.setState({
          loading: false,
          errorKeys: err,
          activeKey: this.getActiveKey(Object.keys(err)[0])
        })
        return
      }
      const index = tabs.findIndex((item) => item === this.state.activeKey)
      if (index !== tabs.length - 1) {
        this.setState({ activeKey: tabs[index + 1] })
      }
    })
  }

  getTitleInput() {
    const { initialValues = {} } = this.props
    const { getFieldDecorator } = this.props.form

    return getFieldDecorator('title', {
      rules: [
        { required: true, message: I18N.get('suggestion.form.error.required') }
      ],
      initialValue: initialValues.title
    })(<Input size="large" type="text" />)
  }

  getValidPeriodInput() {
    const { initialValues = {} } = this.props
    const { getFieldDecorator } = this.props.form

    return getFieldDecorator('validPeriod', {
      rules: [
        { required: true, message: I18N.get('suggestion.form.error.required') }
      ],
      initialValue: initialValues.validPeriod ? initialValues.validPeriod : 3
    })(
      <Select>
        {[1, 3, 6, 12].map((el) => (
          <Option value={el} key={el}>
            {el + I18N.get('suggestion.form.unit')}
          </Option>
        ))}
      </Select>
    )
  }

  onTextareaChange = (activeKey) => {
    const { form } = this.props
    const err = form.getFieldError(activeKey)
    const { errorKeys } = this.state
    if (err) {
      this.setState({
        errorKeys: Object.assign({}, errorKeys, { [activeKey]: err })
      })
    } else {
      const newState = Object.assign({}, errorKeys)
      delete newState[activeKey]
      this.setState({ errorKeys: newState })
    }
  }

  validateAbstract = (rule, value, cb) => {
    let count = 0
    if (value) {
      const rs = value.replace(/\!\[image\]\(data:image\/.*\)/g, '')
      count = wordCounter(rs)
    }
    return count > WORD_LIMIT ? cb(true) : cb()
  }

  validatePlan = (rule, value, cb) => {
    if (value && _.isEmpty(value.milestone)) {
      return cb(I18N.get('suggestion.form.error.milestones'))
    }
    return cb()
  }

  validateTeamInfo = (rule, value, cb) => {
    if (_.isEmpty(value)) {
      return cb(I18N.get('suggestion.form.error.team'))
    }
    return cb()
  }

  validateAddress = (value) => {
    const reg = /^[E8][a-zA-Z0-9]{33}$/
    return reg.test(value)
  }

  validateBudget = (rule, value, cb) => {
    const values = this.props.form.getFieldValue('budget')
    if (
      !this.state.budgetValidator &&
      (_.isEmpty(values.elaAddress) || _.isEmpty(values.paymentItems))
    ) {
      return cb()
    }

    if (!this.validateAddress(values.elaAddress)) {
      return cb(I18N.get('suggestion.form.error.elaAddress'))
    }
    if (_.isEmpty(values.paymentItems)) {
      return cb(I18N.get('suggestion.form.error.schedule'))
    }
    return cb()
  }

  validateType = (rule, value, cb) => {
    return value.hasErr ? cb(false) : cb()
  }

  setBudgetValidator = (x) => {
    this.setState({ budgetValidator: x })
  }

  changeType = (type) => {
    const isNewType = _.includes(
      [CHANGE_PROPOSAL, CHANGE_SECRETARY, TERMINATE_PROPOSAL],
      type
    )
    const tabs = !isNewType ? TAB_KEYS : NEW_TAB_KEYS
    this.setState({ type, tabs, errorKeys: {} })
  }

  getTextarea(id) {
    const { dupData, controVar } = this.state
    const { getFieldDecorator, getFieldsValue } = this.props.form

    let initialValues
    if (!_.isEmpty(dupData)) {
      initialValues = dupData
    } else {
      initialValues = _.isEmpty(this.props.initialValues)
        ? { type: '1' }
        : this.props.initialValues
    }

    const rules = [
      {
        required: true,
        message: I18N.get('suggestion.form.error.required')
      }
    ]
    if (id === 'type') {
      rules.push({ validator: this.validateType })
      let data
      switch (initialValues.type) {
        case CHANGE_PROPOSAL:
          data = {
            type: initialValues.type,
            proposalNum: initialValues.targetProposalNum,
            newOwnerDID: initialValues.newOwnerDID,
            newAddress: initialValues.newAddress
          }
          break
        case CHANGE_SECRETARY:
          data = {
            type: initialValues.type,
            newSecretaryDID: initialValues.newSecretaryDID
          }
          break
        case TERMINATE_PROPOSAL:
          data = {
            type: initialValues.type,
            termination: initialValues.closeProposalNum
          }
          break
        default:
          data = { type: initialValues.type }
          break
      }
      return getFieldDecorator(id, {
        rules,
        initialValue: data
      })(
        <SelectSuggType
          initialValue={data}
          controVar={controVar}
          callback={this.onTextareaChange}
          getActiveProposals={this.props.getActiveProposals}
          changeType={this.changeType}
        />
      )
    }

    if (
      id === 'planBudget' &&
      ((initialValues.plan && typeof initialValues.plan !== 'string') ||
        !initialValues.plan)
    ) {
      const rules = []
      if (this.state.budgetValidator) {
        rules.push({
          validator: this.validateBudget
        })
      }
      return getFieldDecorator('planBudget', {
        // rules
      })(
        <ImplementationAndBudget
          getFieldDecorator={getFieldDecorator}
          initialValues={initialValues}
          controVar={controVar}
          budgetValidator={this}
          form={this.props.form}
          callback={this.onTextareaChange}
        />
      )
    }

    if (id === 'teamInfo') {
      let teamInfo = []
      if (initialValues && initialValues.plan) {
        teamInfo = initialValues.plan.teamInfo
      }
      rules.push({
        validator: this.validateTeamInfo
      })
      return getFieldDecorator('teamInfo', {
        initialValue: teamInfo
      })(
        <TeamInfoSection
          title={I18N.get('suggestion.plan.teamInfo')}
          controVar={controVar}
          callback={this.onTextareaChange}
          initialValue={teamInfo}
        />
      )
    }

    if (id === 'relevance') {
      let relevance = []
      if (initialValues.relevance) {
        relevance = initialValues.relevance
      }
      return getFieldDecorator('relevance', {
        initialValue: initialValues[id]
      })(
        <RelevanceSection
          callback={this.onTextareaChange}
          initialValue={relevance}
        />
      )
    }

    return getFieldDecorator(id, {
      rules,
      initialValue: initialValues[id]
    })(
      <CodeMirrorEditor
        callback={this.onTextareaChange}
        controVar={controVar}
        content={initialValues[id]}
        activeKey={id}
        name={id}
        upload={id === 'abstract' ? false : true}
      />
    )
  }

  renderTabText(id) {
    const hasError = _.has(this.state.errorKeys, id)
    if (['relevance', 'planBudget', 'teamInfo'].includes(id)) {
      return (
        <TabText hasErr={hasError}>
          {I18N.get(`suggestion.fields.${id}`)}
        </TabText>
      )
    }
    return (
      <TabText hasErr={hasError}>
        {I18N.get(`suggestion.fields.${id}`)}*
      </TabText>
    )
  }

  renderWordLimit() {
    const { form } = this.props
    const value = form.getFieldValue('abstract')
    let count = 0
    if (value) {
      const rs = value.replace(/\!\[image\]\(data:image\/.*\)/g, '')
      count = wordCounter(rs)
    }
    return (
      <CirContainer>
        <CircularProgressbar count={count} />
      </CirContainer>
    )
  }

  hideContinue = () => {
    const { activeKey, errorKeys, tabs } = this.state
    const index = tabs.findIndex((item) => item === activeKey)
    return _.isEmpty(errorKeys) && index === tabs.length - 1
  }

  ord_render() {
    const { isEditMode } = this.props
    const saveDraftBtn = isEditMode && (
      <Button
        onClick={this.handleEditSaveDraft}
        className="cr-btn cr-btn-default"
        htmlType="button"
        style={{ marginRight: 10 }}
      >
        {I18N.get('suggestion.form.button.saveDraft')}
      </Button>
    )
    const cancelText = isEditMode
      ? I18N.get('suggestion.form.button.discardChanges')
      : I18N.get('suggestion.form.button.cancel')
    const cancelBtn = (
      <Button
        onClick={() => this.props.onCancel()}
        className="cr-btn cr-btn-default"
        htmlType="button"
        style={{ marginRight: 10 }}
      >
        {cancelText}
      </Button>
    )
    return (
      <Container>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label={`${I18N.get('suggestion.form.fields.title')}*`}
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            <div style={{ display: 'flex' }}>
              {this.getTitleInput()}
              <DuplicateModal form={this.props.form} changeData={this.changeData} />
            </div>
          </FormItem>
          <FormItem
            label={`${I18N.get('suggestion.form.fields.validPeriod')}*`}
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 4 }}
            colon={false}
          >
            {this.getValidPeriodInput()}
          </FormItem>
          <Tabs
            animated={false}
            tabBarGutter={5}
            activeKey={this.state.activeKey}
            onChange={this.onTabChange}
          >
            {this.state.tabs.map((item) => (
              <TabPane tab={this.renderTabText(item)} key={item}>
                <TabPaneInner>
                  {item === 'teamInfo' ? null : (
                    <Note>{I18N.get(`suggestion.form.note.${item}`)}</Note>
                  )}
                  <FormItem>{this.getTextarea(item)}</FormItem>
                  {item === 'abstract' ? this.renderWordLimit() : null}
                </TabPaneInner>
              </TabPane>
            ))}
          </Tabs>

          <Row
            gutter={8}
            type="flex"
            justify="center"
            style={{ marginBottom: '30px' }}
          >
            {!this.hideContinue() && (
              <Button
                onClick={this.handleContinue}
                className="cr-btn cr-btn-black"
                htmlType="button"
              >
                {I18N.get('suggestion.form.button.continue')}
              </Button>
            )}
          </Row>

          <Row gutter={8} type="flex" justify="center">
            {cancelBtn}
            {saveDraftBtn}
            <Button
              loading={this.state.loading}
              className="cr-btn cr-btn-primary"
              htmlType="submit"
            >
              {I18N.get('suggestion.form.button.save')}
            </Button>
          </Row>
        </Form>
      </Container>
    )
  }

  changeData = (data) => {
    const { controVar } = this.state
    this.setState({ 
      dupData: data,
      controVar: controVar+1
     })
  }

  onTabChange = (activeKey) => {
    this.setState({ activeKey })
  }
}

export default Form.create()(C)
