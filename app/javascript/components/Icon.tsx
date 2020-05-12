import React from 'react';
import { IconType } from 'react-icons';
import { AiOutlineLoading } from 'react-icons/ai';
import './Icon.css';

const ICON_SIZE = '1.5em';

interface IconProps {
  I: IconType;
  className?: string;
}

const Icon: React.FC<IconProps> = (props) => {
  const {
    I,
    className = '',
  } = props;
  const spin = I === AiOutlineLoading;
  const spinClass = spin ? 'icon-spin' : '';
  const allClasses = `${className} ${spinClass}`;
  return (
    <span className={allClasses}>
      <I size={ICON_SIZE} />
    </span>
  );
};

export default Icon;
