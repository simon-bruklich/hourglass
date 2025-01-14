import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  Button,
  ButtonProps,
  Form,
} from 'react-bootstrap';
import { ReactQuillProps } from 'react-quill';
import { FaTrashAlt } from 'react-icons/fa';
import { GrDrag } from 'react-icons/gr';
import { useDebounce, useDebouncedCallback } from 'use-debounce/lib';

import { ChangeHandler, normalizeNumber, NumericInput } from '@hourglass/common/NumericInput';
import Loading from '@hourglass/common/loading';
import { HTMLVal } from '@student/exams/show/types';
import Icon from '@student/exams/show/components/Icon';
import CustomEditor from './CustomEditor';

export const DragHandle: React.FC<{
  handleRef: React.Ref<HTMLElement>,
  variant?: ButtonProps['variant'],
  className?: string,
  alignmentClass?: string,
}> = (props) => {
  const {
    handleRef,
    variant = 'secondary',
    className = 'cursor-grab',
    alignmentClass = 'position-absolute t-0 l-0 z-1000',
  } = props;
  return (
    <span
      className={`${alignmentClass} btn btn-sm btn-${variant} ${className}`}
      ref={handleRef}
      title="Reorder"
    >
      <Icon I={GrDrag} />
    </span>
  );
};

export const DestroyButton: React.FC<{
  disabled?: boolean;
  className?: string;
  onClick: () => void;
}> = (props) => {
  const {
    disabled = false,
    className = 'position-absolute t-0 r-0 z-1000',
    onClick,
  } = props;
  return (
    <span className={className}>
      <Button
        variant="danger"
        disabled={disabled}
        onClick={onClick}
        className={!disabled ? '' : 'cursor-not-allowed pointer-events-auto'}
        title="Delete"
      >
        <FaTrashAlt />
      </Button>
    </span>
  );
};

export const DebouncedFormControl: React.FC<{
  defaultValue: string;
  debounceMillis?: number;
  onChange: (newVal: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  as?: Parameters<typeof Form.Control>[0]['as'];
  rows?: Parameters<typeof Form.Control>[0]['rows'];
  size?: Parameters<typeof Form.Control>[0]['size'];
}> = (props) => {
  const {
    as,
    rows,
    defaultValue,
    debounceMillis = 1000,
    onChange,
    disabled,
    className,
    placeholder,
    size,
  } = props;
  const [text, setText] = useState(defaultValue);
  const [debouncedText] = useDebounce(text, debounceMillis);
  useEffect(() => {
    if (debouncedText === defaultValue) {
      return;
    }
    onChange(debouncedText);
  }, [debouncedText]);
  useEffect(() => {
    setText(defaultValue);
  }, [defaultValue]);
  return (
    <Form.Control
      as={as}
      rows={rows}
      size={size}
      disabled={disabled}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className={className}
      placeholder={placeholder}
    />
  );
};

export const EditHTMLVal: React.FC<{
  disabled?: boolean;
  value: HTMLVal;
  onChange: (newVal: HTMLVal) => void;
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
  theme?: ReactQuillProps['theme'];
}> = (props) => {
  const {
    disabled = false,
    value,
    onChange,
    placeholder,
    debounceDelay = 0,
    className,
    theme = 'bubble',
  } = props;
  const debouncedOnChange = useDebouncedCallback(
    onChange,
    debounceDelay,
  );
  const handleChange = useCallback((newVal: string, _delta, source, _editor): void => {
    if (source === 'user') {
      debouncedOnChange({
        type: 'HTML',
        value: newVal,
      });
    }
  }, [onChange]);
  return (
    <Loading loading={disabled} noText>
      <CustomEditor
        value={value.value}
        placeholder={placeholder}
        theme={theme}
        onChange={handleChange}
        className={className}
      />
    </Loading>
  );
};

export const NormalizedNumericInput: React.FC<{
  defaultValue?: string;
  disabled?: boolean;
  onCommit: (newVal: number) => void;
  step?: number;
  variant?: ButtonProps['variant'];
}> = (props) => {
  const {
    defaultValue = '',
    disabled = false,
    onCommit,
    step,
    variant,
  } = props;
  const [pointsVal, setPointsVal] = useState(defaultValue);
  const handleChange: ChangeHandler = (newVal: string | number, focused: boolean) => {
    if (focused) {
      const normalized = normalizeNumber(newVal.toString(), pointsVal);
      setPointsVal(normalized);
    } else {
      if (newVal === defaultValue) return;
      onCommit(newVal as number);
    }
  };
  useEffect(() => {
    setPointsVal(defaultValue);
  }, [defaultValue]);
  return (
    <NumericInput
      disabled={disabled}
      value={pointsVal}
      step={step}
      variant={variant}
      onChange={handleChange}
    />
  );
};
