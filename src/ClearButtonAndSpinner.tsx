import type { GooglePlacesTextInputProps } from './GooglePlacesTextInput';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ClearButtonAndSpinnerProps
  extends Pick<
    GooglePlacesTextInputProps,
    | 'showClearButton'
    | 'style'
    | 'accessibilityLabels'
    | 'clearElement'
    | 'showLoadingIndicator'
  > {
  isInputEmpty: boolean;
  isLoading: boolean;
  onPress: () => void;
}

const ClearButtonAndSpinner: React.FC<ClearButtonAndSpinnerProps> = ({
  showClearButton = true,
  showLoadingIndicator = true,
  style = {},
  accessibilityLabels,
  isLoading,
  isInputEmpty,
  onPress,
  clearElement,
}) => {
  // Loading indicator
  if (isLoading) {
    if (!showLoadingIndicator) return null;

    return (
      <ActivityIndicator
        style={[styles.loadingIndicator]}
        size={'small'}
        color={style.loadingIndicator?.color || '#000000'}
        accessibilityLiveRegion="polite"
        accessibilityLabel={
          accessibilityLabels?.loadingIndicator || 'Loading suggestions'
        }
      />
    );
  }

  // Clear button visibility check
  // Not shown if showClearButton is false or input is empty
  if (!showClearButton || isInputEmpty) return null;

  // Clear button
  return (
    <TouchableOpacity
      style={[styles.clearButton]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabels?.clearButton || 'Clear input text'
      }
    >
      {clearElement || (
        <View style={styles.clearTextWrapper}>
          <Text
            style={[
              Platform.select({
                ios: styles.iOSclearText,
                android: styles.androidClearText,
              }),
              style.clearButtonText,
            ]}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          >
            {'×'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    alignSelf: 'center',
    padding: 0,
  },
  loadingIndicator: {
    alignSelf: 'center',
  },
  clearTextWrapper: {
    backgroundColor: '#999',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  //this is never going to be consistent between different phone fonts and sizes
  iOSclearText: {
    fontSize: 22,
    fontWeight: '400',
    color: 'white',
    lineHeight: 24,
    includeFontPadding: false,
  },
  androidClearText: {
    fontSize: 24,
    fontWeight: '400',
    color: 'white',
    lineHeight: 25.5,
    includeFontPadding: false,
  },
});

export type { ClearButtonAndSpinnerProps };
export default ClearButtonAndSpinner;
