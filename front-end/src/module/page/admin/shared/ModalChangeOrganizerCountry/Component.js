import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { Form, Input, Modal, Select, Button } from 'antd'
import config from '@/config'
import I18N from '@/I18N'

const FormItem = Form.Item

export default Form.create()(
  class C extends BaseComponent {
    ord_render () {
      const {visible, onCancel, onCreate, handleRemoveCountry, form} = this.props
      const {getFieldDecorator} = form
      const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 18}
      }

      const footerModal = (
        <div>
          <Button onClick={onCreate} type="primary" className="ant-btn-ebp">
            {I18N.get('communities.form.organizer.change')}
          </Button>
          {/* Don't need on this pharse */}
          {/* <Button onClick={handleRemoveCountry}>Remove country</Button> */}
          <Button onClick={onCancel}>{I18N.get('communities.btn.cancel')}</Button>
        </div>
      )

      const users = this.props.users || []

      return (
        <Modal
          visible={visible}
          title={I18N.get('communities.form.organizer.change')}
          footer={footerModal}
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label={I18N.get('communities.form.country')}>
              {getFieldDecorator('geolocation', {})(
                <Select
                  disabled={true}
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
              label={I18N.get('communities.form.organizer')}>
              {getFieldDecorator('leader', {
                rules: [{required: true, message: 'This field is required'}]
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
