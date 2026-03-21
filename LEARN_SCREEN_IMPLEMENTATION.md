# Learn Screen - Implementation Guide

## Overview

The Learn screen has been fully implemented with reusable components, complete light/dark mode support, and pixel-perfect design system compliance following the AirSaathi Aura Mint design tokens.

## Components Built

### 1. **TopicCard** (`components/TopicCard.tsx`)

A flexible learning topic card component with the following features:

#### Props

- `title` (string): Main heading of the topic
- `description` (string): Secondary description/subtitle
- `icon` (Ionicons name, optional): Icon to display in colored background
- `image` (ImageSourcePropType, optional): Image to display instead of icon
- `category` (string, optional): Topic category label (uppercase)
- `onPress` (function, optional): Callback when card is pressed

#### Features

- ✅ Icon or image support (left-aligned container)
- ✅ Responsive layout with proper spacing (16-20px padding)
- ✅ Scale animation on press (0.95 feedback)
- ✅ Light mode: White background + subtle styling
- ✅ Dark mode: Glass-style with border and transparency
- ✅ Rounded corners: 24px (matches design system)
- ✅ Chevron indicator for actionable state
- ✅ Category label with proper typography hierarchy

#### Visual Specs

- **Border Radius**: 24px
- **Padding**: 16px (horizontal), 16px (vertical) between cards
- **Icon Container**: 56x56px with 12px border radius
- **Image Container**: 72x72px with 12px border radius
- **Light Mode Shadow**: Via design system
- **Dark Mode**: `rgba(15, 23, 42, 0.5)` background + `rgba(30, 41, 59, 0.5)` border

---

### 2. **QuizWidget** (`components/QuizWidget.tsx`)

A comprehensive multiple-choice quiz component with interactive feedback.

#### Props

- `question` (string): Quiz question text
- `options` (QuizOption[]): Array of answer options
- `correctAnswerId` (string): ID of the correct answer
- `onSelect` (function, optional): Callback with selected option ID
- `showFeedback` (boolean, optional): Display instant feedback (default: true)

#### Features

- ✅ Radio-button style selection
- ✅ Instant feedback with visual indicators
- ✅ Color-coded feedback (green for correct, red for incorrect)
- ✅ Shows correct answer even if user selected wrong
- ✅ Disabled state after selection (prevents re-selection)
- ✅ Icon indicators (checkmark for correct, info for incorrect)
- ✅ Smooth transitions and animations
- ✅ Light/dark mode adaptation

#### Visual Specs

- **Border Radius**: 12px (options and feedback container)
- **Option Padding**: 12px vertical, 14px horizontal
- **Radio Circle Size**: 20x20px
- **Green (Correct)**: Mint primary color with 15% opacity background
- **Red (Incorrect)**: Feedback complaint colors

---

## Data Structure

### Learning Topics Format

```typescript
type LearningTopic = {
  id: string;
  title: string;
  description: string;
  icon: "leaf" | "alert-circle" | "help-circle" | "bulb" | "shield-checkmark";
  category: string;
};
```

### Quiz Format

```typescript
type QuizItem = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  topic: string;
};
```

---

## Learn Screen Features

### Layout Structure

1. **Header Section**
   - Title: "Learn" (32px, headline font)
   - Subtitle: "Expand your knowledge about air quality"
   - Proper spacing maintained from top navbar

2. **Topics Section**
   - Multiple TopicCard components in vertical scroll
   - 6 sample topics pre-configured
   - Expandable for additional content

3. **Quizzes Section**
   - Collapsible quiz headers
   - Toggle expansion to reveal full QuizWidget
   - 4 sample quizzes covering different topics
   - Quiz topics linked to learning topics

### Interactions

- **Card Press**: Scale animation (0.97-1.0 scale)
- **Quiz Toggle**: Smooth expand/collapse animation
- **Quiz Selection**: Instant visual feedback with colors
- **All animations**: smooth 150ms timing with easing

### Scrolling

- Vertical ScrollView with proper content padding
- No content stuck to screen edges
- Consistent 16-20px horizontal padding throughout
- 24px bottom padding for safe area

### Theme Support

- Full light/dark mode with smooth transitions
- Light mode: White backgrounds, dark text
- Dark mode: Glass-morphism with borders and transparency
- Proper color mapping from design_system.json

---

## Styling Reference

### Colors Used

- **Primary (Light)**: `#064E3B` (text)
- **Primary (Dark)**: `#98D8C8` (mint)
- **Secondary (Light)**: `#475569` (gray)
- **Secondary (Dark)**: `#94A3B8` (gray)
- **Icon Background (Light)**: `#D1FAE5` (action feedback)
- **Icon Background (Dark)**: `rgba(6, 78, 59, 0.3)` (action feedback)
- **Correct (Green)**: Mint primary with variations
- **Incorrect (Red)**: Feedback complaint colors

### Typography

- **Headlines**: Manrope, 700 weight
- **Body**: Inter, 400 weight
- **Labels**: Inter, 600 weight, uppercase with letter spacing

### Spacing System

- **Card Padding**: 16-24px
- **Section Gap**: 12-16px
- **Top/Bottom Spacing**: 28px between sections

---

## Integration with Stitch Designs

### How to Replace Sample Data

The component structure is designed to accept data exports from Stitch. To integrate:

1. **Export topics from Stitch** with fields:
   - title, description, icon (Ionicons name), category

2. **Export quizzes from Stitch** with fields:
   - question, options (array), correctAnswerId, topic

3. **Replace constants** in `learn.tsx`:

   ```typescript
   // Replace LEARNING_TOPICS and QUIZ_ITEMS arrays
   const LEARNING_TOPICS = [...] // Your Stitch export
   const QUIZ_ITEMS = [...]       // Your Stitch export
   ```

4. **Update icon types** if using different Ionicons:
   - Modify the `icon` type in LearningTopic if needed

---

## Design System Compliance Checklist

✅ Typography: Manrope (headline) + Inter (body) from design_system.json
✅ Colors: All colors mapped to design system tokens
✅ Spacing: 16-20px padding, 12-16px gaps as specified
✅ Border Radius: 24px cards, 12px interactive elements
✅ Light Mode: White bg + subtle styling
✅ Dark Mode: Glass-morphism style (50% opacity + border)
✅ Animations: 150ms timing, cubic easing
✅ Interactions: 0.95 scale feedback
✅ Icons: Ionicons library with proper color mapping
✅ Responsive: Flex-based layout working on all screen sizes

---

## Optional Enhancements

1. **Add quiz progress tracking**: Store quiz completion state
2. **Implement topic filtering**: Filter by category
3. **Add search functionality**: Search topics by title
4. **Quiz score persistence**: Save quiz results over time
5. **Deep linking**: Navigate to specific topics via URL
6. **Content images**: Replace icon-only cards with Stitch image exports
7. **Animations**: Additional reveal animations on scroll
8. **Sound effects**: Optional haptic feedback on quiz selection (via expo-haptics)

---

## File Structure

```
components/
├── TopicCard.tsx          ← New component
├── QuizWidget.tsx         ← New component
└── ... (existing)

app/(tabs)/
└── learn.tsx              ← Updated with full implementation

context/
└── design_system.json     ← Used for styling reference
```

---

## Testing Recommendations

1. Test on both iOS and Android simulators
2. Verify light/dark mode toggle works smoothly
3. Check quiz feedback displays correctly
4. Test scrolling performance with all content
5. Verify responsive layout on different screen sizes (small, medium, large)
6. Test animations are smooth and not janky
7. Verify accessibility (proper contrast, touch targets 44x44px minimum)

---

**Build Status**: ✅ Ready for integration with Stitch design exports
