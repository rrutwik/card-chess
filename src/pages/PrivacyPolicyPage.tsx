import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { Shield } from 'lucide-react';
import { CollapsibleRulesSidebar } from '../components/CollapsibleRulesSidebar';
import { useAppStore } from '../stores/appStore';

export const PrivacyPolicyPage: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const { showRules, setShowRules } = useAppStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
        : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)',
      color: isDark ? '#f9fafb' : '#1f2937',
      transition: 'all 0.3s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <CollapsibleRulesSidebar
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
      <Header />

      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 20px',
        flex: 1,
        width: '100%'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <Shield style={{ width: '32px', height: '32px', color: '#667eea' }} />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: isDark ? '#f9fafb' : '#1f2937',
              margin: 0
            }}>
              Privacy Policy
            </h1>
          </div>

          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.15)'}`,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(102, 126, 234, 0.05)',
            lineHeight: '1.6',
            color: isDark ? '#d1d5db' : '#4b5563'
          }}>
            <p style={{ marginBottom: '16px' }}><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>1. Introduction</h2>
            <p style={{ marginBottom: '16px' }}>This Privacy Policy applies to the "Card Chess" application (the "App") available on the Google Play Store. We are committed to protecting your privacy and ensuring you have a positive experience on our App.</p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>2. Information We Collect</h2>
            <p style={{ marginBottom: '16px' }}><strong>a. Account Information:</strong> To provide features such as online multiplayer, we collect information when you authenticate, which may include details provided via OAuth like your profile name and avatar context.</p>
            <p style={{ marginBottom: '16px' }}><strong>b. Gameplay Data:</strong> We may process data related to your in-game activity to maintain synchronization among participants and power the gameplay mechanics.</p>
            <p style={{ marginBottom: '16px' }}><strong>c. Device & Usage Analytics:</strong> We might track usage analytics or application crash reports to refine experience, detect game anomalies, and improve general app stability.</p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>3. How We Use Your Information</h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>To authenticate your identity across our services.</li>
              <li style={{ marginBottom: '8px' }}>To provide a secure and robust real-time gaming environment.</li>
              <li style={{ marginBottom: '8px' }}>To maintain historical data of your games for convenience.</li>
            </ul>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>4. Data Security</h2>
            <p style={{ marginBottom: '16px' }}>We aim to deploy reliable security practices to securely process the telemetry and essential information transmitted by interacting with our platform, guarding against unsanctioned access, leaks, and misappropriation of user data.</p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>5. Third-Party Services</h2>
            <p style={{ marginBottom: '16px' }}>Certain backend systems supporting this application may rely on third-party frameworks. They govern the data they collect according to their respective guidelines, independent of this policy.</p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>6. Children's Privacy</h2>
            <p style={{ marginBottom: '16px' }}>The app content complies with relevant app distributor safety benchmarks. We typically restrict data collection pertaining directly to users under the designated regional limit, e.g. 13 years locally.</p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>7. Changes to this document</h2>
            <p style={{ marginBottom: '16px' }}>This text may undergo updates in alignment with progressing platform features. Adjustments take effect right as they reflect on this hosted page. Check occasionally to note potential revisions regarding personal data policies.</p>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f9fafb' : '#1f2937', marginTop: '24px', marginBottom: '12px' }}>8. Contact Us</h2>
            <p style={{ marginBottom: '16px' }}>If you hold specific questions regarding the contents represented inside this policy, kindly direct your questions via the official app repository channels or support addresses specified in the main application listing.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
