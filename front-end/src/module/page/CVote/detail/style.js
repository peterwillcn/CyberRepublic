import styled from 'styled-components'
import { Anchor, Button } from 'antd'
import { breakPoint } from '@/constants/breakPoint'
import { text } from '@/constants/color'

export const Container = styled.div`
  padding: 30px 50px 80px 150px;
  width: 80vw;
  margin: 0 auto;
  background: #ffffff;
  text-align: left;
  .cr-backlink {
    position: fixed;
    left: 27px;
  }
  @media only screen and (max-width: ${breakPoint.mobile}) {
    padding: 15px;
    width: 100%;
    overflow: hidden;
    .cr-backlink {
      display: none;
    }
    .budget-payment-list {
      overflow-x: scroll;
    }
  }
`

export const VoteBtnGroup = styled.div`
  display: flex;
  margin-top: 30px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    display: block;
    .ant-btn {
      margin-bottom: 10px;
    }
  }
`

export const Label = styled.span`
  background: #f2f6fb;
  padding: 3px 10px;
  margin-bottom: 16px;
  display: inline-block;
`

export const Title = styled.h2`
  ${(props) =>
    props.smallSpace &&
    `
    padding: 0;
    margin: 0;
    font-size: 24px;
  `} word-break: break-all;
`

export const ContentTitle = styled.h4`
  font-size: 20px;
  padding-bottom: 0;
`

export const FixedHeader = styled.div`
  background: white;
  padding-bottom: 24px;
`

export const SubTitleContainer = styled.div`
  display: flex;
  align-items: flex-end;
`

export const SubTitleHeading = styled.div`
  margin-right: 30px;
  ${(props) =>
    props.smallSpace &&
    `
    font-size: 14px;
  `} .value {
    background: #1de9b6;
    padding: 0 5px;
  }
  .text {
    font-size: 11px;
    color: rgba(3, 30, 40, 0.4);
  }
`

export const Body = styled.div``

export const StyledAnchor = styled(Anchor)`
  position: fixed;
  top: 250px;
  left: 30px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    display: none;
  }
  .ant-anchor-ink:before {
    width: 0;
  }
  .ant-anchor-ink-ball.visible {
    display: none;
  }
  .ant-anchor-link-title {
    display: inline;
  }
  .ant-anchor-link-active > .ant-anchor-link-title {
    color: initial;
    :after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 0.5em;
      border-bottom: 8px solid ${text.green};
      z-index: -1;
    }
  }
`

export const StyledRichContent = styled.div`
  .md-RichEditor-root {
    figure.md-block-image {
      background: none;
    }
    figure.md-block-image figcaption .public-DraftStyleDefault-block {
      text-align: left;
    }
  }
`

export const LinkGroup = styled.div`
  ${(props) => props.marginTop && `margin-top: ${props.marginTop}px;`};
`

export const Part = styled.div`
  .preamble {
    font-family: Synthese;
    font-size: 13px;
    line-height: 18px;
    align-items: center;
    color: #000;
  }
`

export const PartTitle = styled.h4`
  font-family: Synthese;
  font-size: 20px;
  line-height: 28px;
  color: #000;
`

export const PartContent = styled.div``

export const Subtitle = styled.div`
  margin: 24px 0;
  color: #000000;
  font-weight: 500;
`

export const Paragraph = styled.div`
  color: rgba(0, 0, 0, 0.75);
  font-variant-ligatures: common-ligatures;
  line-height: 1.8;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`

export const StyledRow = styled.div`
  width: 100%;
  border-bottom: 1px solid #edf1f5;
  margin-bottom: 10px;
  > button {
    margin: 0 4px;
  }
  p {
    padding: 0px;
    margin-top: 5px;
  }
`
export const StyledTab = styled.div`
  font-size: 18px;
`
export const StyledTabs = styled.div`
  .ant-tabs-nav {
    color: #afb6c3;
  }
  .ant-tabs-nav .ant-tabs-tab:hover {
    color: #333333;
  }
  .ant-tabs-nav .ant-tabs-tab-active {
    color: #333333;
  }
  .ant-tabs-nav .ant-tabs-tab-active:hover {
    color: #333333;
  }
  .ant-tabs-ink-bar {
    background-color: #1de9b6;
    height: 4px;
  }
`
export const StyledButton = styled(Button)`
  height: 48px !important;
`
