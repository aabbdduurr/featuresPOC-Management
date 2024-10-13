# Feature Management - Management Interface

## Introduction

The feature management interface allows you to manage features in the system. The interface is designed to be user-friendly and intuitive, allowing users to easily create, update, and delete features.

The code is messy and the interace is horrible. But it works.

## Features

The feature management interface provides the following features:

- Create new features
- Update existing features
- Delete features
- Add Segments to features
- Et cetera

## Getting Started

To get started with the feature management interface, follow these steps:

1. Clone the repository
2. Install the dependencies
3. set the configuration in the `config.js` file:
   ```javascript
   export const apiBaseUrl = "<LAMBDA-URL/API-GATEWAY-URL>";
   export const staticBaseUrl = "<S3-URL>";
   export const authToken = "Bearer <TOKEN>";
   ```
4. Run the application

Token is a signed JWT with the following payload:

```json
{
  "user": {
    "email": "<EMAIL>"
  }
}
```

The secret is `togglePOC`. You can change this in the Lambda function.

## Usage

Simply install the dependencies and run the application. The interface is self-explanatory and easy to use.

- `npm start` - Start the application

## License

Use it as you like. No restrictions.
