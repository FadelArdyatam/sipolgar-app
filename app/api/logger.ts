// Helper function to log API requests and responses
const logApiCall = (method: string, url: string, data?: any) => {
    console.log(`🚀 API ${method} Request:`, url)
    if (data) {
      console.log("Request Data:", JSON.stringify(data, null, 2))
    }
  }
  
  const logApiResponse = (url: string, response: any) => {
    console.log(`✅ API Response for ${url}:`, JSON.stringify(response, null, 2))
  }
  
  const logApiError = (url: string, error: any) => {
    console.error(`❌ API Error for ${url}:`, error)
    if (error.response) {
      console.error("Error Response:", JSON.stringify(error.response.data, null, 2))
      console.error("Status:", error.response.status)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error setting up request:", error.message)
    }
  }
  
  export { logApiCall, logApiResponse, logApiError }
  
  // Usage:
  // logApiCall('GET', 'https://api.example.com/data', { param1: 'value1' })
  // logApiResponse('https://api.example.com/data', { data: 'response data' })
  // logApiError('https://api.example.com/data', { error: 'error message' })