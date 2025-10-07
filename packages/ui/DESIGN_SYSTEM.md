# EnvisioXR Design System

A comprehensive guide to the EnvisioXR UI design system for consistent, premium component styling across the platform.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Effects](#effects)

---

## Colors

### Brand Colors

```css
--primary-blue: #2563eb --primary-blue-dark: #1d4ed8
  --primary-blue-light: rgba(37, 99, 235, 0.08)
  --primary-blue-hover: rgba(37, 99, 235, 0.12);
```

### Neutral Colors

```css
--slate-50: rgba(248, 250, 252, 0.6) --slate-100: rgba(248, 250, 252, 0.9)
  --slate-200: rgba(226, 232, 240, 0.8) --slate-400: rgba(148, 163, 184, 0.8)
  --slate-500: rgba(100, 116, 139, 0.85) --slate-600: rgba(71, 85, 105, 0.9)
  --slate-700: rgba(51, 65, 85, 0.95) --slate-900: rgba(15, 23, 42, 0.95);
```

### Glass Effect Colors

```css
--glass-bg:
  rgba(255, 255, 255, 0.85) --glass-border: rgba(37, 99, 235, 0.15)
    --glass-shadow: 0 8px 32px rgba(37, 99, 235, 0.12),
  0 2px 8px rgba(0, 0, 0, 0.08);
```

---

## Typography

**App-First Typography System** - Optimized for dense, professional application interfaces.

### Font Sizes

```css
/* Application Typography Scale */
--text-xs: 0.688rem /* 11px - tiny labels, badges */ --text-sm: 0.75rem
  /* 12px - body text, switches, inputs, descriptions */ --text-base: 0.813rem
  /* 13px - section titles, labels, emphasis */ --text-lg: 0.875rem
  /* 14px - headings, card titles */ --text-xl: 1rem
  /* 16px - page titles, major headings */;
```

### Font Weights

```css
--font-normal: 400 /* Body text, descriptions */ --font-medium: 500
  /* Subtle emphasis */ --font-semibold: 600 /* Labels, section titles */
  --font-bold: 700 /* Strong emphasis (rarely used) */;
```

---

### Typography Hierarchy for Apps

#### 1. Section Titles (Panel Headers, Tab Sections)

**Use Case:** "Environment", "Time Simulation", "Properties"

```css
font-size: 0.813rem; /* 13px */
font-weight: 600; /* Semibold */
color: rgba(51, 65, 85, 0.95);
letter-spacing: 0.01em;
text-transform: none; /* Keep natural casing */
```

```jsx
<Typography
  sx={{
    fontSize: "0.813rem",
    fontWeight: 600,
    color: "rgba(51, 65, 85, 0.95)",
    letterSpacing: "0.01em",
    mb: 1,
  }}
>
  Time Simulation
</Typography>
```

#### 2. Control Labels (Switches, Inputs, Buttons)

**Use Case:** "Enable Daytime Lighting", input field labels, button text

```css
font-size: 0.75rem; /* 12px */
font-weight: 400; /* Normal */
color: rgba(51, 65, 85, 0.95);
```

```jsx
<Typography
  sx={{
    fontSize: "0.75rem",
    fontWeight: 400,
    color: "rgba(51, 65, 85, 0.95)",
  }}
>
  Enable Daytime Lighting
</Typography>
```

#### 3. Descriptions & Helper Text

**Use Case:** Secondary information, hints, captions

```css
font-size: 0.75rem; /* 12px */
font-weight: 400; /* Normal */
color: rgba(100, 116, 139, 0.85);
line-height: 1.4;
```

```jsx
<Typography
  sx={{
    fontSize: "0.75rem",
    fontWeight: 400,
    color: "rgba(100, 116, 139, 0.85)",
    lineHeight: 1.4,
  }}
>
  Sync with current date & time
</Typography>
```

#### 4. Input Field Text

**Use Case:** Text inside inputs, dropdowns, text fields

```css
font-size: 0.75rem; /* 12px */
font-weight: 400; /* Normal */
color: rgba(51, 65, 85, 0.95);
```

#### 5. List Items & Table Rows

**Use Case:** Scene objects list, property values

```css
/* Primary text */
font-size: 0.75rem; /* 12px */
font-weight: 600; /* Semibold for emphasis */
color: rgba(51, 65, 85, 0.95);

/* Secondary text */
font-size: 0.688rem; /* 11px */
font-weight: 400; /* Normal */
color: rgba(100, 116, 139, 0.85);
```

---

### Quick Reference Table

| Element Type       | Size | Weight | Color     | Example           |
| ------------------ | ---- | ------ | --------- | ----------------- |
| **Section Title**  | 13px | 600    | Slate-700 | "Environment"     |
| **Control Label**  | 12px | 400    | Slate-700 | "Enable Lighting" |
| **Description**    | 12px | 400    | Slate-500 | Helper text       |
| **Input Text**     | 12px | 400    | Slate-700 | User input        |
| **List Primary**   | 12px | 600    | Slate-700 | Object name       |
| **List Secondary** | 11px | 400    | Slate-500 | Object type       |

---

### Why This Scale Works for Apps

1. **Compact** - 12px base allows more content in panels
2. **Hierarchical** - Clear distinction between sections (13px bold) and content (12px normal)
3. **Readable** - 12px is readable on modern displays
4. **Professional** - Matches tools like Figma, VSCode, Blender
5. **Scannable** - Bold section headers stand out, content recedes

---

## Border Radius

All interactive and container elements use consistent border radius:

```css
/* Standard for all interactive elements */
--border-radius-sm: 8px /* Buttons, inputs, list items, dropdowns, tabs */
  --border-radius-md: 12px /* Cards, setting containers, panels */
  --border-radius-lg: 20px /* Main containers, dialogs */;
```

**Rule:** All clickable items (buttons, list items, tabs, dropdowns, icon buttons) MUST have `border-radius: 8px`.

---

## Spacing

### Scale (based on 8px grid)

```css
--spacing-0.5: 4px --spacing-0.75: 6px --spacing-1: 8px --spacing-1.25: 10px
  --spacing-1.5: 12px --spacing-2: 16px --spacing-2.5: 20px --spacing-3: 24px;
```

### Common Patterns

- **Between settings:** 12px (`spacing-1.5`)
- **Panel padding:** 20px (`spacing-2.5`)
- **Input/Control padding (white containers):** `14px` left/right, `8.5px` top/bottom
- **Label to control:** 6px (`spacing-0.75`)
- **Title to content:** 10px (`spacing-1.25`)

**Note:** The `14px × 8.5px` padding is specifically for white-background containers housing switches, inputs, dropdowns, and other interactive controls.

---

## Component Heights

Standardized heights for consistent visual alignment:

```css
/* Inputs & Dropdowns */
--input-height: 38px /* Buttons */ --button-small: 32px --button-medium: 38px
  /* Matches input height */ --button-large: 44px;
```

---

## Components

### Buttons

#### Primary Button (Contained)

```jsx
<Button
  variant="contained"
  sx={{
    minHeight: "38px", // Standard button height (matches inputs)
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "0 16px",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  }}
>
  Button Text
</Button>
```

**Sizes:**

- Small: `minHeight: "32px"`, `padding: "0 12px"`
- Medium (default): `minHeight: "38px"`, `padding: "0 16px"`
- Large: `minHeight: "44px"`, `padding: "0 20px"`

#### Secondary Button (Outlined)

```jsx
<Button
  variant="outlined"
  sx={{
    minHeight: "38px", // Standard button height (matches inputs)
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    borderColor: "rgba(37, 99, 235, 0.3)",
    color: "#2563eb",
    padding: "0 16px",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    "&:hover": {
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.08)",
    },
  }}
>
  Button Text
</Button>
```

---

### Dropdowns (Select)

```jsx
<Select
  value={value}
  onChange={handleChange}
  fullWidth
  size="small"
  sx={{
    minHeight: "38px", // Standard input height
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.875rem",
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
  <MenuItem
    value="option1"
    sx={{
      fontSize: "0.875rem",
      "&.Mui-selected": {
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        "&:hover": {
          backgroundColor: "rgba(37, 99, 235, 0.12)",
        },
      },
    }}
  >
    Option 1
  </MenuItem>
</Select>
```

---

### Text Inputs (TextField)

```jsx
<TextField
  value={value}
  onChange={handleChange}
  fullWidth
  size="small"
  variant="outlined"
  sx={{
    "& .MuiOutlinedInput-root": {
      minHeight: "38px", // Standard input height
      borderRadius: "8px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      fontSize: "0.875rem",
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
```

### Search/Basic Inputs (Input component)

For search fields or simpler inputs without the TextField wrapper:

```jsx
<Input
  fullWidth
  placeholder="Search..."
  value={value}
  onChange={handleChange}
  startAdornment={<SearchIcon sx={{ mr: 1, color: "text.secondary" }} />}
  sx={{
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "8px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: "0 12px", // Horizontal padding only
    minHeight: "38px", // Standard input height
    fontSize: "0.875rem",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "rgba(37, 99, 235, 0.3)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#2563eb",
      outline: "none",
    },
    "&:before, &:after": {
      display: "none", // Remove default MUI Input underline
    },
  }}
/>
```

**Important Notes:**

- Use `padding: "0 12px"` (horizontal only) instead of `padding: "8px 12px"` to maintain 38px height
- `minHeight: "38px"` ensures consistent height with dropdowns and TextFields
- Full width by default - no wrapper padding needed for proper alignment

---

### Sliders

```jsx
<Slider
  value={value}
  onChange={handleChange}
  min={0}
  max={100}
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
```

---

### Switches

**Important:** Switches do NOT get white background containers. They are binary toggles, not data inputs.

```jsx
<Switch
  checked={checked}
  onChange={handleChange}
  sx={{
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#2563eb",
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#2563eb",
    },
  }}
/>
```

---

## Control Types & Background Rules

### When to Use White Backgrounds

**INPUT-LIKE CONTROLS** (require white background + border):

These controls accept, display, or select data:

- ✅ **Text Fields** - user types text
- ✅ **Number Inputs** - user types numbers
- ✅ **Dropdowns/Selects** - user selects from options
- ✅ **Date/Time Pickers** - user selects date/time
- ✅ **Search Inputs** - user types to search

**Visual Pattern:**

```jsx
sx={{
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: "8px",
  // ... hover/focus states
}}
```

---

### When NOT to Use White Backgrounds

**INLINE TOGGLE CONTROLS** (no background container):

These are small, inline controls that don't need individual containers:

- ❌ **Inline Checkboxes** - in forms or lists where they're part of a larger row
- ❌ **Radio Buttons in groups** - when multiple options are visually grouped together

**Exception: Standalone Switches DO Get Backgrounds**

When switches are presented as **individual setting items** (like in settings panels), they SHOULD get white backgrounds because:

1. Each switch is a separate, clickable control
2. They need visual organization and boundaries
3. The entire row is interactive, not just the toggle
4. Improves scannability and organization

**Visual Pattern for Setting Switches:**

```jsx
// ✅ Each switch gets a white background container
<Box
  sx={{
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "border-color 0.15s ease",
    "&:hover": {
      borderColor: "rgba(37, 99, 235, 0.4)",
      cursor: "pointer",
    },
  }}
>
  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
    Enable Daytime Lighting
  </Typography>
  <Switch checked={value} onChange={handleChange} />
</Box>
```

---

### SLIDER CONTROLS (no background)

Sliders also don't need backgrounds:

- ❌ **Sliders** - visual representation of range

**Why no background?**

- The track itself is the visual element
- The thumb provides the interactive affordance
- Background would compete with the track

---

### Summary Table

| Control Type         | White Background | Border | Example          | Notes                       |
| -------------------- | ---------------- | ------ | ---------------- | --------------------------- |
| Text Input           | ✅ Yes           | ✅ Yes | Name field       | Always                      |
| Number Input         | ✅ Yes           | ✅ Yes | Age field        | Always                      |
| Dropdown/Select      | ✅ Yes           | ✅ Yes | Country selector | Always                      |
| Date/Time Picker     | ✅ Yes           | ✅ Yes | Birthdate        | Always                      |
| Search Input         | ✅ Yes           | ✅ Yes | Search bar       | Always                      |
| **Switch (Setting)** | ✅ Yes           | ✅ Yes | Enable Lighting  | When standalone in settings |
| **Switch (Inline)**  | ❌ No            | ❌ No  | Enable feature   | When inline in forms        |
| **Checkbox**         | ❌ No            | ❌ No  | Agree to terms   | Inline only                 |
| **Radio Button**     | ❌ No            | ❌ No  | Choose option    | Inline only                 |
| **Slider**           | ❌ No            | ❌ No  | Volume control   | Track is visual             |

---

### Visual Reasoning

**Why this distinction matters:**

1. **White backgrounds = "interactive control/field"**
   - User expects to type, select, toggle, or modify something
   - The white box signals "this is a clickable/interactive item"
   - Examples: text boxes, dropdowns, **setting switches**

2. **Standalone vs Inline controls:**
   - **Standalone setting switches** = individual, organized items → need backgrounds
   - **Inline form checkboxes** = part of a larger form flow → no individual backgrounds
   - Context determines the treatment

3. **Organization and scannability:**
   - In settings panels, each switch is a separate decision point
   - White backgrounds create clear visual boundaries between options
   - Users can quickly scan and identify each setting
   - Hover states on the container reinforce clickability

4. **Visual hierarchy:**
   - White background = "this is a distinct, actionable item"
   - No background = "this is part of a larger context"
   - Settings switches are distinct items, so they get backgrounds

---

### Visual Examples

**✅ CORRECT - Data inputs get white backgrounds:**

```jsx
// User enters their name
<TextField
  label="Name"
  value="John Doe"
  sx={{
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.8)", // ✅ White bg
      border: "1px solid rgba(226, 232, 240, 0.8)", // ✅ Border
    }
  }}
/>

// User selects a country
<Select
  value="USA"
  sx={{
    backgroundColor: "rgba(255, 255, 255, 0.8)", // ✅ White bg
    border: "1px solid rgba(226, 232, 240, 0.8)", // ✅ Border
  }}
/>
```

**✅ CORRECT - Binary toggles organized with spacing:**

```jsx
// Multiple switches need consistent spacing and alignment
<Box sx={{ width: "100%" }}>
  <FormControlLabel
    control={<Switch checked={true} />}
    label="Enable Daytime Lighting"
    sx={{
      mb: 1.5, // ✅ Consistent spacing between switches
      width: "100%", // ✅ Full width for alignment
      marginLeft: 0, // ✅ Remove default MUI margin
      display: "flex",
      justifyContent: "space-between", // ✅ Label left, switch right
    }}
  />

  <FormControlLabel
    control={<Switch checked={false} />}
    label="Enable Cast Shadows"
    sx={{
      mb: 1.5,
      width: "100%",
      marginLeft: 0,
      display: "flex",
      justifyContent: "space-between",
    }}
  />
</Box>

// Setting container provides the overall grouping, not individual switch containers
<Box sx={{
  backgroundColor: "rgba(248, 250, 252, 0.6)", // ✅ Container for the group
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "12px"
}}>
  {/* Multiple switches inside */}
  <FormControlLabel
    control={<Switch />}
    label="Enable Shadows"
    sx={{ mb: 1.5, width: "100%", marginLeft: 0 }}
  />
  <FormControlLabel
    control={<Switch />}
    label="Enable Lighting"
    sx={{ width: "100%", marginLeft: 0 }}
  />
</Box>
```

**❌ INCORRECT - Don't wrap switches in white boxes:**

```jsx
// ❌ DON'T DO THIS - creates visual clutter
<Box
  sx={{
    backgroundColor: "rgba(255, 255, 255, 0.8)", // ❌ Unnecessary
    border: "1px solid rgba(226, 232, 240, 0.8)", // ❌ Unnecessary
    padding: "8px",
    borderRadius: "8px",
  }}
>
  <FormControlLabel control={<Switch />} label="Enable Feature" />
</Box>
```

---

### Switch Organization Best Practices

**Problem:** Switches without backgrounds can look disorganized and floating.

**Solution:** Use consistent spacing, alignment, and full-width layout:

```jsx
// ✅ Well-organized switches
<FormControlLabel
  control={<Switch />}
  label="Enable Feature"
  sx={{
    mb: 1.5, // Consistent bottom margin
    width: "100%", // Full width prevents floating
    marginLeft: 0, // Remove MUI default margin
    display: "flex", // Flex for alignment
    justifyContent: "space-between", // Label left, switch right
  }}
/>
```

**Key Organization Rules:**

1. **Full Width** - Always set `width: "100%"` to prevent switches from floating
2. **Consistent Spacing** - Use `mb: 1.5` (12px) between switches
3. **Remove Default Margin** - Set `marginLeft: 0` to override MUI defaults
4. **Alignment** - Use `justifyContent: "space-between"` for label left, switch right
5. **Visual Grouping** - Related switches should be in the same container

**Typography for Switch Labels:**

```jsx
// Create a styled label component
const SwitchLabel = styled(Typography)({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "rgba(51, 65, 85, 0.95)",
  letterSpacing: "0.01em",
});

// Use it
<FormControlLabel
  control={<Switch />}
  label={<SwitchLabel>Enable Feature</SwitchLabel>}
  sx={{ mb: 1.5, width: "100%", marginLeft: 0 }}
/>;
```

---

### Tabs

```jsx
<Tabs
  value={activeTab}
  onChange={handleChange}
  variant="fullWidth"
  sx={{
    mb: 2,
    minHeight: "40px",
    "& .MuiTab-root": {
      color: "rgba(100, 116, 139, 0.8)",
      minHeight: "40px",
      padding: "8px 12px",
      fontSize: "0.813rem",
      fontWeight: 500,
      flexDirection: "row",
      gap: "6px",
      borderRadius: "8px",
      margin: "0 2px",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      textTransform: "none",
      "&:hover": {
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        color: "#2563eb",
      },
      "&.Mui-selected": {
        color: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        fontWeight: 600,
      },
      "& .MuiSvgIcon-root": {
        marginBottom: 0,
        fontSize: "1.1rem",
      },
    },
    "& .MuiTabs-indicator": {
      display: "none",
    },
  }}
>
  <Tab icon={<Icon />} label="Label" />
</Tabs>
```

---

### Setting Container

```jsx
<Box
  sx={{
    marginBottom: "12px",
    padding: "16px",
    backgroundColor: "rgba(248, 250, 252, 0.6)",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "rgba(248, 250, 252, 0.9)",
      borderColor: "rgba(37, 99, 235, 0.2)",
      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
    },
  }}
>
  {/* Setting content */}
</Box>
```

---

### Cards

```jsx
<Card
  sx={{
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px) saturate(130%)",
    WebkitBackdropFilter: "blur(20px) saturate(130%)",
    border: "1px solid rgba(37, 99, 235, 0.3)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(37, 99, 235, 0.15)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
      background: "rgba(37, 99, 235, 0.1)",
    },
  }}
>
  {/* Card content */}
</Card>
```

---

### Panels (Left/Right)

```jsx
<Box
  sx={{
    width: "300px",
    height: "100%",
    maxHeight: "calc(100vh - 120px)",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(24px) saturate(140%)",
    WebkitBackdropFilter: "blur(24px) saturate(140%)",
    padding: "20px",
    border: "1px solid rgba(37, 99, 235, 0.15)",
    borderRadius: "20px",
    boxShadow:
      "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      boxShadow:
        "0 12px 40px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(37, 99, 235, 0.25)",
    },
  }}
>
  {/* Panel content */}
</Box>
```

---

## Effects

### Border Radius

```css
--radius-sm: 8px /* Inputs, buttons, settings */ --radius-md: 12px
  /* Setting containers */ --radius-lg: 16px /* Cards */ --radius-xl: 20px
  /* Panels */;
```

### Shadows

```css
/* Static shadows - no changes on hover for professional feel */
/* Use subtle shadows for depth, not dramatic changes */

/* Small - Subtle elevation for inputs */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);

/* Medium - Default for panels and cards */
--shadow-md: 0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);

/* Large - Elevated panels */
--shadow-lg: 0 12px 40px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);

/* Note: Keep shadows consistent - avoid animating shadow changes */
```

### Transitions

```css
/* Professional transitions - color and opacity only, no movement */
/* Keep transitions subtle and fast for productivity */

/* Standard transition - for colors and borders */
transition:
  background-color 0.15s ease,
  border-color 0.15s ease,
  opacity 0.15s ease;

/* AVOID transitioning: transform, width, height, position */
/* These cause movement which disrupts professional workflows */
```

### Hover Effects

```css
/* NO transforms or movements - keep it professional and static */
/* Use color changes and opacity for feedback only */

/* Good - Color change only */
"&:hover": {
  backgroundColor: "rgba(37, 99, 235, 0.08)",
  borderColor: "rgba(37, 99, 235, 0.4)",
}

/* Avoid - Movement animations */
/* transform: translateY(-1px); ❌ */
/* animation: bounce 0.3s; ❌ */
```

### Glassmorphism

```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(24px) saturate(140%);
-webkit-backdrop-filter: blur(24px) saturate(140%);
```

---

## Scrollbar Styling

```css
&::-webkit-scrollbar {
  width: 8px;
}
&::-webkit-scrollbar-track {
  background: rgba(37, 99, 235, 0.05);
  border-radius: 4px;
  margin: 4px 0;
}
&::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: background 0.2s ease;
}
&::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.35);
  background-clip: padding-box;
}
```

---

## Accessibility

### Focus States

All interactive elements should have visible focus states:

```css
&:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Color Contrast

- Text on white backgrounds: Use `slate-700` or darker
- Text on colored backgrounds: Ensure 4.5:1 contrast ratio minimum
- Interactive elements: Clearly distinguishable hover and active states

---

## Visual Affordances & UX Patterns

### Interactive vs Non-Interactive Elements

**Interactive Elements (Clickable/Editable):**

- ✅ **Background**: Light or white (`rgba(255, 255, 255, 0.8)`)
- ✅ **Border**: Visible border (1px, subtle gray)
- ✅ **Cursor**: `cursor: pointer` or `cursor: text`
- ✅ **Hover State**: Background lightens/tints blue, border becomes blue
- ✅ **Transition**: Smooth 0.2s transition on all states
- ✅ **Examples**: Buttons, inputs, dropdowns, switches

**Non-Interactive Elements (Display Only):**

- ✅ **Background**: Transparent or very subtle (`rgba(248, 250, 252, 0.3)`)
- ✅ **Border**: No border or very subtle
- ✅ **Cursor**: Default cursor
- ✅ **No Hover State**: Remains static
- ✅ **Examples**: Labels, descriptions, read-only text

---

### Input States

#### Default State (Ready for Input)

```jsx
// User knows it's interactive by:
// - White/light background
// - Clear border
// - Changes on hover
<TextField
  sx={{
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.8)", // Light = editable
      borderRadius: "8px",
      "& fieldset": {
        borderColor: "rgba(226, 232, 240, 0.8)", // Subtle gray = not focused
      },
    },
  }}
/>
```

#### Hover State (Discoverable)

```jsx
// User knows it's interactive by:
// - Border color changes to blue
// - Slight background change
"&:hover fieldset": {
  borderColor: "rgba(37, 99, 235, 0.4)", // Blue tint = hoverable
}
```

#### Focus State (Active)

```jsx
// User knows they're interacting by:
// - Strong blue border (2px)
// - Clear visual feedback
"&.Mui-focused fieldset": {
  borderColor: "#2563eb",      // Strong blue = active
  borderWidth: "2px",          // Thicker = focused
}
```

#### Disabled State (Not Available)

```jsx
// User knows it's not available by:
// - Grayed out appearance
// - No hover effects
// - Cursor shows "not-allowed"
sx={{
  opacity: 0.5,
  cursor: "not-allowed",
  backgroundColor: "rgba(248, 250, 252, 0.4)", // Grayed = disabled
  pointerEvents: "none",
}}
```

---

### Button States

#### Primary Button States

**Default (Call-to-Action):**

```jsx
// User knows it's the main action by:
// - Solid blue background
// - White text (high contrast)
// - Shadow for elevation
backgroundColor: "#2563eb",
color: "#ffffff",
boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
```

**Hover (Ready to Click):**

```jsx
// User knows they can click by:
// - Darker blue
// - Lifts up slightly
// - Shadow increases
"&:hover": {
  backgroundColor: "#1d4ed8",              // Darker = hoverable
  transform: "translateY(-1px)",            // Lift = interactive
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)", // More shadow = elevated
}
```

**Active (Clicking):**

```jsx
// User knows they clicked by:
// - Button presses down
// - Momentary darker state
"&:active": {
  transform: "translateY(0px)",  // Press down
  boxShadow: "0 1px 4px rgba(37, 99, 235, 0.2)", // Less shadow
}
```

#### Secondary Button States

**Default (Alternative Action):**

```jsx
// User knows it's secondary by:
// - Outlined only (no fill)
// - Blue text instead of white
// - Less prominent
backgroundColor: "transparent",
border: "1px solid rgba(37, 99, 235, 0.3)",
color: "#2563eb",
```

**Hover (Interactive Feedback):**

```jsx
// User knows they can click by:
// - Light blue background appears
// - Border becomes solid blue
"&:hover": {
  backgroundColor: "rgba(37, 99, 235, 0.08)", // Subtle fill
  borderColor: "#2563eb",                     // Solid border
}
```

---

### Dropdown/Select States

#### Closed (Shows Current Selection)

```jsx
// User knows current value by:
// - Clear text display
// - Dropdown arrow visible
// - Light background indicates it's editable
backgroundColor: "rgba(255, 255, 255, 0.8)",
borderColor: "rgba(226, 232, 240, 0.8)",
```

#### Hover (Indicates Interactivity)

```jsx
// User knows they can click by:
// - Border turns blue
// - Cursor changes to pointer
"&:hover": {
  borderColor: "rgba(37, 99, 235, 0.4)",
  cursor: "pointer",
}
```

#### Open (Shows All Options)

```jsx
// User knows menu is open by:
// - Blue border (2px)
// - Menu appears below
// - Current item highlighted
"&.Mui-focused": {
  borderColor: "#2563eb",
  borderWidth: "2px",
}
```

#### Selected Item in Menu

```jsx
// User knows this is the current selection by:
// - Light blue background
// - Checkmark or different styling
"&.Mui-selected": {
  backgroundColor: "rgba(37, 99, 235, 0.08)", // Light blue = selected
}
```

---

### Container States

#### Setting Container (Editable Group)

```jsx
// User knows it's an editable section by:
// - Light background separates it from panel
// - Border defines the boundary
// - Hover effect shows interactivity
sx={{
  backgroundColor: "rgba(248, 250, 252, 0.6)", // Light bg = content area
  border: "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: "12px",
  "&:hover": {
    backgroundColor: "rgba(248, 250, 252, 0.9)", // Subtle highlight
    borderColor: "rgba(37, 99, 235, 0.2)",       // Blue tint
  },
}}
```

#### Panel (Static Container)

```jsx
// User knows it's a container by:
// - Stronger background and blur
// - More prominent shadow
// - Rounded corners separate from content
sx={{
  backgroundColor: "rgba(255, 255, 255, 0.85)", // Opaque = container
  backdropFilter: "blur(24px)",                 // Blur = elevated
  boxShadow: "0 8px 32px rgba(37, 99, 235, 0.12)", // Shadow = depth
  borderRadius: "20px",                         // Large radius = container
}}
```

---

### Color Meaning

#### Blue (`#2563eb`)

- **Primary actions** (Save, Publish, Submit)
- **Interactive elements** (Links, hover states)
- **Focus states** (Active inputs, selected items)
- **Brand color** (Logo, highlights)

#### Gray/Slate

- **Non-interactive text** (Labels, descriptions)
- **Borders** (Default state)
- **Disabled states** (Unavailable features)
- **Backgrounds** (Containers, cards)

#### White/Light

- **Interactive surfaces** (Inputs, buttons)
- **Editable areas** (Text fields, dropdowns)
- **Content backgrounds** (Cards, modals)

#### Transparent/Subtle

- **Non-interactive displays** (Read-only text)
- **Disabled elements** (Grayed out)
- **Background layers** (Behind modals)

---

### Visual Hierarchy

#### High Priority (Must See)

```jsx
// Primary buttons, critical actions
backgroundColor: "#2563eb",
color: "#ffffff",
fontWeight: 600,
boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
```

#### Medium Priority (Should See)

```jsx
// Secondary buttons, important text
color: "#2563eb",
fontWeight: 500,
border: "1px solid rgba(37, 99, 235, 0.3)",
```

#### Low Priority (Can See)

```jsx
// Tertiary actions, helper text
color: "rgba(100, 116, 139, 0.85)",
fontWeight: 400,
fontSize: "0.75rem",
```

---

### Consistent Patterns

1. **Clickable = Light Background + Border + Color Change on Hover**
2. **Active = Blue Border (2px) + Blue Accent**
3. **Disabled = Reduced Opacity + No Pointer**
4. **Selected = Blue Background Tint**
5. **Hover = Color/Opacity Change Only (No Movement)**
6. **Focus = Strong Blue Border**
7. **Container = More Opacity + Larger Radius**
8. **Content = Less Opacity + Smaller Radius**

---

## Usage Guidelines

1. **Consistency**: Always use these defined styles rather than creating one-off custom styles
2. **Spacing**: Stick to the 8px grid system for all spacing
3. **Colors**: Use the defined color palette - avoid arbitrary colors
4. **Typography**: Use the defined font sizes and weights
5. **Effects**: Apply hover states and transitions to all interactive elements
6. **Accessibility**: Ensure all components are keyboard accessible and have proper focus states
7. **Affordances**: Make interactive elements visually distinct from static ones
8. **Feedback**: Always provide visual feedback for user interactions
9. **No Movement**: Avoid transforms, animations, or position changes - keep the interface static and professional
10. **Productivity First**: Transitions should be fast (0.15s) and only affect colors/opacity, not layout

---

## Animation Guidelines

### ✅ Allowed (Professional)

- Color transitions (background, border, text)
- Opacity changes
- Underline animations (like project cards)
- Simple fade in/out

### ❌ Avoid (Too Playful)

- Transform animations (translateY, scale, rotate)
- Position changes
- Bouncing or elastic effects
- Sliding or flying elements
- Shadow changes on hover
- Any movement that shifts content

### Exception: Project Cards

The underline animation on project cards is acceptable because:

- It's subtle and doesn't move the card
- It provides clear hover feedback
- It's a 1px line, not the entire component
- It animates horizontally, not affecting vertical layout

---

## Component Checklist

When creating or styling a component, ensure:

- ✅ Uses design system colors
- ✅ Uses design system typography
- ✅ Has appropriate hover/focus states
- ✅ Uses consistent border radius
- ✅ Has smooth transitions
- ✅ Follows 8px spacing grid
- ✅ Matches existing component patterns
- ✅ Is keyboard accessible
- ✅ Has proper contrast ratios

---

**Version:** 1.0.0
**Last Updated:** 2024
**Maintained by:** EnvisioXR Team
