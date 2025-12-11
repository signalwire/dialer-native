# SignalWire Dialer Backend

Backend API server for the SignalWire Dialer mobile application. Handles subscriber creation through the SignalWire Fabric API.

## Prerequisites

- Node.js (>= 20)
- SignalWire account with Fabric access

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Configure your SignalWire credentials in `.env`:

```
PORT=3000
SIGNALWIRE_SPACE_NAME=your-space-name
SIGNALWIRE_PROJECT_ID=your-project-id
SIGNALWIRE_API_TOKEN=your-api-token
```

### Getting Your SignalWire Credentials

1. Log in to your [SignalWire Dashboard](https://signalwire.com/)
2. Your Space Name is visible in your dashboard URL: `https://your-space-name.signalwire.com`
3. Navigate to API section to get your Project ID and API Token

## Running the Server

Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### POST /signup

Creates a new SignalWire subscriber.

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**

```json
{
  "id": "d369a402-7b43-4512-8735-9d5e1f387814",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "created_at": "2024-05-06T12:20:00Z"
}
```

**Error Response (422):**

```json
{
  "errors": [
    {
      "type": "validation_error",
      "code": "invalid_email",
      "message": "Email is already taken",
      "attribute": "email"
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response (200):**

```json
{
  "status": "ok"
}
```

## Development

The backend uses:

- Express.js for the web server
- dotenv for environment variable management
- Basic authentication for SignalWire API calls

## Integration with Mobile App

The mobile app expects the backend to be running on `http://localhost:3000` by default. Update the `SIGNUP_API_URL` in the mobile app's `src/services/auth.ts` if your backend runs on a different URL.

For iOS simulator: Use `http://localhost:3000`
For Android emulator: Use `http://10.0.2.2:3000`
