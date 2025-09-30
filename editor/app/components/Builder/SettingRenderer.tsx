import React from "react";
import {
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  TextField,
} from "@mui/material";
import {
  SettingContainer,
  CustomSettingContainer,
  SettingLabel,
  SettingDescription,
} from "./SettingRenderer.styles";
import { PanelSetting } from "@envisio/core/types";
import { getComponent } from "./ComponentRegistry";

interface SettingRendererProps {
  setting: PanelSetting;
  value?: any;
  onChange?: (value: any) => void;
}

const SettingRenderer: React.FC<SettingRendererProps> = ({
  setting,
  value,
  onChange,
}) => {
  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
    if (setting.onChange) {
      setting.onChange(newValue);
    }
  };

  const handleClick = () => {
    if (setting.onClick) {
      setting.onClick();
    }
  };

  const renderComponent = () => {
    switch (setting.type) {
      case "switch":
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value ?? setting.defaultValue ?? false}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={setting.disabled}
              />
            }
            label=""
          />
        );

      case "slider":
        return (
          <Slider
            value={value ?? setting.defaultValue ?? 0}
            onChange={(_, newValue) => handleChange(newValue)}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            marks={setting.marks}
            disabled={setting.disabled}
            valueLabelDisplay="auto"
          />
        );

      case "dropdown":
        return (
          <Select
            value={value ?? setting.defaultValue ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            fullWidth
            size="small"
            disabled={setting.disabled}
          >
            {setting.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );

      case "button":
        return (
          <Button
            variant="outlined"
            onClick={handleClick}
            disabled={setting.disabled}
            fullWidth
            size="small"
          >
            {setting.label}
          </Button>
        );

      case "text":
        return (
          <TextField
            value={value ?? setting.defaultValue ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            fullWidth
            size="small"
            disabled={setting.disabled}
            variant="outlined"
          />
        );

      case "number":
        return (
          <TextField
            type="number"
            value={value ?? setting.defaultValue ?? 0}
            onChange={(e) => handleChange(Number(e.target.value))}
            fullWidth
            size="small"
            disabled={setting.disabled}
            variant="outlined"
            inputProps={{
              min: setting.min,
              max: setting.max,
              step: setting.step,
            }}
          />
        );

      case "custom":
        if (setting.customComponent) {
          let CustomComponent: React.ComponentType<any> | null = null;

          if (typeof setting.customComponent === "string") {
            CustomComponent = getComponent(setting.customComponent);
          } else {
            CustomComponent = setting.customComponent;
          }

          if (CustomComponent) {
            return (
              <CustomComponent
                value={value ?? setting.defaultValue}
                onChange={handleChange}
                onClick={handleClick}
                disabled={setting.disabled}
                {...setting.customProps}
              />
            );
          }
        }
        return null;

      default:
        return null;
    }
  };

  if (setting.visible === false) {
    return null;
  }

  const Container =
    setting.type === "custom" ? CustomSettingContainer : SettingContainer;

  return (
    <Container>
      {setting.type !== "button" && setting.type !== "custom" && (
        <SettingLabel>{setting.label}</SettingLabel>
      )}
      {setting.description && setting.type !== "custom" && (
        <SettingDescription>{setting.description}</SettingDescription>
      )}
      {renderComponent()}
    </Container>
  );
};

export default SettingRenderer;
