# Using Place Details with Expo Web

## The CORS Issue with Google Places Details API

When using the Google Places Details API in a web browser (including Expo Web), you'll encounter Cross-Origin Resource Sharing (CORS) restrictions. Google's Places API doesn't include the necessary CORS headers to allow direct browser requests, which results in errors like:

```
Access to fetch at 'https://places.googleapis.com/v1/places/...' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Use a Proxy Server

To work around this limitation, you need to set up a proxy server that:

1. Receives requests from your Expo Web application
2. Forwards them to the Google Places Details API
3. Returns the response back to your application

The proxy server adds the necessary CORS headers to make the browser happy.

## Setting Up the Proxy Server

We've included an example proxy server in the repository. Here's how to set it up:

### 1. Install Dependencies

Navigate to your project directory and install the required packages:

```bash
npm install express axios
# or
yarn add express axios
```

### 2. Copy the Proxy Server Code

Copy the example proxy server code from `example/places-details-proxy.js` to your project. You can place it in your project root or in a server directory.

### 3. Run the Proxy Server

Start the proxy server:

```bash
node places-details-proxy.js
```

By default, the server will run at `http://localhost:3001`.

### 4. Configure Your React Native Component

Update your GooglePlacesTextInput component to use the proxy:

```javascript
<GooglePlacesTextInput
  apiKey="YOUR_GOOGLE_PLACES_API_KEY"
  fetchDetails={true}
  detailsProxyUrl="http://localhost:3001/places-details"
  detailsFields={['formattedAddress', 'location']}
  onPlaceSelect={handlePlaceSelect}
/>
```

## Deploying to Production

For production use:

1. Deploy the proxy server to a hosting service (like Heroku, Vercel, AWS, etc.)
2. Update your `detailsProxyUrl` to point to your deployed proxy

## Security Considerations

When implementing this in production:

1. **Don't expose your Google API key**: Consider validating requests and using your API key on the server side only
2. **Limit access**: Restrict who can use your proxy with authentication or origin checking
3. **Monitor usage**: Keep track of API usage to avoid unexpected costs

By following these steps, you can use Google Places Details API with Expo Web applications effectively.
