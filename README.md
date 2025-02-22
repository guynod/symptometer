# Guy's Symptometer

## Scope

- Be able to add a symptom I want to track and the part of the body it affects
- Be able to track history of experiencing that symptom, and speculate on recent activities that may have triggered it
- Be able to see the history of that symptom and progression over time
- Be able to add or delete symptoms or modifiy existing symptoms

## Tech Stack

- React Native
- Expo
- Tailwind CSS
- Firebase

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials in `.env`
   - Never commit the `.env` file!

4. Start the development server:
   ```bash
   npx expo start
   ```

## Environment Variables

The following environment variables are required:

```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here
```

Get these values from your Firebase project settings. Never commit these values to version control!

## Advanced Features

- Be able to record symptom details:
  - Duration, intensity, and frequency for symptoms
- Notes/comments for each symptom
- Track medical interventions and treatments
- Track medications consumed for symptom management
- Track personal records (PRs) for how long in between symptom occurence for symptoms that one doesn't want to experience again
- View symptom statistics and analytics
- Categorize symptoms for better organization based multiple factors such as time of day, frequency, intensity, and duration, body part, potential causes, and more
- AI Coach to help with symptom tracking and prevention
- AI assistant to generate insights and notes for medical professionals
- Integrate with Notion
- Integrate with Youtube videos to see options to improve symptoms
