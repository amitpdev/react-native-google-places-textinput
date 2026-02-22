import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
  TextInputProps,
  TextInputFocusEventData,
  NativeSyntheticEvent,
} from 'react-native';
import {
  FlatList,
  I18nManager,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import the API functions
import {
  fetchPlaceDetails as fetchPlaceDetailsApi,
  fetchPredictions as fetchPredictionsApi,
  generateUUID,
  isRTLText,
} from './services/googlePlacesApi';

import ClearButtonAndSpinner from './ClearButtonAndSpinner';

// Type definitions
interface PlaceStructuredFormat {
  mainText: {
    text: string;
  };
  secondaryText?: {
    text: string;
  };
}

interface PlacePrediction {
  placeId: string;
  structuredFormat: PlaceStructuredFormat;
  types: string[];
}

interface PlaceDetailsFields {
  [key: string]: any;
}

interface Place {
  placeId: string;
  structuredFormat: PlaceStructuredFormat;
  types: string[];
  details?: PlaceDetailsFields; // ✅ Optional details when fetchDetails is true
}

interface GooglePlacesTextInputStyles {
  container?: StyleProp<ViewStyle>;
  input?: StyleProp<TextStyle>;
  inputContainer?: StyleProp<ViewStyle>;
  suggestionsContainer?: StyleProp<ViewStyle>;
  suggestionsList?: StyleProp<ViewStyle>;
  suggestionItem?: StyleProp<ViewStyle>;
  suggestionText?: {
    main?: StyleProp<TextStyle>;
    secondary?: StyleProp<TextStyle>;
  };
  loadingIndicator?: {
    color?: string;
  };
  placeholder?: {
    color?: string;
  };
  clearButtonText?: StyleProp<ViewStyle>;
}

interface GooglePlacesAccessibilityLabels {
  input?: string;
  clearButton?: string;
  loadingIndicator?: string;
  /**
   * A function that receives a place prediction and returns a descriptive string
   * for the suggestion item.
   * @example (prediction) => `Select ${prediction.structuredFormat.mainText.text}, ${prediction.structuredFormat.secondaryText?.text}`
   */
  suggestionItem?: (prediction: PlacePrediction) => string;
}

interface SuggestionTextProps {
  /**
   * Maximum number of lines for the main text (place name)
   * @default undefined (no limit)
   */
  mainTextNumberOfLines?: number;
  /**
   * Maximum number of lines for the secondary text (address)
   * @default undefined (no limit)
   */
  secondaryTextNumberOfLines?: number;
  /**
   * Determines how text is truncated when it exceeds the number of lines
   * @default 'tail'
   */
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

interface GooglePlacesTextInputProps
  extends Omit<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'ref'
    | 'style'
    | 'placeholder'
    | 'placeholderTextColor'
  > {
  apiKey: string;
  value?: string;
  placeHolderText?: string;
  proxyUrl?: string;
  proxyHeaders?: Record<string, string>;
  languageCode?: string;
  includedRegionCodes?: string[];
  locationBias?: Record<string, any>;
  locationRestriction?: Record<string, any>;
  types?: string[];
  biasPrefixText?: (text: string) => string;
  minCharsToFetch?: number;
  onPlaceSelect: (place: Place, sessionToken?: string | null) => void;
  onTextChange?: (text: string) => void;
  debounceDelay?: number;
  showLoadingIndicator?: boolean;
  showClearButton?: boolean;
  forceRTL?: boolean;
  style?: GooglePlacesTextInputStyles;
  clearElement?: ReactNode;
  hideOnKeyboardDismiss?: boolean;
  scrollEnabled?: boolean;
  nestedScrollEnabled?: boolean;
  fetchDetails?: boolean;
  detailsProxyUrl?: string | null;
  detailsProxyHeaders?: Record<string, string>;
  detailsFields?: string[];
  onError?: (error: any) => void;
  enableDebug?: boolean;
  accessibilityLabels?: GooglePlacesAccessibilityLabels;
  suggestionTextProps?: SuggestionTextProps;
}

interface GooglePlacesTextInputRef {
  clear: () => void;
  blur: () => void;
  focus: () => void;
  getSessionToken: () => string | null;
}

interface PredictionItem {
  placePrediction: PlacePrediction;
}

const GooglePlacesTextInput = forwardRef<
  GooglePlacesTextInputRef,
  GooglePlacesTextInputProps
>((props, ref) => {
  const {
    apiKey,
    value,
    placeHolderText,
    proxyUrl,
    proxyHeaders = null,
    languageCode,
    includedRegionCodes,
    locationBias,
    locationRestriction,
    types = [],
    biasPrefixText,
    minCharsToFetch = 1,
    onPlaceSelect,
    onTextChange,
    debounceDelay = 200,
    forceRTL = undefined,
    style = {},
    hideOnKeyboardDismiss = false,
    scrollEnabled = true,
    nestedScrollEnabled = true,
    fetchDetails = false,
    detailsProxyUrl = null,
    detailsProxyHeaders = null,
    detailsFields = [],
    onError,
    enableDebug = false,
    onFocus,
    onBlur,
    accessibilityLabels = {},
    suggestionTextProps = {},
    ...restTextInputProps
  } = props;

  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>(value || '');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const suggestionPressing = useRef<boolean>(false);
  const skipNextFocusFetch = useRef<boolean>(false);

  const generateSessionToken = (): string => {
    return generateUUID();
  };

  // Initialize session token on mount
  useEffect(() => {
    setSessionToken(generateSessionToken());

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    setInputText(value ?? '');
  }, [value]);

  // Add keyboard listener
  useEffect(() => {
    if (hideOnKeyboardDismiss) {
      const keyboardDidHideSubscription = Keyboard.addListener(
        'keyboardDidHide',
        () => setShowSuggestions(false)
      );

      return () => {
        keyboardDidHideSubscription.remove();
      };
    }
    return () => {};
  }, [hideOnKeyboardDismiss]);

  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      skipNextFocusFetch.current = true;
      setInputText('');
      setPredictions([]);
      setShowSuggestions(false);
      setSessionToken(generateSessionToken());
    },
    blur: () => {
      inputRef.current?.blur();
    },
    focus: () => {
      inputRef.current?.focus();
    },
    getSessionToken: () => sessionToken,
  }));

  // RTL detection logic
  const isDeviceRTL = I18nManager.isRTL;
  const isRTL =
    forceRTL !== undefined ? forceRTL : isRTLText(placeHolderText ?? '');

  // Add missing CORS warning effect
  useEffect(() => {
    if (Platform.OS === 'web' && fetchDetails && !detailsProxyUrl) {
      console.warn(
        'Google Places Details API does not support CORS. ' +
          'To fetch place details on web, provide a detailsProxyUrl prop that points to a CORS-enabled proxy.'
      );
    }
  }, [fetchDetails, detailsProxyUrl]);

  // Debug logger utility
  const debugLog = (category: string, message: string, data?: any) => {
    if (enableDebug) {
      const timestamp = new Date().toISOString();
      console.log(
        `[GooglePlacesTextInput:${category}] ${timestamp} - ${message}`
      );
      if (data) {
        console.log(`[GooglePlacesTextInput:${category}] Data:`, data);
      }
    }
  };

  const fetchPredictions = async (text: string): Promise<void> => {
    debugLog('PREDICTIONS', `Starting fetch for text: "${text}"`);
    debugLog('PREDICTIONS', 'Request params', {
      text,
      apiKey: apiKey ? '[PROVIDED]' : '[MISSING]', // ✅ Security fix
      proxyUrl,
      proxyHeaders,
      sessionToken,
      languageCode,
      includedRegionCodes,
      locationBias,
      locationRestriction,
      types,
      minCharsToFetch,
    });

    if (!text || text.length < minCharsToFetch) {
      debugLog(
        'PREDICTIONS',
        `Text too short (${text.length} < ${minCharsToFetch})`
      );
      setPredictions([]);
      return;
    }

    setLoading(true);

    const { error, predictions: fetchedPredictions } =
      await fetchPredictionsApi({
        text,
        apiKey,
        proxyUrl,
        proxyHeaders,
        sessionToken,
        languageCode,
        includedRegionCodes,
        locationBias,
        locationRestriction,
        types,
        biasPrefixText,
      });

    if (error) {
      debugLog('PREDICTIONS', 'API Error occurred', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      onError?.(error);
      setPredictions([]);
    } else {
      debugLog(
        'PREDICTIONS',
        `Success: ${fetchedPredictions.length} predictions received`
      );
      debugLog('PREDICTIONS', 'Predictions data', fetchedPredictions);
      setPredictions(fetchedPredictions);
      setShowSuggestions(fetchedPredictions.length > 0);
    }

    setLoading(false);
  };

  const fetchPlaceDetails = async (
    placeId: string
  ): Promise<PlaceDetailsFields | null> => {
    debugLog('DETAILS', `Starting details fetch for placeId: ${placeId}`);
    debugLog('DETAILS', 'Request params', {
      placeId,
      apiKey: apiKey ? '[PROVIDED]' : '[MISSING]', // ✅ Security fix
      detailsProxyUrl,
      detailsProxyHeaders,
      sessionToken,
      languageCode,
      detailsFields,
      fetchDetails,
      platform: Platform.OS,
    });

    if (!fetchDetails || !placeId) {
      debugLog('DETAILS', 'Skipping details fetch', {
        fetchDetails,
        placeId,
      });
      return null;
    }

    // Web CORS warning
    if (Platform.OS === 'web' && !detailsProxyUrl) {
      debugLog(
        'DETAILS',
        'WARNING: Web platform detected without detailsProxyUrl - CORS issues likely'
      );
    }

    setDetailsLoading(true);

    const { error, details } = await fetchPlaceDetailsApi({
      placeId,
      apiKey,
      detailsProxyUrl,
      detailsProxyHeaders,
      sessionToken,
      languageCode,
      detailsFields,
    });

    setDetailsLoading(false);

    if (error) {
      debugLog('DETAILS', 'API Error occurred', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      onError?.(error);
      return null;
    }

    debugLog('DETAILS', 'Success: Details received', details);
    return details;
  };

  const handleTextChange = (text: string): void => {
    setInputText(text);
    onTextChange?.(text);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchPredictions(text);
    }, debounceDelay);
  };

  const handleSuggestionPress = async (
    suggestion: PredictionItem
  ): Promise<void> => {
    const place = suggestion.placePrediction;
    debugLog(
      'SELECTION',
      `User selected place: ${place.structuredFormat.mainText.text}`
    );
    debugLog('SELECTION', 'Selected place data', place);

    setInputText(place.structuredFormat.mainText.text);
    setShowSuggestions(false);
    Keyboard.dismiss();

    if (fetchDetails) {
      debugLog('SELECTION', 'Fetching place details...');
      setLoading(true);
      const details = await fetchPlaceDetails(place.placeId);
      const enrichedPlace: Place = details ? { ...place, details } : place;

      debugLog('SELECTION', 'Final place object being sent to onPlaceSelect', {
        hasDetails: !!details,
        placeKeys: Object.keys(enrichedPlace),
        detailsKeys: details ? Object.keys(details) : null,
      });

      onPlaceSelect?.(enrichedPlace, sessionToken);
      setLoading(false);
    } else {
      debugLog(
        'SELECTION',
        'Sending place without details (fetchDetails=false)'
      );
      onPlaceSelect?.(place, sessionToken);
    }
    setSessionToken(generateSessionToken());
  };

  const handleFocus = (
    event: NativeSyntheticEvent<TextInputFocusEventData>
  ): void => {
    onFocus?.(event);

    if (skipNextFocusFetch.current) {
      skipNextFocusFetch.current = false;
      return;
    }
    if (inputText.length >= minCharsToFetch) {
      fetchPredictions(inputText);
      setShowSuggestions(true);
    }
  };

  const handleBlur = (
    event: NativeSyntheticEvent<TextInputFocusEventData>
  ): void => {
    onBlur?.(event);

    setTimeout(() => {
      if (suggestionPressing.current) {
        suggestionPressing.current = false;
      } else {
        setShowSuggestions(false);
      }
    }, 10);
  };

  const renderSuggestion = ({
    item,
    index,
  }: {
    item: PredictionItem;
    index: number;
  }) => {
    const { mainText, secondaryText } = item.placePrediction.structuredFormat;

    // Safely extract backgroundColor from style
    const suggestionsContainerStyle = StyleSheet.flatten(
      style.suggestionsContainer
    );
    const backgroundColor =
      suggestionsContainerStyle?.backgroundColor || '#efeff1';

    const defaultAccessibilityLabel = `${mainText.text}${
      secondaryText ? `, ${secondaryText.text}` : ''
    }`;
    const accessibilityLabel =
      accessibilityLabels.suggestionItem?.(item.placePrediction) ||
      defaultAccessibilityLabel;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to select this place"
        style={[
          index > 0 ? styles.separatorLine : {},
          styles.suggestionItem,
          { backgroundColor },
          style.suggestionItem,
        ]}
        onPressIn={() => {
          suggestionPressing.current = true;
        }}
        onPress={() => {
          suggestionPressing.current = false;
          handleSuggestionPress(item);
        }}
        // Fix for web: onBlur fires before onPress, hiding suggestions too early.
        {...(Platform.OS === 'web' &&
          ({
            onMouseDown: () => {
              suggestionPressing.current = true;
            },
          } as any))}
      >
        <Text
          style={[styles.mainText, style.suggestionText?.main, getTextAlign()]}
          numberOfLines={suggestionTextProps.mainTextNumberOfLines}
          ellipsizeMode={suggestionTextProps.ellipsizeMode || 'tail'}
        >
          {mainText.text}
        </Text>
        {secondaryText && (
          <Text
            style={[
              styles.secondaryText,
              style.suggestionText?.secondary,
              getTextAlign(),
            ]}
            numberOfLines={suggestionTextProps.secondaryTextNumberOfLines}
            ellipsizeMode={suggestionTextProps.ellipsizeMode || 'tail'}
          >
            {secondaryText.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const getTextAlign = () => {
    if (isDeviceRTL) {
      return { textAlign: isRTL ? 'left' : ('right' as 'left' | 'right') };
    } else {
      return { textAlign: isRTL ? 'right' : ('left' as 'left' | 'right') };
    }
  };

  const handleClearPress = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    skipNextFocusFetch.current = true;
    setInputText('');
    setPredictions([]);
    setShowSuggestions(false);
    onTextChange?.('');
    setSessionToken(generateSessionToken());
    inputRef.current?.focus();
  };

  // Debug initialization
  useEffect(() => {
    if (enableDebug) {
      debugLog('INIT', 'Component initialized with props', {
        apiKey: apiKey ? '[PROVIDED]' : '[MISSING]', // ✅ Security fix
        fetchDetails,
        detailsProxyUrl,
        detailsFields,
        platform: Platform.OS,
        minCharsToFetch,
        debounceDelay,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, style.container]}>
      <View style={[styles.inputContainer, style.inputContainer]}>
        {/* Render Button and Loader here if is forced RTL */}
        {isRTL !== isDeviceRTL && (
          <ClearButtonAndSpinner
            {...props}
            isLoading={loading || detailsLoading}
            onPress={handleClearPress}
            isInputEmpty={inputText.length === 0}
          />
        )}

        <TextInput
          {...restTextInputProps}
          ref={inputRef}
          style={[styles.input, style.input, getTextAlign()]}
          placeholder={placeHolderText}
          placeholderTextColor={style.placeholder?.color || '#666666'}
          value={inputText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          clearButtonMode="never" // Disable iOS native clear button
          accessibilityRole="search"
          accessibilityLabel={accessibilityLabels.input || placeHolderText}
        />

        {isRTL === isDeviceRTL && (
          <ClearButtonAndSpinner
            {...props}
            isLoading={loading || detailsLoading}
            onPress={handleClearPress}
            isInputEmpty={inputText.length === 0}
          />
        )}
      </View>

      {/* Suggestions */}
      {showSuggestions && predictions.length > 0 && (
        <View style={[styles.suggestionsContainer, style.suggestionsContainer]}>
          <FlatList
            data={predictions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.placePrediction.placeId}
            keyboardShouldPersistTaps="always"
            scrollEnabled={scrollEnabled}
            nestedScrollEnabled={nestedScrollEnabled}
            bounces={false}
            style={style.suggestionsList}
            accessibilityRole="list"
            accessibilityLabel={`${predictions.length} place suggestion results`}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  inputContainer: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#efeff1', // default background
    borderRadius: 6,
    marginTop: 3,
    overflow: 'hidden',
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
  },
  separatorLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c8c7cc',
  },
  mainText: {
    fontSize: 16,
    textAlign: 'left',
    color: '#000000',
  },
  secondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'left',
  },
});

export type {
  GooglePlacesTextInputProps,
  GooglePlacesTextInputRef,
  GooglePlacesTextInputStyles,
  Place,
  PlaceDetailsFields,
  PlacePrediction,
  PlaceStructuredFormat,
  GooglePlacesAccessibilityLabels,
  SuggestionTextProps,
};

export default GooglePlacesTextInput;
