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
   */
  onPlaceSelected?: (place: GooglePlaceData) => void;

  /**
   * Callback that is called with the fetched prediction data
   */
  onPredictionsFetched?: (predictions: GooglePrediction[]) => void;

  /**
   * Placeholder text for the input
   */
  placeholder?: string;

  /**
   * Custom styles for the text input
   */
  textInputStyle?: object;

  /**
   * Custom styles for the suggestions container
   */
  suggestionsContainerStyle?: object;

  /**
   * Custom styles for each suggestion item
   */
  suggestionItemStyle?: object;

  /**
   * Custom styles for each suggestion item text
   */
  suggestionItemTextStyle?: object;

  /**
   * Language code (e.g., 'en', 'fr') for the Google Places API responses
   */
  language?: string;

  /**
   * Country code (e.g., 'us', 'ca') to restrict results to specific countries
   */
  components?: string;

  /**
   * Types of predictions to return
   */
  types?: string;

  /**
   * Minimum length of text to trigger predictions
   */
  minLength?: number;

  /**
   * Timeout (in ms) after which the request will be canceled if not completed
   */
  fetchTimeout?: number;

  /**
   * Whether to enable the clear button in the text input
   */
  enableClearButton?: boolean;

  /**
   * Whether to enable powered by Google logo
   */
  enablePoweredByGoogle?: boolean;

  /**
   * Custom debounce delay in ms for API requests
   */
  debounce?: number;

  /**
   * Whether to disable suggestions dropdown
   */
  disableSuggestions?: boolean;

  /**
   * Whether to hide suggestions when keyboard is dismissed
   * @default false
   */
  hideOnKeyboardDismiss?: boolean;
}

export interface GooglePrediction {
  /**
   * Place ID from Google Places API
   */
  place_id: string;

  /**
   * Description of the place
   */
  description: string;

  /**
   * Structured formatting for the place
   */
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };

  /**
   * Additional place details
   */
  [key: string]: any;
}

export interface GooglePlaceData {
  /**
   * Place ID from Google Places API
   */
  place_id: string;

  /**
   * Full text description of the place
   */
  description?: string;

  /**
   * Place details when available
   */
  details?: {
    /**
     * Formatted address of the place
     */
    formatted_address?: string;

    /**
     * Geometry information including location coordinates
     */
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };

    /**
     * Place name
     */
    name?: string;

    /**
     * Additional place details components
     */
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;

    /**
     * Any other details returned by Google Places API
     */
    [key: string]: any;
  };
}

/**
 * A React Native component that provides Google Places autocomplete functionality in a text input.
 */
declare const GooglePlacesTextInput: ForwardRefExoticComponent<
  GooglePlacesTextInputProps & RefAttributes<any>
>;

export default GooglePlacesTextInput;
