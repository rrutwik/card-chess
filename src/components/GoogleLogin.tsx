// NOTE: This component requires @react-oauth/google to be installed
// Run: npm install @react-oauth/google

import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "../contexts/ThemeContext";

export function GoogleLoginComponent({
  handleLoginSuccess,
  handleLoginError,
}: {
  handleLoginSuccess: (response: any) => void;
  handleLoginError: (error: any) => void;
}) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  return (
    <div style={{
      padding: '0 32px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <GoogleLogin
          onSuccess={(response) => {
            try {
              console.log("Login success:", response);
              handleLoginSuccess(response);
            } catch (err) {
              console.error("Login error:", err);
              handleLoginError(err);
            }
          }}
          onError={() => {
            handleLoginError("Login failed, please try again.");
          }}
          containerProps={{
            style: {
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
          text="signin_with"
          theme="filled_blue"
          shape="pill"
          size="large"
          width="320"
        />
      </div>
      
      {/* Divider */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '8px 0'
      }}>
        <div style={{
          flex: 1,
          height: '1px',
          background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
          transition: 'background 0.3s ease'
        }}></div>
        <span style={{
          fontSize: '13px',
          color: isDark ? '#6b7280' : '#9ca3af',
          fontWeight: '500',
          transition: 'color 0.3s ease'
        }}>
          SECURE LOGIN
        </span>
        <div style={{
          flex: 1,
          height: '1px',
          background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
          transition: 'background 0.3s ease'
        }}></div>
      </div>

      {/* Security badges */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
          borderRadius: '20px',
          fontSize: '12px',
          color: isDark ? '#9ca3af' : '#6b7280',
          transition: 'all 0.3s ease'
        }}>
          <span>🔒</span>
          <span>Encrypted</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
          borderRadius: '20px',
          fontSize: '12px',
          color: isDark ? '#9ca3af' : '#6b7280',
          transition: 'all 0.3s ease'
        }}>
          <span>✓</span>
          <span>Verified</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6',
          borderRadius: '20px',
          fontSize: '12px',
          color: isDark ? '#9ca3af' : '#6b7280',
          transition: 'all 0.3s ease'
        }}>
          <span>⚡</span>
          <span>Fast</span>
        </div>
      </div>
    </div>
  );
}
