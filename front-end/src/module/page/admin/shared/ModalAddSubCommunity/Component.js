import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { Form, Input, Modal, Select, Button } from 'antd'
import {COMMUNITY_TYPE} from '@/constant'
import config from '@/config'
import I18N from '@/I18N'

const FormItem = Form.Item

export default Form.create()(
  class C extends BaseComponent {
    ord_render () {
      const {visible, onCancel, onCreate, form, communityType} = this.props
      const {getFieldDecorator} = form
      const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 18}
      }

      let contextTitle
      switch (communityType) {
        case COMMUNITY_TYPE.STATE:
          contextTitle = I18N.get('communities.form.title.state')
          break
        case COMMUNITY_TYPE.CITY:
          contextTitle = I18N.get('communities.form.title.city')
          break
        case COMMUNITY_TYPE.REGION:
          contextTitle = I18N.get('communities.form.title.region')
          break
        default:
          contextTitle = I18N.get('communities.form.title.school')
          break
      }

      const footerModal = (
        <div>
          <Button onClick={onCreate} type="primary" className="ant-btn-ebp">{contextTitle}</Button>
          <Button onClick={onCancel}>{I18N.get('communities.btn.cancel')}</Button>
        </div>
      )

      const users = this.props.users || []

      return (
        <Modal
          visible={visible}
          title={contextTitle}
          footer={footerModal}
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label={I18N.get('communities.form.country')}>
              {getFieldDecorator('country')(
                <Select
                  disabled={true}
                  showSearch={true}
                  placeholder={I18N.get('communities.form.leader.country')}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {Object.keys(config.data.mappingCountryCodeToName).map((key, index) => {
                    return (
                      <Select.Option title={config.data.mappingCountryCodeToName[key]} key={index}
                        value={key}>
                        {config.data.mappingCountryCodeToName[key]}
                      </Select.Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={I18N.get('communities.form.name')}>
              {getFieldDecorator('name', {
                rules: [{required: true, message: `${I18N.get('communities.form.required')}`}]
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={I18N.get('communities.form.leader')}>
              {getFieldDecorator('leader', {
                rules: [{required: false, message: `${I18N.get('communities.form.required')}`}]
              })(
                <Select
                  showSearch={true}
                  placeholder={I18N.get('communities.form.leader.placeholder')}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {users.map((leader, index) => {
                    return (<Select.Option key={index} value={leader._id}>{leader.username}</Select.Option>)
                  })}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      )
    }
  },
)
