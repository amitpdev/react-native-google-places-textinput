# React Native Google Places TextInput

A customizable React Native TextInput component for Google Places Autocomplete using the Places API (New)

## Features

- 🎨 Fully customizable UI
- 🌍 RTL support
- ⌨️ Debounced search
- 🔄 Loading indicators
- 📱 Keyboard-aware
- 🎯 TypeScript support
- 🔍 Custom place types filtering
- 🌐 Multi-language support

## Screenshot
<img src="https://github.com/user-attachments/assets/1eb0c4da-4a2e-453e-a6b4-d63bf7fa4d20" width="320"/>

## Installation

```bash
npm install react-native-google-places-textinput
# or
yarn add react-native-google-places-textinput
```

## Prerequisites

- Get a Google Places API key from the [Google Cloud Console](https://console.cloud.google.com/)
- Enable Places API (New) in your Google Cloud Project

## Usage

```javascript
import GooglePlacesTextInput from 'react-native-google-places-textinput';

const YourComponent = () => {
  const handlePlaceSelect = (place) => {
    if (place) {
      console.log('Selected place:', place);
    }
  };

  // Example with custom styles
  const customStyles = {
    container: {
      width: '100%',
      marginHorizontal: 0,
    },
    input: {
      height: 45,
      borderColor: '#ccc',
      borderRadius: 8,
    },
    suggestionsContainer: {
      backgroundColor: '#ffffff',
      maxHeight: 250,
    },
    suggestionItem: {
      padding: 15,
    },
    suggestionText: {
      main: {
        fontSize: 16,
        color: '#333',
      },
      secondary: {
        fontSize: 14,
        color: '#666',
      }
    },
    loadingIndicator: {
      color: '#999',
    },
    placeholder: {
      color: '#999',
    }
  };

  return (
    <GooglePlacesTextInput
      apiKey="YOUR_GOOGLE_PLACES_API_KEY"
      placeHolderText="Search for a place"
      onPlaceSelect={handlePlaceSelect}
      languageCode="en"
      style={customStyles}
    />
  );
};
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| apiKey | string | Yes | - | Your Google Places API key |
| value | string | No | '' | Initial input value |
| placeHolderText | string | No | - | Placeholder text for input |
| proxyUrl | string | No | - | Custom proxy URL for Places API requests |
| languageCode | string | No | - | Language code (e.g., 'en', 'fr') |
| includedRegionCodes | string[] | No | - | Array of region codes to filter results |
| types | string[] | No | [] | Array of place types to filter |
| biasPrefixText | string | No | - | Text to prepend to search query |
| minCharsToFetch | number | No | 1 | Minimum characters before fetching |
| onPlaceSelect | (place: Place \| null) => void | Yes | - | Callback when place is selected |
| debounceDelay | number | No | 200 | Delay before triggering search |
| showLoadingIndicator | boolean | No | true | Show/hide loading indicator |
| style | StyleProp | No | {} | Custom styles object |

## Methods

The component exposes the following methods through refs:

- `clear()`: Clears the input and suggestions
- `focus()`: Focuses the input field

```javascript
const inputRef = useRef(null);

// Usage
inputRef.current?.clear();
inputRef.current?.focus();
```

## Styling

The component accepts a `style` prop with the following structure:

```typescript
type Styles = {
  container?: ViewStyle;
  input?: TextStyle;
  suggestionsContainer?: ViewStyle;
  suggestionItem?: ViewStyle;
  suggestionText?: {
    main?: TextStyle;
    secondary?: TextStyle;
  };
  loadingIndicator?: {
    color?: string;
  };
  placeholder?: {
    color?: string;
  };
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
