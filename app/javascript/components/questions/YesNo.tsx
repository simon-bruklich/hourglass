import React from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { YesNoInfo } from '@hourglass/types';

export interface YesNoProps {
  info: YesNoInfo;
  yesLabel?: string;
  noLabel?: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
  disabled: boolean;
}

const YesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    yesLabel = 'Yes',
    noLabel = 'No',
    value,
    onChange,
    disabled,
  } = props;
  const { prompt } = info;
  // if (readOnly) {
  //   if (value === undefined) {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <i>No answer given</i>
  //     </React.Fragment>);
  //   } else {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <span className="btn btn-sm btn-outline-dark disabled">
  //         {value ? "Yes" : "No"}
  //       </span>
  //     </React.Fragment>)
  //   }
  // } else {
  return (
    <div>
      <div>{prompt}</div>
      <ToggleButtonGroup
        name="tbg"
        type="radio"
        value={value}
        onChange={onChange}
      >
        <ToggleButton
          disabled={disabled}
          variant={value ? 'primary' : 'outline-primary'}
          value
        >
          {yesLabel}
        </ToggleButton>
        <ToggleButton
          disabled={disabled}
          variant={(value === false) ? 'primary' : 'outline-primary'}
          value={false}
        >
          {noLabel}
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default YesNo;