# React Native Google Places Autocomplete TextInput

A customizable React Native TextInput component for Google Places Autocomplete using the Places API (New)

## Features

- Fully customizable UI
- Debounced search
- Clear button (x)
- Loading indicator
- Keyboard-aware
- Custom place types filtering
- RTL support
- Multi-language support
- Session token support for reduced billing costs
- Extended place details fetching (Optional)
- Compatible with both Expo and non-Expo projects
- Works with Expo Web

## Preview

<table>
  <tr>
    <td><img width="260" src="assets/places-search-demo.gif" alt="Places Search Demo"></td>
  </tr>
</table>

## Installation

```bash
npm install react-native-google-places-textinput
# or
yarn add react-native-google-places-textinput
```

> **Note:** This package is written in TypeScript and works seamlessly with both Expo and non-Expo React Native projects with no additional configuration required.

## Prerequisites

1. **Enable the Places API (New)** in your Google Cloud Project
   - This component specifically requires the new `Places API (New)`, not the legacy `Places API`
   - In the [Google Cloud Console](https://console.cloud.google.com/), go to `APIs & Services` > `Library` and search for "*Places API (New)*"

2. **Create an API key**
   - Go to "APIs & Services" > "Credentials" and create a new API key
   - Under "API restrictions", make sure "Places API (New)" is selected

## Usage

### Basic Example
```javascript
import GooglePlacesTextInput from 'react-native-google-places-textinput';

const YourComponent = () => {
  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);
  };

  return (
    <GooglePlacesTextInput
      apiKey="YOUR_GOOGLE_PLACES_API_KEY"
      onPlaceSelect={handlePlaceSelect}
    />
  );
};
```

<details>
<summary>Example with language and region codes filtering</summary>

```javascript
const ConfiguredExample = () => {
  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);
  };

  return (
    <GooglePlacesTextInput
      apiKey="YOUR_GOOGLE_PLACES_API_KEY"
      onPlaceSelect={handlePlaceSelect}
      languageCode="fr"
      types={['restaurant', 'cafe']}
      includedRegionCodes={['fr', 'be']}
      minCharsToFetch={2}
    />
  );
};
```
</details>

<details>
<summary>Example with full styling</summary>

```javascript
const StyledExample = () => {
  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);
  };

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
      style={customStyles}
    />
  );
};
```
</details>

<details>
<summary>Example with place details fetching</summary>

```javascript
const PlaceDetailsExample = () => {
  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);
    
    // Access detailed place information 
    if (place.details) {
      console.log(place.details);
    }
  };

  const handleError = (error) => {
    console.error('API error:', error);
  };

  return (
    <GooglePlacesTextInput
      apiKey="YOUR_GOOGLE_PLACES_API_KEY"
      onPlaceSelect={handlePlaceSelect}
      onError={handleError}
      fetchDetails={true}
      detailsFields={[
        'addressComponents',
        'formattedAddress',
        'location',
        'viewport',
        'photos',
        'types'
      ]}
    />
  );
};
```
</details>

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| **Basic Configuration** |
| apiKey | string | Yes | - | Your Google Places API key |
| value | string | No | - | Controlled input value |
| placeHolderText | string | No | - | Placeholder text for the input |
| onPlaceSelect | (place: Place, sessionToken?: string) => void | Yes | - | Callback when a place is selected |
| onTextChange | (text: string) => void | No | - | Callback when input text changes |
| **Search Configuration** |
| proxyUrl | string | No | - | Custom proxy URL for API requests (Required for Expo web) |
| languageCode | string | No | - | Language code (e.g., 'en', 'fr') |
| includedRegionCodes | string[] | No | - | Array of region codes to filter results |
| types | string[] | No | [] | Array of place types to filter |
| biasPrefixText | (text: string) => string | No | - | Optional function to modify the input text before sending to the Places API |
| minCharsToFetch | number | No | 1 | Minimum characters before triggering search |
| debounceDelay | number | No | 200 | Delay in milliseconds before triggering search |
| **Place Details Configuration** |
| fetchDetails | boolean | No | false | Automatically fetch place details when a place is selected |
| detailsProxyUrl | string | No | null | Custom proxy URL for place details requests (Required on Expo web)|
| detailsFields | string[] | No | ['displayName', 'formattedAddress', 'location', 'id'] | Array of fields to include in the place details response. see [Valid Fields](https://developers.google.com/maps/documentation/places/web-service/place-details#fieldmask) |
| **UI Customization** |
| showLoadingIndicator | boolean | No | true | Show loading spinner during API requests |
| showClearButton | boolean | No | true | Show clear (×) button when input has text |
| forceRTL | boolean | No | - | Force RTL layout (auto-detected if not provided) |
| style | GooglePlacesTextInputStyles | No | {} | Custom styling object |
| hideOnKeyboardDismiss | boolean | No | false | Hide suggestions when keyboard is dismissed |
| **Error Handling & Debugging** |
| onError | (error: any) => void | No | - | Callback when API errors occur |
| enableDebug | boolean | No | false | Enable detailed console logging for troubleshooting |

## Place Details Fetching

You can automatically fetch detailed place information when a user selects a place suggestion by enabling the `fetchDetails` prop:

```javascript
<GooglePlacesTextInput
  apiKey="YOUR_GOOGLE_PLACES_API_KEY"
  fetchDetails={true}
  detailsFields={['formattedAddress', 'location', 'viewport', 'photos']}
  onPlaceSelect={(place) => console.log(place.details)}
/>
```

When `fetchDetails` is enabled:
1. The component fetches place details immediately when a user selects a place suggestion
2. The details are attached to the place object passed to your `onPlaceSelect` callback in the `details` property
3. Use the `detailsFields` prop to specify which fields to include in the response, reducing API costs

For a complete list of available fields, see the [Place Details API documentation](https://developers.google.com/maps/documentation/places/web-service/place-details#fieldmask).

### Place Details on Expo Web

**Important:** To use Google Places Details on Expo Web, you must provide a `detailsProxyUrl` prop that points to a CORS-enabled proxy for the Google Places Details API. This is required due to browser security restrictions.

```javascript
<GooglePlacesTextInput
  apiKey="YOUR_GOOGLE_PLACES_API_KEY"
  fetchDetails={true}
  detailsProxyUrl="https://your-backend-proxy.com/places-details"
  onPlaceSelect={(place) => console.log(place.details)}
/>
```

Without a proxy, the component will still work on Expo Web for place search, but place details fetching will fail with CORS errors.

For a complete guide on setting up a proxy server for Expo Web, see [Expo Web Details Proxy Guide](./docs/expo-web-details-proxy.md).

## Session Tokens and Billing

This component automatically manages session tokens to optimize your Google Places API billing:

- A session token is generated when the component mounts
- The same token is automatically used for all autocomplete requests and place details requests
- The component automatically resets tokens after place selection, input clearing, or calling `clear()`

**Note:** This automatic session token management ensures Google treats your autocomplete and details requests as part of the same session, reducing your billing costs with no additional configuration needed.

## Methods

The component exposes the following methods through refs:

- `clear()`: Clears the input and suggestions
- `focus()`: Focuses the input field
- `getSessionToken()`: Returns the current session token

```javascript
const inputRef = useRef(null);

// Usage
inputRef.current?.clear();
inputRef.current?.focus();
const token = inputRef.current?.getSessionToken();
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

For detailed styling examples and a complete guide, see our [Styling Guide](./docs/styling-guide.md).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Written by Amit Palomo

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)