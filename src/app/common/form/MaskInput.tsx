import { Form, FormItemProps, Input } from "antd";
import { Rule, RuleObject } from "antd/lib/form";
import React from "react";
import MaskedInput, { Mask } from "react-text-mask";

interface IProps {
  formProps: FormItemProps<any>;
  required?: boolean;
  prefix?: React.ReactNode;
  placeholder?: string;
  readonly?: boolean;
  mask: (string | RegExp)[];
  width?: string | number;
  validator?: (_: RuleObject, value: any) => Promise<any>;
}

const MaskInput = ({
  formProps: itemProps,
  required,
  prefix,
  placeholder,
  readonly,
  mask,
  width,
  validator,
}: IProps) => {
  let rules: any[] = [];

  if (required) {
    rules.push({
      required: true,
      message: "El campo es requerido",
      whitespace: true,
    });
  }

  if (validator) {
    rules.push({ validator });
  }

  return (
    <Form.Item
      {...itemProps}
      name={itemProps.name}
      label={itemProps.label}
      labelAlign={itemProps.labelAlign ?? "right"}
      rules={rules}
    >
      <MaskedInput
        placeholder={placeholder}
        mask={mask}
        disabled={readonly}
        render={(ref: any, props: any) => (
          <input
            // autoComplete={itemProps.name?.toString()}
            className="ant-input"
            ref={(input) => input && ref(input)}
            {...props}
            disabled={readonly}
            autoComplete="off"
            // prefix={prefix}

            placeholder={placeholder ?? itemProps.label?.toString()}
            style={{ width: width ?? "100%" }}
          />
        )}
      />
    </Form.Item>
  );
};

export default MaskInput;
