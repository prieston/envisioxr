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
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#2563eb",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#2563eb",
                  },
                }}
              />
            }
            label=""
            sx={{ margin: 0 }}
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
            sx={{
              color: "#2563eb",
              height: 4,
              "& .MuiSlider-thumb": {
                width: 16,
                height: 16,
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.16)",
                },
              },
              "& .MuiSlider-track": {
                border: "none",
              },
              "& .MuiSlider-rail": {
                opacity: 0.3,
                backgroundColor: "rgba(100, 116, 139, 0.3)",
              },
            }}
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
            sx={{
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              fontSize: "0.75rem", // 12px - dropdown text
              "& .MuiSelect-select": {
                padding: "8.5px 14px", // Standard input padding
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(226, 232, 240, 0.8)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(37, 99, 235, 0.4)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2563eb",
                borderWidth: "2px",
              },
            }}
          >
            {setting.options?.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  fontSize: "0.75rem", // 12px - menu items
                  "&.Mui-selected": {
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(37, 99, 235, 0.12)",
                    },
                  },
                }}
              >
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
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem", // 12px - button text
              borderColor: "rgba(37, 99, 235, 0.3)",
              color: "#2563eb",
              padding: "6px 16px",
              "&:hover": {
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.08)",
              },
            }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.75rem", // 12px - input text
                "& input": {
                  padding: "8.5px 14px", // Standard input padding
                },
                "& fieldset": {
                  borderColor: "rgba(226, 232, 240, 0.8)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(37, 99, 235, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2563eb",
                  borderWidth: "2px",
                },
              },
            }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.75rem", // 12px - input text
                "& input": {
                  padding: "8.5px 14px", // Standard input padding
                },
                "& fieldset": {
                  borderColor: "rgba(226, 232, 240, 0.8)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(37, 99, 235, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2563eb",
                  borderWidth: "2px",
                },
              },
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
