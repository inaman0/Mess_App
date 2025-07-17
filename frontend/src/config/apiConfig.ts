// Define the host and port separately
const API_PROTOCOL = "http";
const API_HOSTNAME = "localhost";
const API_PORT = "8082";
const API_VERSION = "v1";

// Construct the full base URL dynamically
const API_HOST = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}`;
const API_BASE_URL = `${API_HOST}/api`;

// const formatString=(input:string)=> {
//   return input
//     .replace(/_/g, ' ') // Temporarily replace '_' with space for easy manipulation
//     .replace(/(?:^|\s)(\w)/g, (_, c) => c.toUpperCase()) // Capitalize first and all letters after space
//     .replace(/\s+/g, ''); // Remove all spaces
// }
const formatString = (input: string): string => {
  return input.replace(/_([a-z])/g, (_, char) => char.toUpperCase()) // capitalize letter after _
              .replace(/^([a-z])/, (_, char) => char.toUpperCase()); // capitalize first letter if not already
};


const apiConfig = {
  API_PROTOCOL,   // HTTP or HTTPS
  API_HOSTNAME,   // Domain or IP (e.g., localhost, example.com)
  API_PORT,       // Port number
  API_VERSION,    // API version (e.g., v1, v2)
  API_HOST,       // Full base host URL
  API_BASE_URL,   // Full API base URL
  getResourceUrl: (resName: string) => `${API_BASE_URL}/${resName.toLowerCase()}`,
  getResourceMetaDataUrl: (resName: string) => `${API_BASE_URL}/getAllResourceMetaData/${formatString(resName)}`,
};

export default apiConfig;
