# Storybook for @envisio/ui

This package includes a comprehensive Storybook setup for documenting and showcasing the EnvisioXR UI components.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Running Storybook

```bash
# Navigate to the UI package
cd packages/ui

# Install dependencies (if not already done)
pnpm install

# Start Storybook development server
pnpm storybook
```

Storybook will be available at `http://localhost:6006`

### Building Storybook

```bash
# Build static Storybook files
pnpm build-storybook
```

The built files will be in the `storybook-static` directory.

## Stories Overview

### 1. Panel Containers (`PanelContainers.stories.tsx`)

- **LeftPanelContainer**: Glass-morphism left panel with preview mode support
- **RightPanelContainer**: Glass-morphism right panel with preview mode support
- **TabPanel**: Scrollable content area with custom scrollbar styling
- **Combined Layout**: Complete interface layout with all panels

### 2. Theme System (`Theme.stories.tsx`)

- **ThemeProvider**: Complete theme system with light/dark mode toggle
- **Light Theme**: Light mode preview with all components
- **Dark Theme**: Dark mode preview with all components
- **Theme Colors**: Color palette showcase for both themes

### 3. Complete Overview (`Overview.stories.tsx`)

- **Complete Interface**: Full EnvisioXR editor interface mockup
- **Preview Mode**: Interface in preview/disabled state

## Features

### Theme Integration

- Automatic theme provider wrapping for all stories
- Light/dark mode toggle functionality
- Custom background options for testing
- Material-UI theme integration

### Interactive Controls

- Preview mode toggle for panels
- Theme mode switching
- Responsive layout testing
- Component state management

### Documentation

- Comprehensive component documentation
- Usage examples and best practices
- Interactive property controls
- Visual regression testing support

## Configuration

### Storybook Configuration (`.storybook/main.ts`)

- Vite builder for fast development
- TypeScript support
- MDX documentation support
- Essential addons included

### Preview Configuration (`.storybook/preview.ts`)

- Theme provider decorator
- Custom background options
- Global parameter settings
- Control matchers for better UX

## Addons Included

- **@storybook/addon-essentials**: Core functionality (controls, actions, viewport, etc.)
- **@storybook/addon-docs**: Documentation and MDX support
- **@storybook/addon-interactions**: Interaction testing
- **@storybook/addon-links**: Navigation between stories
- **@storybook/addon-themes**: Theme switching capabilities
- **@storybook/addon-onboarding**: Getting started guide

## Development

### Adding New Stories

1. Create a new `.stories.tsx` file in `src/stories/`
2. Follow the existing pattern for story structure
3. Include proper TypeScript types
4. Add comprehensive documentation

### Story Structure

```typescript
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof YourComponent> = {
  title: "Category/Component Name",
  component: YourComponent,
  parameters: {
    layout: "fullscreen", // or 'centered', 'padded'
    docs: {
      description: {
        component: "Component description",
      },
    },
  },
  argTypes: {
    // Define control types for props
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Troubleshooting

### Common Issues

1. **Version Conflicts**: Ensure all Storybook packages are on compatible versions
2. **Theme Issues**: Make sure ThemeModeProvider is properly imported and used
3. **Build Errors**: Check TypeScript configuration and import paths

### Getting Help

- Check the [Storybook documentation](https://storybook.js.org/docs)
- Review existing stories for patterns
- Check the browser console for errors

## Contributing

When adding new components to the UI package:

1. Create corresponding stories
2. Include all component variants
3. Add interactive controls where appropriate
4. Update this documentation if needed
