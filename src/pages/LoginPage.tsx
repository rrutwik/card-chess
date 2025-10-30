import Cookies from 'js-cookie';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getUserDetails, loginWithGoogle } from '../services/api';
import { GoogleLoginComponent } from '../components/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = '201954194593-36t0nksh9jusg01k58et81ct27objt26.apps.googleusercontent.com';

  const isDark = actualTheme === 'dark';

  // Get the redirect path from location state, default to '/'
  const from = (location.state as any)?.from?.pathname || '/';

  const handleLoginSuccess = async (response: any) => {
    try {
      console.log('🔐 Login attempt started');

      const { data } = await loginWithGoogle({ ...response });
      console.log('✅ Login response received:', data);

      // The API service already stored the token in localStorage
      // Now just call login with the user data from the response
      login(data.data.user); // Pass only the user data

      console.log('✅ User logged in successfully:', data.data.user);

      // Navigate to the original page or home page after successful login
      setTimeout(() => {
        console.log('🔄 Navigating to:', from);
        navigate(from, { replace: true });
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
      console.log('🔄 LoginPage: User is authenticated, navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginError = (error: any) => {
    console.error('Login failed:', error);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{
        minHeight: '100vh',
        background: isDark 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        transition: 'background 0.3s ease'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            background: isDark ? 'rgba(118, 75, 162, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}></div>
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: isDark 
            ? 'rgba(30, 30, 46, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          boxShadow: isDark 
            ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
            : '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.5s ease-out',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
            }
          `}</style>
          
          {/* Card Header */}
          <div style={{
            padding: '48px 32px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Icon Container */}
            <div style={{
              margin: '0 auto',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <span style={{
                fontSize: '40px',
                lineHeight: 1
              }}>🙏</span>
            </div>

            {/* Title */}
            <div>
              <h1 style={{
                margin: '0 0 12px 0',
                fontSize: '32px',
                fontWeight: '700',
                color: isDark ? '#f9fafb' : '#1a1a1a',
                letterSpacing: '-0.5px',
                transition: 'color 0.3s ease'
              }}>
                Welcome Back
              </h1>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: isDark ? '#9ca3af' : '#6b7280',
                lineHeight: '1.5',
                transition: 'color 0.3s ease'
              }}>
                Sign in to continue to Card Chess
              </p>
            </div>
          </div>

          {/* Card Content */}
          <GoogleLoginComponent 
            handleLoginSuccess={handleLoginSuccess} 
            handleLoginError={handleLoginError} 
          />

          {/* Footer */}
          <div style={{
            padding: '24px 32px 32px',
            textAlign: 'center',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
            transition: 'border-color 0.3s ease'
          }}>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: isDark ? '#6b7280' : '#9ca3af',
              transition: 'color 0.3s ease'
            }}>
              By signing in, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
