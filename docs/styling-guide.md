# Styling Guide for GooglePlacesTextInput

This guide explains how to customize the appearance of the GooglePlacesTextInput component to match your app's design.

## Styling Structure

The component accepts a `style` prop with the following structure:

```typescript
type Styles = {
  container?: ViewStyle;
  input?: TextStyle;
  suggestionsContainer?: ViewStyle;
  suggestionsList?: ViewStyle;
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
  clearButtonText?: ViewStyle;
}
```

## Component Layout Structure

Understanding the component's structure helps with styling. Here's how the component is organized:

```javascript
<View style={[styles.container, style.container]}>
  <View>
    <TextInput style={[styles.input, style.input, ...]} />
    <TouchableOpacity> 
      {clearElement || (
        <View style={styles.clearTextWrapper}>
          <Text style={[styles.clearText, style.clearButtonText]}>×</Text>
        </View>
      )}
    </TouchableOpacity>
    <ActivityIndicator /> (Loading indicator)
  </View>
  <View style={[styles.suggestionsContainer, style.suggestionsContainer]}>
    <FlatList
      style={style.suggestionsList}
      renderItem={({item}) => (
        <TouchableOpacity style={[styles.suggestionItem, style.suggestionItem]}>
          <Text style={[styles.mainText, style.suggestionText?.main]}>
            {mainText}
          </Text>
          <Text style={[styles.secondaryText, style.suggestionText?.secondary]}>
            {secondaryText}
          </Text>
        </TouchableOpacity>
      )}
    />
  </View>
</View>
```

## Styling Examples

### Basic Input Styling

```javascript
const styles = {
  container: {
    width: '100%',
    marginHorizontal: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  placeholder: {
    color: '#888888',
  },
  clearButtonText: {
    color: '#FF0000', // Red X
    fontSize: 20,
  }
};
```

### Material Design Style

```javascript
const materialStyles = {
  container: {
    width: '100%',
    marginHorizontal: 16,
  },
  input: {
    height: 56,
    borderWidth: 0,
    borderRadius: 4,
    fontSize: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    main: {
      fontSize: 16,
      color: '#212121',
    },
    secondary: {
      fontSize: 14,
      color: '#757575',
    }
  },
  loadingIndicator: {
    color: '#6200EE',
  },
  placeholder: {
    color: '#9E9E9E',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
  }
};
```

### iOS Style

```javascript
const iosStyles = {
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  input: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E9E9EB',
    paddingHorizontal: 15,
    fontSize: 17,
    fontWeight: '400',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C8C7CC',
  },
  suggestionText: {
    main: {
      fontSize: 17,
      color: '#000000',
      fontWeight: '400',
    },
    secondary: {
      fontSize: 15,
      color: '#8E8E93',
    }
  },
  loadingIndicator: {
    color: '#007AFF',
  },
  placeholder: {
    color: '#8E8E93',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
  }
};
```

## ✨ NEW: Custom Close Element

You can now provide a custom close element instead of the default "×" text:

```javascript
import { Ionicons } from '@expo/vector-icons';

<GooglePlacesTextInput
  apiKey="YOUR_KEY"
  clearElement={
    <Icon name="close-circle" size={24} color="#999" />
  }
  // ...other props
/>
```

## ✨ NEW: Accessibility Labels

The component now supports comprehensive accessibility customization:

```javascript
<GooglePlacesTextInput
  apiKey="YOUR_KEY"
  accessibilityLabels={{
    input: 'Search for places',
    clearButton: 'Clear search text',
    loadingIndicator: 'Searching for places',
    suggestionItem: (prediction) => 
      `Select ${prediction.structuredFormat.mainText.text}, ${prediction.structuredFormat.secondaryText?.text || ''}`
  }}
  // ...other props
/>
```

## Styling the Suggestions List

The suggestions list is implemented as a FlatList with customizable height:

```javascript
const styles = {
  suggestionsContainer: {
    maxHeight: 250, // Set the maximum height
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderTopWidth: 0,
  },
  // Make individual items stand out with dividers
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  }
};
```

## Loading Indicator and Clear Button

You can customize the color of the loading indicator:

```javascript
const styles = {
  loadingIndicator: {
    color: '#FF5722', // orange color
  }
};
```

The clear button is automatically styled based on platform (iOS or Android) but you can hide it with the `showClearButton` prop:

```javascript
<GooglePlacesTextInput
  apiKey="YOUR_KEY"
  showClearButton={false}
  // ...other props
/>
```

## ✨ NEW: Programmatic Control

The component now exposes a `blur()` method in addition to the existing `clear()` and `focus()` methods:

```javascript
const inputRef = useRef();

// Blur the input
inputRef.current?.blur();

// Clear the input
inputRef.current?.clear();

// Focus the input
inputRef.current?.focus();

// Get current session token
const token = inputRef.current?.getSessionToken();
```

## RTL Support

The component automatically handles RTL layouts based on the text direction. You can also force RTL with the `forceRTL` prop:

```javascript
<GooglePlacesTextInput
  apiKey="YOUR_KEY"
  forceRTL={true}
  // ...other props
/>
```

## Combining with Other Style Systems

If you're using a styling library like styled-components or Tailwind, you can still use this component by generating the style object:

```javascript
// Example with StyleSheet.create
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
  },
  // ...other styles
});

// Pass the styles to the component
<GooglePlacesTextInput
  style={{
    container: styles.container,
    input: styles.input,
    // ...other styles
  }}
/>
```