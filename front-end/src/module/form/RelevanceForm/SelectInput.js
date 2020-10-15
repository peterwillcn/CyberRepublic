import { Select, Icon } from 'antd';
import debounce from 'lodash/debounce';
import React, { Component } from 'react'

const { Option } = Select;

class ProposalsSelect extends Component {
  constructor(props) {
    super(props)
    this.fetchProposal = debounce(this.fetchProposal.bind(this), 800)
    this.state = {
      data: [],
      proposal: undefined,
    }
  }

  fetchProposal = async (value) => {
    const { getProposalTitle } = this.props
    this.setState({ data: [], fetching: true })
    const rs = await getProposalTitle(value)
    if (rs) {
      const data = rs.map((obj) => ({
        text: `${obj.title}`,
        proposal: obj._id
      }))
      this.setState({ data, fetching: false })
    }
  }

//   handleChange = (value) => {
//     this.setState({
//       value,
//       data: [],
//       fetching: false
//     })
//   }

  handleSearch = value => {
    if (value) {
      fetch(value, data => this.setState({ data }));
    } else {
      this.setState({ data: [] });
    }
  };

  handleChange = value => {
    this.setState({ proposal: value });
  };

  render() {
    const { data, proposal } = this.state
    const option = _.map(data,(o) => (<Option key={o.proposal}>{o.text}</Option>))
    return (
      <Select
        showSearch
        showArrow={true}
        size="large"
        value={proposal}
        filterOption={false}
        onSearch={this.fetchProposal}
        onChange={this.handleChange}
        suffixIcon={<Icon type="search" spin={false} style={{height:'100px !improtant'}} />}
        defaultActiveFirstOption={false}
        notFoundContent={null}
        defaultOpen={false}
        style={{ width: '100%' }}
      >
       {option}
      </Select>
    )
  }
}

export default ProposalsSelect;