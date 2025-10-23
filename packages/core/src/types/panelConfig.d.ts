export type ComponentType = "switch" | "slider" | "dropdown" | "button" | "text" | "number" | "color" | "list" | "custom";
export interface PanelSetting {
    id: string;
    type: ComponentType;
    label: string;
    description?: string;
    defaultValue?: any;
    options?: Array<{
        value: any;
        label: string;
    }>;
    min?: number;
    max?: number;
    step?: number;
    marks?: boolean;
    disabled?: boolean;
    visible?: boolean;
    onChange?: (value: any) => void;
    onClick?: () => void;
    customComponent?: React.ComponentType<any> | string;
    customProps?: Record<string, any>;
}
export interface PanelTab {
    id: string;
    label: string;
    icon?: React.ComponentType<any>;
    settings: PanelSetting[];
}
export interface PanelConfiguration {
    id: string;
    name: string;
    tabs: PanelTab[];
}
export interface EngineConfigurations {
    threejs: PanelConfiguration;
    cesium: PanelConfiguration;
}
//# sourceMappingURL=panelConfig.d.ts.map