import { render } from '@testing-library/react-native';
import GooglePlacesTextInput from '../GooglePlacesTextInput';

// Mock the API functions
jest.mock('../services/googlePlacesApi', () => ({
  fetchPlaceDetails: jest.fn(),
  fetchPredictions: jest.fn(),
  generateUUID: jest.fn(() => 'mock-uuid'),
  isRTLText: jest.fn(() => false),
}));

const defaultProps = {
  apiKey: 'test-api-key',
  onPlaceSelect: jest.fn(),
};

describe('GooglePlacesTextInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { toJSON } = render(<GooglePlacesTextInput {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  describe('scroll control props', () => {
    it('should render with scrollEnabled=true by default', () => {
      const { toJSON } = render(<GooglePlacesTextInput {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with scrollEnabled=false', () => {
      const { toJSON } = render(
        <GooglePlacesTextInput {...defaultProps} scrollEnabled={false} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with nestedScrollEnabled=true by default', () => {
      const { toJSON } = render(<GooglePlacesTextInput {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with nestedScrollEnabled=false', () => {
      const { toJSON } = render(
        <GooglePlacesTextInput {...defaultProps} nestedScrollEnabled={false} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with both scroll props disabled', () => {
      const { toJSON } = render(
        <GooglePlacesTextInput
          {...defaultProps}
          scrollEnabled={false}
          nestedScrollEnabled={false}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('prop validation', () => {
    it('should accept scrollEnabled as boolean', () => {
      // These should not throw TypeScript or runtime errors
      expect(() => {
        render(
          <GooglePlacesTextInput {...defaultProps} scrollEnabled={true} />
        );
      }).not.toThrow();

      expect(() => {
        render(
          <GooglePlacesTextInput {...defaultProps} scrollEnabled={false} />
        );
      }).not.toThrow();
    });

    it('should accept nestedScrollEnabled as boolean', () => {
      // These should not throw TypeScript or runtime errors
      expect(() => {
        render(
          <GooglePlacesTextInput {...defaultProps} nestedScrollEnabled={true} />
        );
      }).not.toThrow();

      expect(() => {
        render(
          <GooglePlacesTextInput
            {...defaultProps}
            nestedScrollEnabled={false}
          />
        );
      }).not.toThrow();
    });

    it('should accept both scroll control props together', () => {
      expect(() => {
        render(
          <GooglePlacesTextInput
            {...defaultProps}
            scrollEnabled={true}
            nestedScrollEnabled={false}
          />
        );
      }).not.toThrow();
    });
  });
});
