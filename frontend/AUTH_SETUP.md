# Authentication Setup

This project uses Supabase for authentication. The authentication system includes:

## Features

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Email Verification**: Users must verify their email address after signup
- **Password Reset**: Users can reset their password via email
- **Google OAuth**: Users can sign in with their Google account
- **Protected Routes**: Certain pages require authentication
- **User Profile**: Display user information and logout functionality
- **Session Management**: Automatic session handling and persistence

## Environment Variables

Make sure you have the following environment variables in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Components

### AuthProvider
Wraps the entire application and provides authentication context.

### LoginForm
Handles user login with email/password and Google OAuth. Includes "Forgot Password" functionality.

### SignUpForm
Handles user registration with email/password and Google OAuth. Shows email verification after signup.

### EmailVerification
Displays when users need to verify their email address. Allows resending verification emails.

### PasswordReset
Allows users to request a password reset email.

### UserProfile
Displays user information and provides logout functionality.

### EmailVerificationBanner
Shows a banner when logged-in users haven't verified their email.

### ProtectedRoute
Wraps components that require authentication. Redirects unauthenticated users to the auth page.

## Pages

### `/auth`
Authentication page that switches between login and signup forms.

### `/auth/callback`
Handles OAuth redirects from Google and email verification links.

### `/auth/reset-password`
Allows users to set a new password after clicking a reset link.

### `/dashboard`
Protected page that requires authentication.

## Email Verification Flow

1. **Sign Up**: User creates account with email/password
2. **Verification Email**: Supabase sends verification email automatically
3. **Email Verification Page**: User sees verification page with resend option
4. **Click Link**: User clicks verification link in email
5. **Verified**: User is redirected back to app and marked as verified
6. **Banner**: If user is logged in but not verified, shows verification banner

## Password Reset Flow

1. **Forgot Password**: User clicks "Forgot Password" on login form
2. **Reset Request**: User enters email and requests reset
3. **Reset Email**: Supabase sends password reset email
4. **Reset Page**: User clicks link and sets new password
5. **Success**: User is redirected to home page

## Usage

### Using the useAuth Hook

```tsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, loading, emailVerified, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  if (!user) {
    return <div>Please sign in</div>
  }
  
  if (!emailVerified) {
    return <div>Please verify your email</div>
  }
  
  return <div>Welcome, {user.email}!</div>
}
```

### Protecting Routes

```tsx
import ProtectedRoute from './components/auth/ProtectedRoute'

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### Email Verification Status

```tsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { emailVerified } = useAuth()
  
  if (!emailVerified) {
    return <div>Please verify your email to access this feature</div>
  }
  
  return <div>Feature available for verified users</div>
}
```

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Enable Authentication in your Supabase dashboard
3. Configure Email Templates (optional):
   - Go to Authentication > Email Templates
   - Customize confirmation and reset email templates
4. Configure Google OAuth (optional):
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
5. Copy your project URL and anon key to your environment variables

## Email Configuration

### Email Templates
You can customize email templates in Supabase:
- **Confirmation Email**: Sent when user signs up
- **Reset Password Email**: Sent when user requests password reset
- **Magic Link Email**: Sent when using magic link authentication

### Email Settings
- **SMTP Settings**: Configure custom SMTP server (optional)
- **From Email**: Set the sender email address
- **Reply To**: Set reply-to email address

## Google OAuth Setup (Optional)

1. Go to Google Cloud Console
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
6. Copy Client ID and Client Secret to Supabase Google provider settings 