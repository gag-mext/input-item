/* tslint:disable:jsx-no-multiline-js */
import '../style';
import React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';

function noop() {
}

function fixControlledValue(value) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

class InputItem extends React.Component {
  debounceTimeout: any;
  scrollIntoViewTimeout: any;

  constructor(props) {
    super(props);
    this.state = {
      focused: props.focused || false,
      placeholder: props.placeholder,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('placeholder' in nextProps && !nextProps.updatePlaceholder) {
      this.setState({
        placeholder: nextProps.placeholder,
      });
    }
    if ('focused' in nextProps) {
      this.setState({
        focused: nextProps.focused,
      });
    }
  }

  componentWillUnmount() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    if (this.scrollIntoViewTimeout) {
      clearTimeout(this.scrollIntoViewTimeout);
      this.scrollIntoViewTimeout = null;
    }
  }

  componentDidMount() {
    if ((this.props.autoFocus || this.state.focused) && navigator.userAgent.indexOf('AlipayClient') > 0) {
      this.refs.input.focus();
    }
  }

  componentDidUpdate() {
    if (this.state.focused) {
      this.refs.input.focus();
    }
  }

  onInputChange = (e) => {
    let value = e.target.value;
    const { onChange, type } = this.props;

    switch (type) {
      case 'text':
        break;
      case 'bankCard':
        value = value.replace(/\D/g, '').replace(/(....)(?=.)/g, '$1 ');
        break;
      case 'phone':
        value = value.replace(/\D/g, '').substring(0, 11);
        const valueLen = value.length;
        if (valueLen > 3 && valueLen < 8) {
          value = `${value.substr(0, 3)} ${value.substr(3)}`;
        } else if (valueLen >= 8) {
          value = `${value.substr(0, 3)} ${value.substr(3, 4)} ${value.substr(7)}`;
        }
        break;
      case 'number':
        value = value.replace(/\D/g, '');
        break;
      case 'password':
        break;
      default:
        break;
    }
    if (onChange) {
      onChange(value);
    }
  }

  onInputBlur = (e) => {
    this.debounceTimeout = setTimeout(() => {
      this.setState({
        focus: false,
      });
    }, 200);
    if (!('focused' in this.props)) {
      this.setState({
        focused: false,
      });
    }
    const value = e.target.value;
    if (this.props.onBlur) {
      this.props.onBlur(value);
    }
  }

  onInputFocus = (e) => {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    if (!('focused' in this.props)) {
      this.setState({
        focused: true,
      });
    }

    this.setState({
      focus: true,
    });

    const value = e.target.value;
    if (this.props.onFocus) {
      this.props.onFocus(value);
    }
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      this.scrollIntoViewTimeout = setTimeout(() => {
        try {
          document.activeElement.scrollIntoViewIfNeeded();
        } catch (e) { }
      }, 100);
    }
  }

  onExtraClick = (e) => {
    if (this.props.onExtraClick) {
      this.props.onExtraClick(e);
    }
  }

  onErrorClick = (e) => {
    if (this.props.onErrorClick) {
      this.props.onErrorClick(e);
    }
  }

  clearInput = () => {
    if (this.props.type !== 'password' && this.props.updatePlaceholder) {
      this.setState({
        placeholder: this.props.value,
      });
    }
    if (this.props.onChange) {
      this.props.onChange('');
    }
  }

  render() {
    const {
      prefixCls, prefixListCls, type, value, defaultValue,
      name, editable, disabled, style, clear, children,
      error, className, extra, labelNumber, maxLength,
    } = this.props;

    // note: remove `placeholderTextColor` prop for rn TextInput supports placeholderTextColor
    const otherProps = omit(this.props, ['prefixCls', 'prefixListCls', 'editable', 'style', 'focused',
      'clear', 'children', 'error', 'className', 'extra', 'labelNumber', 'onExtraClick', 'onErrorClick',
      'updatePlaceholder', 'placeholderTextColor','autoFocus', 'type',
    ]);

    const { placeholder, focus } = this.state;
    const wrapCls = classNames({
      [`${prefixListCls}-item`]: true,
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-error`]: error,
      [`${prefixCls}-focus`]: focus,
      [`${prefixCls}-android`]: focus,
      [className]: className,
    });

    const labelCls = classNames({
      [`${prefixCls}-label`]: true,
      [`${prefixCls}-label-2`]: labelNumber === 2,
      [`${prefixCls}-label-3`]: labelNumber === 3,
      [`${prefixCls}-label-4`]: labelNumber === 4,
      [`${prefixCls}-label-5`]: labelNumber === 5,
      [`${prefixCls}-label-6`]: labelNumber === 6,
      [`${prefixCls}-label-7`]: labelNumber === 7,
    });

    const controlCls = classNames({
      [`${prefixCls}-control`]: true,
    });

    let inputType: any = 'text';
    if (type === 'bankCard' || type === 'phone') {
      inputType = 'tel';
    } else if (type === 'password') {
      inputType = 'password';
    } else if (type !== 'text' && type !== 'number') {
      inputType = type;
    }

    let valueProps;
    if ('value' in this.props) {
      valueProps = {
        value: fixControlledValue(value),
      };
    } else {
      valueProps = {
        defaultValue,
      };
    }

    let patternProps;
    if (type === 'number') {
      patternProps = {
        pattern: '[0-9]*',
      };
    }

    return (
      <div className={wrapCls} style={style}>
        {children ? (<div className={labelCls}>{children}</div>) : null}
        <div className={controlCls}>
          <input
            ref="input"
            {...patternProps}
            {...otherProps}
            {...valueProps}
            type={inputType}
            maxLength={maxLength}
            name={name}
            placeholder={placeholder}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
            onFocus={this.onInputFocus}
            readOnly={!editable}
            disabled={disabled}
          />
        </div>
        {clear && editable && !disabled && (value && value.length > 0) ?
          <div
            className={`${prefixCls}-clear`}
            onClick={this.clearInput}
          />
          : null}
        {error ? (<div className={`${prefixCls}-error-extra`} onClick={this.onErrorClick} />) : null}
        {extra !== '' ? <div className={`${prefixCls}-extra`} onClick={this.onExtraClick}>{extra}</div> : null}
      </div>
    );
  }
}
InputItem.defaultProps = {
      prefixCls: 'am-input',
      prefixListCls: 'am-list',
      type: 'text',
      editable: true,
      disabled: false,
      placeholder: '',
      clear: false,
      onChange: noop,
      onBlur: noop,
      onFocus: noop,
      extra: '',
      onExtraClick: noop,
      error: false,
      onErrorClick: noop,
      labelNumber: 5,
      updatePlaceholder: false,
};
InputItem.propTypes = {
  prefixCls: React.PropTypes.string,
  /** web only */
  prefixListCls: React.PropTypes.string,
  /** web only */
  className: React.PropTypes.string,
  type:React.PropTypes.oneOf(['text','bankCard','phone','password','number','idcard','digit']),
  editable: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  name: React.PropTypes.string,
  value: React.PropTypes.string,
  defaultValue: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  clear: React.PropTypes.bool,
  maxLength: React.PropTypes.number,
  onChange:React.PropTypes.func,
  onBlur:React.PropTypes.func,
  onFocus:React.PropTypes.func,
  extra:React.PropTypes.node,
  onExtraClick:React.PropTypes.func,
  onExtraPress:React.PropTypes.func,
  error: React.PropTypes.bool,
  onErrorClick:React.PropTypes.func,
  onErrorPress:React.PropTypes.func,
  size:React.PropTypes.oneOf(['large','small']),
  labelNumber: React.PropTypes.number,
  labelPosition:React.PropTypes.oneOf(['left','top']),
  textAlign:React.PropTypes.oneOf(['left','center'])

};
InputItem.displayName = "InputItem";
module.exports=InputItem;
