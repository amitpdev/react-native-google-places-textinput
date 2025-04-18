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

const DEFAULT_GOOGLE_API_URL =
  'https://places.googleapis.com/v1/places:autocomplete';

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
    },
    ref
  ) => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState(value || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimeout = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
      return () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
      };
    }, []);

    // Add keyboard listener
    useEffect(() => {
      const keyboardDidHideSubscription = Keyboard.addListener(
        'keyboardDidHide',
        () => setShowSuggestions(false)
      );

      return () => {
        keyboardDidHideSubscription.remove();
      };
    }, []);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      clear: () => {
        setInputText('');
        setPredictions([]);
        setShowSuggestions(false);
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const fetchPredictions = async (text) => {
      if (!text || text.length < minCharsToFetch) {
        setPredictions([]);
        return;
      }

      const processedText = biasPrefixText ? biasPrefixText(text) : text;

      try {
        setLoading(true);
        const API_URL = proxyUrl ? proxyUrl : DEFAULT_GOOGLE_API_URL;
        const headers = {
          'Content-Type': 'application/json',
        };
        if (apiKey || apiKey !== '') {
          headers['X-Goog-Api-Key'] = apiKey;
        }
        const response = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            input: processedText,
            languageCode,
            ...(includedRegionCodes?.length > 0 && { includedRegionCodes }),
            ...(types.length > 0 && { includedPrimaryTypes: types }),
          }),
        });

        const data = await response.json();

        if (data.suggestions) {
          setPredictions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setPredictions([]);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    const handleTextChange = (text) => {
      setInputText(text);
      onPlaceSelect(null);
      onTextChange?.(text);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        fetchPredictions(text);
      }, debounceDelay);
    };

    const handleSuggestionPress = (suggestion) => {
      const place = suggestion.placePrediction;
      setInputText(place.structuredFormat.mainText.text);
      setShowSuggestions(false);
      Keyboard.dismiss();
      onPlaceSelect(place); // Notify parent with selected place
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
      forceRTL !== undefined
        ? forceRTL
        : isRTLText(placeHolderText) || I18nManager.isRTL;

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
          onPress={() => handleSuggestionPress(item)}
        >
          <Text
            style={[
              styles.mainText,
              style.suggestionText?.main,
              { textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {mainText.text}
          </Text>
          {secondaryText && (
            <Text
              style={[
                styles.secondaryText,
                style.suggestionText?.secondary,
                { textAlign: isRTL ? 'right' : 'left' },
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

    return (
      <View style={[styles.container, style.container]}>
        <View>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              style.input,
              {
                // Icons are on the left when RTL, so add more padding on left
                paddingLeft: isRTL ? (showClearButton ? 75 : 45) : 15,
                // Icons are on the right when LTR, so add more padding on right
                paddingRight: isRTL ? 15 : showClearButton ? 75 : 45,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={placeHolderText}
            placeholderTextColor={style.placeholder?.color || '#666666'}
            value={inputText}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={() => setShowSuggestions(false)}
            clearButtonMode="never" // Disable iOS native clear button
          />

          {/* Clear button - shown only if showClearButton is true */}
          {showClearButton && inputText !== '' && (
            <TouchableOpacity
              style={[isRTL ? styles.leftIcon : styles.rightIcon]}
              onPress={() => {
                setInputText('');
                setPredictions([]);
                setShowSuggestions(false);
                onPlaceSelect?.(null);
                onTextChange?.('');
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
          {loading && showLoadingIndicator && (
            <ActivityIndicator
              style={[
                isRTL ? styles.leftLoadingIcon : styles.rightLoadingIcon,
                !showClearButton &&
                  (isRTL ? styles.leftEdge : styles.rightEdge),
                styles.loadingIndicator,
              ]}
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
  container: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  rtlText: {
    writingDirection: 'rtl',
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
  rightAligned: {
    right: 15,
  },
  rightIcon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -13 }],
    right: 12,
    padding: 0,
  },
  leftIcon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -13 }],
    left: 12,
    padding: 0,
  },
  rightLoadingIcon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -10 }],
    right: 45,
  },
  leftLoadingIcon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -10 }],
    left: 45,
  },
  rightEdge: {
    right: 12,
  },
  leftEdge: {
    left: 12,
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

const isRTLText = (text) => {
  if (!text) return false;
  // Hebrew: \u0590-\u05FF
  // Arabic: \u0600-\u06FF, \u0750-\u077F (Arabic Supplement), \u0870-\u089F (Arabic Extended-B)
  // Arabic Presentation Forms: \uFB50-\uFDFF, \uFE70-\uFEFF
  const rtlRegex =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u0870-\u089F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
};

export default GooglePlacesTextInput;
