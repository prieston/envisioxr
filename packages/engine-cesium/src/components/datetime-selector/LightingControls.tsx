import React from "react";
import { SwitchContainer, SwitchLabel, StyledSwitch } from "../CesiumDateTimeSelector.styles";

interface LightingControlsProps {
  lightingEnabled: boolean;
  shadowsEnabled: boolean;
  disabled: boolean;
  onLightingToggle: (enabled: boolean) => void;
  onShadowsToggle: (enabled: boolean) => void;
}

export const LightingControls: React.FC<LightingControlsProps> = ({
  lightingEnabled,
  shadowsEnabled,
  disabled,
  onLightingToggle,
  onShadowsToggle,
}) => {
  return (
    <>
      <SwitchContainer onClick={() => !disabled && onLightingToggle(!lightingEnabled)}>
        <SwitchLabel>Daytime Lighting</SwitchLabel>
        <StyledSwitch
          checked={lightingEnabled}
          onChange={(e) => onLightingToggle(e.target.checked)}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      </SwitchContainer>

      <SwitchContainer onClick={() => !disabled && onShadowsToggle(!shadowsEnabled)}>
        <SwitchLabel>Cast Shadows</SwitchLabel>
        <StyledSwitch
          checked={shadowsEnabled}
          onChange={(e) => onShadowsToggle(e.target.checked)}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      </SwitchContainer>
    </>
  );
};

