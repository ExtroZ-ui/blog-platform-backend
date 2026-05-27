export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}) {
  const wrapperClass = [
    'input',
    error ? 'input--error' : '',
    icon ? 'input--with-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={wrapperClass}>
      {label && <span className="input__label">{label}</span>}

      <span className="input__field">
        {icon && (
          <span className="input__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <input
          className={[
            'input__control',
            icon ? 'input__control--with-icon' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </span>

      {error && <span className="input__error">{error}</span>}
    </label>
  );
}