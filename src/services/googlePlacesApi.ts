const DEFAULT_GOOGLE_API_URL =
  'https://places.googleapis.com/v1/places:autocomplete';
const DEFAULT_PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places/';

interface FetchPredictionsParams {
  text: string;
  apiKey?: string;
  proxyUrl?: string;
  sessionToken?: string | null;
  languageCode?: string;
  includedRegionCodes?: string[];
  types?: string[];
  biasPrefixText?: (text: string) => string;
}

interface FetchPlaceDetailsParams {
  placeId: string;
  apiKey?: string;
  detailsProxyUrl?: string | null;
  sessionToken?: string | null;
  languageCode?: string;
  detailsFields?: string[];
}

interface PredictionResult {
  error: Error | null;
  predictions: any[];
}

interface PlaceDetailsResult {
  error: Error | null;
  details: any;
}

/**
 * Fetches place predictions from Google Places API
 */
export const fetchPredictions = async ({
  text,
  apiKey,
  proxyUrl,
  sessionToken,
  languageCode,
  includedRegionCodes,
  types = [],
  biasPrefixText,
}: FetchPredictionsParams): Promise<PredictionResult> => {
  if (!text) {
    return { error: null, predictions: [] };
  }

  const processedText = biasPrefixText ? biasPrefixText(text) : text;

  try {
    const API_URL = proxyUrl || DEFAULT_GOOGLE_API_URL;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-Goog-Api-Key'] = apiKey;
    }

    const body = {
      input: processedText,
      languageCode,
      ...(sessionToken && { sessionToken }),
      ...(includedRegionCodes &&
        includedRegionCodes.length > 0 && { includedRegionCodes }),
      ...(types.length > 0 && { includedPrimaryTypes: types }),
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error fetching predictions');
    }

    return { error: null, predictions: data.suggestions || [] };
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return { error: error as Error, predictions: [] };
  }
};

/**
 * Fetches place details from Google Places API
 */
export const fetchPlaceDetails = async ({
  placeId,
  apiKey,
  detailsProxyUrl,
  sessionToken,
  languageCode,
  detailsFields = [],
}: FetchPlaceDetailsParams): Promise<PlaceDetailsResult> => {
  if (!placeId) {
    return { error: null, details: null };
  }

  try {
    const API_URL = detailsProxyUrl
      ? `${detailsProxyUrl}/${placeId}`
      : `${DEFAULT_PLACE_DETAILS_URL}${placeId}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-Goog-Api-Key'] = apiKey;
    }

    // Add the required field mask header
    const fieldsToRequest =
      detailsFields.length > 0
        ? detailsFields
        : ['displayName', 'formattedAddress', 'location', 'id'];

    headers['X-Goog-FieldMask'] = fieldsToRequest.join(',');

    // For the Places API v1, the session token is sent as a header
    if (sessionToken) {
      headers['X-Goog-SessionToken'] = sessionToken;
    }

    // Build query parameters - only include language
    const params = new URLSearchParams();
    if (languageCode) {
      params.append('languageCode', languageCode);
    }

    // Append query parameters if needed
    const url = `${API_URL}${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error fetching place details');
    }

    return { error: null, details: data };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return { error: error as Error, details: null };
  }
};

/**
 * Helper function to generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    /* eslint-disable no-bitwise */
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    /* eslint-enable no-bitwise */
    return v.toString(16);
  });
};

/**
 * RTL detection logic
 */
export const isRTLText = (text: string): boolean => {
  if (!text) return false;
  const rtlRegex =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u0870-\u089F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
};
