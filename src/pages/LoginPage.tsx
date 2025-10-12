import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Cookies from 'js-cookie';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getUserDetails, loginWithGoogle } from '../services/api';
import { GoogleLoginComponent } from '../components/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const clientId = '201954194593-36t0nksh9jusg01k58et81ct27objt26.apps.googleusercontent.com';

  const handleLoginSuccess = async (response: any) => {
    try {
      console.log('🔐 Login attempt started');

      const { data } = await loginWithGoogle({ ...response });
      console.log('✅ Login response received:', data);

      // The API service already stored the token in localStorage
      // Now just call login with the user data from the response
      login(data.data.user); // Pass only the user data

      console.log('✅ User logged in successfully:', data.data.user);

      // Navigate to home page after successful login
      setTimeout(() => {
        console.log('🔄 Navigating to home page...');
        navigate('/');
      }, 100);

    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        data: (error as any)?.response?.data
      });
    }
  };

  // Navigate away when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 LoginPage: User is authenticated, navigating to home...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginError = (error: any) => {
    console.error('Login failed:', error);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border border-border shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🙏</span>
            </div>
            <CardTitle className="text-2xl text-card-foreground">Welcome</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Welcome to Card Chess
            </CardDescription>
          </CardHeader>
          <GoogleLoginComponent handleLoginSuccess={handleLoginSuccess} handleLoginError={handleLoginError} />
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}
