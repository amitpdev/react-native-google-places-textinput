import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  I18nManager,
  Platform,
} from 'react-native';

// Import the API functions
import {
  fetchPredictions as fetchPredictionsApi,
  fetchPlaceDetails as fetchPlaceDetailsApi,
  generateUUID,
  isRTLText,
} from './services/googlePlacesApi';

const GooglePlacesTextInput = forwardRef(
  (
    {
      apiKey,
      value,
      placeHolderText,
      proxyUrl,
      languageCode,
      includedRegionCodes,
      types = [],
      biasPrefixText,
      minCharsToFetch = 1,
      onPlaceSelect,
      onTextChange,
      debounceDelay = 200,
      showLoadingIndicator = true,
      showClearButton = true,
      forceRTL = undefined,
      style = {},
      hideOnKeyboardDismiss = false,
      fetchDetails = false,
      detailsProxyUrl = null,
      detailsFields = [],
      onError,
    },
    ref
  ) => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState(value || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sessionToken, setSessionToken] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const debounceTimeout = useRef(null);
    const inputRef = useRef(null);
    const suggestionPressing = useRef(false);

    const generateSessionToken = () => {
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
      // Return empty cleanup function if not using the listener
      return () => {};
    }, [hideOnKeyboardDismiss]);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      clear: () => {
        setInputText('');
        setPredictions([]);
        setShowSuggestions(false);
        setSessionToken(generateSessionToken());
      },
      focus: () => {
        inputRef.current?.focus();
      },
      getSessionToken: () => sessionToken,
    }));

    const fetchPredictions = async (text) => {
      if (!text || text.length < minCharsToFetch) {
        setPredictions([]);
        return;
      }

      setLoading(true);

      const { error, predictions: fetchedPredictions } =
        await fetchPredictionsApi({
          text,
          apiKey,
          proxyUrl,
          sessionToken,
          languageCode,
          includedRegionCodes,
          types,
          biasPrefixText,
        });

      if (error) {
        onError?.(error);
        setPredictions([]);
      } else {
        setPredictions(fetchedPredictions);
        setShowSuggestions(fetchedPredictions.length > 0);
      }

      setLoading(false);
    };

    const fetchPlaceDetails = async (placeId) => {
      if (!fetchDetails || !placeId) return null;

      setDetailsLoading(true);

      const { error, details } = await fetchPlaceDetailsApi({
        placeId,
        apiKey,
        detailsProxyUrl,
        sessionToken,
        languageCode,
        detailsFields,
      });

      setDetailsLoading(false);

      if (error) {
        onError?.(error);
        return null;
      }

      return details;
    };

    const handleTextChange = (text) => {
      setInputText(text);
      onTextChange?.(text);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        fetchPredictions(text);
      }, debounceDelay);
    };

    const handleSuggestionPress = async (suggestion) => {
      const place = suggestion.placePrediction;
      setInputText(place.structuredFormat.mainText.text);
      setShowSuggestions(false);
      Keyboard.dismiss();

      if (fetchDetails) {
        // Show loading indicator while fetching details
        setLoading(true);

        // Fetch the place details - Note that placeId is already in the correct format
        const details = await fetchPlaceDetails(place.placeId);

        // Merge the details with the place data
        const enrichedPlace = details ? { ...place, details } : place;

        // Pass both the enriched place and session token to parent
        onPlaceSelect?.(enrichedPlace, sessionToken);
        setLoading(false);
      } else {
        // Original behavior when fetchDetails is false
        onPlaceSelect?.(place, sessionToken);
      }

      // Generate a new token after a place is selected
      setSessionToken(generateSessionToken());
    };

    // Show suggestions on focus if text length > minCharsToFetch
    const handleFocus = () => {
      if (inputText.length >= minCharsToFetch) {
        fetchPredictions(inputText);
        setShowSuggestions(true);
      }
    };

    // RTL detection logic
    const isRTL =
      forceRTL !== undefined ? forceRTL : isRTLText(placeHolderText);

    const renderSuggestion = ({ item }) => {
      const { mainText, secondaryText } = item.placePrediction.structuredFormat;

      return (
        <TouchableOpacity
          style={[
            styles.suggestionItem,
            // Inherit background color from container if not specified
            {
              backgroundColor:
                style.suggestionsContainer?.backgroundColor || '#efeff1',
            },
            style.suggestionItem,
          ]}
          onPress={() => {
            suggestionPressing.current = false;
            handleSuggestionPress(item);
          }}
          // Fix for web: onBlur fires before onPress, hiding suggestions too early.
          // We use suggestionPressing.current to delay hiding until selection is handled.
          onMouseDown={() => {
            if (Platform.OS === 'web') {
              suggestionPressing.current = true;
            }
          }}
          onTouchStart={() => {
            if (Platform.OS === 'web') {
              suggestionPressing.current = true;
            }
          }}
        >
          <Text
            style={[
              styles.mainText,
              style.suggestionText?.main,
              getTextAlign(),
            ]}
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
            >
              {secondaryText.text}
            </Text>
          )}
        </TouchableOpacity>
      );
    };

    const renderSuggestions = () => {
      if (!showSuggestions || predictions.length === 0) return null;

      return (
        <View style={[styles.suggestionsContainer, style.suggestionsContainer]}>
          <FlatList
            data={predictions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.placePrediction.placeId}
            keyboardShouldPersistTaps="always"
            style={style.suggestionsList}
            scrollEnabled={true}
            bounces={false}
            nestedScrollEnabled={true}
          />
        </View>
      );
    };

    const getPadding = () => {
      const physicalRTL = I18nManager.isRTL;
      const clearButtonPadding = showClearButton ? 75 : 45;
      if (isRTL !== physicalRTL) {
        return {
          paddingStart: clearButtonPadding,
          paddingEnd: 15,
        };
      }
      return {
        paddingStart: 15,
        paddingEnd: clearButtonPadding,
      };
    };

    const getTextAlign = () => {
      const isDeviceRTL = I18nManager.isRTL;
      if (isDeviceRTL) {
        // Device is RTL, so "left" and "right" are swapped
        return { textAlign: isRTL ? 'left' : 'right' };
      } else {
        // Device is LTR, normal behavior
        return { textAlign: isRTL ? 'right' : 'left' };
      }
    };

    const getIconPosition = (paddingValue) => {
      const physicalRTL = I18nManager.isRTL;
      if (isRTL !== physicalRTL) {
        return { start: paddingValue };
      }
      return { end: paddingValue };
    };

    return (
      <View style={[styles.container, style.container]}>
        <View>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              style.input,
              getPadding(),
              { textAlign: isRTL ? 'right' : 'left' },
            ]}
            placeholder={placeHolderText}
            placeholderTextColor={style.placeholder?.color || '#666666'}
            value={inputText}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={() => {
              setTimeout(() => {
                if (suggestionPressing.current) {
                  suggestionPressing.current = false;
                } else {
                  setShowSuggestions(false);
                }
              }, 10);
            }}
            clearButtonMode="never" // Disable iOS native clear button
          />

          {/* Clear button - shown only if showClearButton is true */}
          {showClearButton && inputText !== '' && (
            <TouchableOpacity
              style={[styles.clearButton, getIconPosition(12)]}
              onPress={() => {
                setInputText('');
                setPredictions([]);
                setShowSuggestions(false);
                onTextChange?.('');
                setSessionToken(generateSessionToken());
                inputRef.current?.focus();
              }}
            >
              <Text
                style={Platform.select({
                  ios: styles.iOSclearButton,
                  android: styles.androidClearButton,
                })}
              >
                {'×'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Loading indicator - position adjusts based on showClearButton */}
          {(loading || detailsLoading) && showLoadingIndicator && (
            <ActivityIndicator
              style={[styles.loadingIndicator, getIconPosition(45)]}
              size={'small'}
              color={style.loadingIndicator?.color || '#000000'}
            />
          )}
        </View>
        {renderSuggestions()}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {},
  input: {
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: 'white',
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c8c7cc',
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
  clearButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -13 }],
    padding: 0,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  iOSclearButton: {
    fontSize: 18,
    fontWeight: '400',
    color: 'white',
    backgroundColor: '#999',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 19,
    includeFontPadding: false,
  },
  androidClearButton: {
    fontSize: 24,
    fontWeight: '400',
    color: 'white',
    backgroundColor: '#999',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 20,
    includeFontPadding: false,
  },
});

export default GooglePlacesTextInput;
