import {
  ForwardRefExoticComponent,
  RefAttributes,
  TextInputProps,
} from 'react-native';

export interface GooglePlacesTextInputProps extends TextInputProps {
  /**
   * Google API key for accessing Google Places API
   */
  apiKey: string;

  /**
   * Callback that is called when a place is selected
   * Includes the selected place data and session token
   */
  onPlaceSelect: (place: GooglePlaceData | null, sessionToken?: string) => void;

  /**
   * Callback that is called when text input changes
   */
  onTextChange?: (text: string) => void;

  /**
   * Placeholder text for the input
   */
  placeHolderText?: string;

  /**
   * Custom proxy URL for Google Places API requests
   * @default 'https://places.googleapis.com/v1/places:autocomplete'
   */
  proxyUrl?: string;

  /**
   * Language code (e.g., 'en', 'fr') for the Google Places API responses
   */
  languageCode?: string;

  /**
   * Country codes to restrict results to specific countries
   */
  includedRegionCodes?: string[];

  /**
   * Types of predictions to return
   */
  types?: string[];

  /**
   * Function to modify the search text before sending to API
   */
  biasPrefixText?: (text: string) => string;

  /**
   * Minimum length of text to trigger predictions
   * @default 1
   */
  minCharsToFetch?: number;

  /**
   * Custom debounce delay in ms for API requests
   * @default 200
   */
  debounceDelay?: number;

  /**
   * Whether to show loading indicator during API requests
   * @default true
   */
  showLoadingIndicator?: boolean;

  /**
   * Whether to enable the clear button in the text input
   * @default true
   */
  showClearButton?: boolean;

  /**
   * Force RTL mode regardless of text content
   */
  forceRTL?: boolean;

  /**
   * Whether to hide suggestions when keyboard is dismissed
   * @default false
   */
  hideOnKeyboardDismiss?: boolean;

  /**
   * Custom styles for the component
   */
  style?: {
    container?: object;
    input?: object;
    suggestionsContainer?: object;
    suggestionItem?: object;
    suggestionText?: {
      main?: object;
      secondary?: object;
    };
    suggestionsList?: object;
    placeholder?: {
      color?: string;
    };
    loadingIndicator?: {
      color?: string;
    };
  };
}

export interface GooglePrediction {
  placePrediction: {
    /**
     * Place ID from Google Places API
     */
    placeId: string;

    /**
     * Structured formatting for the place
     */
    structuredFormat: {
      mainText: {
        text: string;
      };
      secondaryText?: {
        text: string;
      };
    };
  };
}

export interface GooglePlaceData {
  /**
   * Place ID from Google Places API
   */
  placeId: string;

  /**
   * Structured format of the place
   */
  structuredFormat?: {
    mainText: {
      text: string;
    };
    secondaryText?: {
      text: string;
    };
  };

  /**
   * Additional place details when available
   */
  [key: string]: any;
}

/**
 * A React Native component that provides Google Places autocomplete functionality in a text input.
 */
declare const GooglePlacesTextInput: ForwardRefExoticComponent<
  GooglePlacesTextInputProps & RefAttributes<GooglePlacesTextInputRef>
>;

/**
 * Ref interface for GooglePlacesTextInput component
 */
export interface GooglePlacesTextInputRef {
  /**
   * Clears the input text and suggestions
   * Also resets the session token
   */
  clear: () => void;

  /**
   * Focuses the input field
   */
  focus: () => void;

  /**
   * Returns the current session token
   * Can be used to match autocomplete requests with place details requests
   */
  getSessionToken: () => string | null;
}

export default GooglePlacesTextInput;
