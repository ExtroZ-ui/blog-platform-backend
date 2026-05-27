export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}