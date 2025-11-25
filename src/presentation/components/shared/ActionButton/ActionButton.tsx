import React from 'react';
import './ActionButton.css';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (type !== 'submit') {
      e.preventDefault();
    }
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const buttonClass = [
    'action-button',
    `action-button--${variant}`,
    `action-button--${size}`,
    loading && 'action-button--loading',
    disabled && 'action-button--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && <span className="action-button__spinner" aria-hidden="true" />}
      <span className={loading ? 'action-button__text--hidden' : 'action-button__text'}>
        {children}
      </span>
    </button>
  );
};
