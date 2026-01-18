# Fix for Product Share Link & Page Reload Issue

## Problem
When sharing a product link like `http://localhost:3000/product/123abc` or reloading the page, you get a "Not Found" error.

## Root Cause
This is a common issue with Single Page Applications (SPAs) using client-side routing. When you reload a page, the browser makes a request to the server for that exact URL path, but the server doesn't have a route configured for it.

## Solution for Development

### **IMPORTANT: Always Access via Port 3000**
✅ **Correct**: `http://localhost:3000`
❌ **Wrong**: `http://localhost:5000`

The React development server (port 3000) automatically handles client-side routing.
The backend server (port 5000) only provides API endpoints.

### Steps to Verify:
1. Make sure both servers are running:
   - Frontend: `npm start` in `frontend` folder (runs on port 3000)
   - Backend: `node server.js` in `backend` folder (runs on port 5000)

2. Always open your browser to: `http://localhost:3000`

3. Test by:
   - Opening `http://localhost:3000/product/[any-product-id]`
   - Refreshing the page (F5)
   - It should work without any "Not Found" errors

## Solution for Production

For production deployment, we've added a catch-all route in the backend that serves the React app for any non-API routes. This ensures that when deployed, all client-side routes work correctly.

## Sharing Product Links

When you share a product link, make sure to:
1. Use the correct port (3000 in development)
2. Copy the full URL including the protocol: `http://localhost:3000/product/123`

## Additional Notes

- The "Share" button functionality uses `window.location.href`, which automatically captures the current URL
- On mobile devices with Web Share API support, it will open the native share dialog
- On desktop, it copies the link to clipboard

## Troubleshooting

If you still see "Not Found" errors:
1. Clear your browser cache
2. Stop both servers (Ctrl+C)
3. Restart frontend: `cd frontend && npm start`
4. Restart backend: `cd backend && node server.js`
5. Access ONLY via `http://localhost:3000`
