import * as React from 'react'

function ScanSvgIcon(props) {
  return (
    <svg
      className="prefix__icon"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      {...props}
    >
      <path
        d="M178 320V178h142v-50H158c-16.6 0-30 13.4-30 30v162h50zm525.3-142h142.3v142h50V158c0-16.6-13.4-30-30-30H703.3v50zM320.1 845.6H178V704.2h-50v161.4c0 16.6 13.4 30 30 30h162v-50zm525.6-141.4v141.4H703.3v50h162.3c16.6 0 30-13.4 30-30V704.2h-49.9z"
        fill={props.color ? props.color : '#65BDA3'}
      />
      <path
        d="M128.5 320a25 25 0 1050 0 25 25 0 10-50 0zm0 384.2a25 25 0 1050 0 25 25 0 10-50 0zm166.6 166.4a25 25 0 1050 0 25 25 0 10-50 0zm386.2 0a25 25 0 1050 0 25 25 0 10-50 0zm163.9-166.4a25 25 0 1050 0 25 25 0 10-50 0zm0-384a25 25 0 1050 0 25 25 0 10-50 0zM678.3 153a25 25 0 1050 0 25 25 0 10-50 0zm-383.2 0a25 25 0 1050 0 25 25 0 10-50 0zm573.8 383.1H155c-13.8 0-25-11.2-25-25s11.2-25 25-25h713.8c13.8 0 25 11.2 25 25 .1 13.8-11.1 25-24.9 25z"
        fill={props.color ? props.color : '#65BDA3'}
      />
    </svg>
  )
}

export default ScanSvgIcon
