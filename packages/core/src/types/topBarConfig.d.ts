export type TransformMode = "translate" | "rotate" | "scale";
export interface TopBarTool {
    id: string;
    type: "transform" | "action" | "custom";
    label: string;
    icon?: React.ComponentType<any>;
    visible?: boolean;
    disabled?: boolean;
    active?: boolean;
    onClick?: () => void;
    customComponent?: React.ComponentType<any> | string;
    customProps?: Record<string, any>;
}
export interface TopBarSection {
    id: string;
    type: "left" | "center" | "right";
    tools: TopBarTool[];
}
export interface TopBarConfiguration {
    id: string;
    name: string;
    sections: TopBarSection[];
}
export interface EngineTopBarConfigurations {
    threejs: TopBarConfiguration;
    cesium: TopBarConfiguration;
}
//# sourceMappingURL=topBarConfig.d.ts.map