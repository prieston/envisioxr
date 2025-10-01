import type { Preview } from "@storybook/react-vite";
import ThemeModeProvider from "../src/theme/ThemeModeProvider";
import React from "react";

// Make React available globally for JSX
if (typeof global !== 'undefined') {
  (global as any).React = React;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#0b0f1a",
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeModeProvider>
        <Story />
      </ThemeModeProvider>
    ),
  ],
};

export default preview;
