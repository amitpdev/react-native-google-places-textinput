import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import GooglePlacesTextInput from 'react-native-google-places-textinput';

const App = () => {
  const handleBasicPlaceSelect = (place, token) => {
    console.log('Basic example selected place:', place);
    console.log('Session token generated for this session:', token);
  };

  const handleStyledPlaceSelect = (place) => {
    console.log('Styled example selected place:', place);
  };

  // Custom styles example
  const customStyles = {
    container: {
      width: '100%',
      paddingHorizontal: 16,
    },
    input: {
      height: 50,
      borderWidth: 1.5,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: '#F8F8F8',
    },
    suggestionsContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      maxHeight: 300,
      marginTop: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    suggestionItem: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    suggestionText: {
      main: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
      },
      secondary: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
      },
    },
    loadingIndicator: {
      color: '#666666',
    },
    placeholder: {
      color: '#999999',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Example</Text>
        <GooglePlacesTextInput
          apiKey="YOUR_API_KEY_HERE"
          placeHolderText="Search for a location"
          onPlaceSelect={handleBasicPlaceSelect}
          minCharsToFetch={2}
          languageCode="en"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Styled Example</Text>
        <GooglePlacesTextInput
          apiKey="YOUR_API_KEY_HERE"
          placeHolderText="Find places nearby"
          onPlaceSelect={handleStyledPlaceSelect}
          style={customStyles}
          minCharsToFetch={2}
          languageCode="en"
          debounceDelay={300}
          types={['restaurant', 'cafe']}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Place Details Example</Text>
        <GooglePlacesTextInput
          apiKey="YOUR_API_KEY_HERE"
          placeHolderText="Search with full details"
          onPlaceSelect={(place) => {
            console.log('Place with details:', place);
            if (place?.details) {
              console.log(
                'Address components:',
                place.details.addressComponents
              );
              console.log('Formatted address:', place.details.formattedAddress);
              console.log('Location:', place.details.location);
              console.log('Has photos:', place.details.photos?.length > 0);
            }
          }}
          onError={(error) => console.error('Places API error:', error)}
          fetchDetails={true}
          detailsFields={[
            'addressComponents',
            'formattedAddress',
            'location',
            'viewport',
            'photos',
            'types',
          ]}
          style={{
            container: {
              width: '100%',
              paddingHorizontal: 16,
            },
            input: {
              height: 50,
              borderWidth: 1.5,
              borderColor: '#7986CB',
              borderRadius: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              backgroundColor: '#F5F7FF',
            },
            suggestionsContainer: {
              borderRadius: 12,
              maxHeight: 300,
            },
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scroll Disabled Example</Text>
        <GooglePlacesTextInput
          apiKey="YOUR_API_KEY_HERE"
          placeHolderText="Try scrolling these results"
          onPlaceSelect={(place) => {
            console.log('Scroll disabled example, selected:', place);
          }}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          style={{
            container: {
              width: '100%',
              paddingHorizontal: 16,
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 16,
    color: '#333333',
  },
});

export default App;
