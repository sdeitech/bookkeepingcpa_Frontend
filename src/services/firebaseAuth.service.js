/**
 * Firebase Authentication Service (Frontend)
 * Handles Firebase custom token authentication
 */

import { signInWithCustomToken, signOut } from 'firebase/auth';
import { getFirebaseAuth, initializeFirebase } from '../config/firebase';
import config from '../config';

class FirebaseAuthService {
  constructor() {
    this.auth = null;
    this.currentUser = null;
  }

  /**
   * Initialize Firebase auth
   */
  initialize() {
    if (!this.auth) {
      initializeFirebase();
      this.auth = getFirebaseAuth();
    }
  }

  /**
   * Get Firebase custom token from backend
   * @returns {Promise<string>} Firebase custom token
   */
  async getCustomTokenFromBackend() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.api.baseUrl}/auth/firebase-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get Firebase token from backend');
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.firebaseToken) {
        throw new Error('Invalid response from backend');
      }

      return data.data.firebaseToken;
    } catch (error) {
      console.error('Error getting Firebase custom token:', error);
      throw error;
    }
  }

  /**
   * Sign in to Firebase with custom token
   * @param {string} customToken - Firebase custom token from backend
   * @returns {Promise<Object>} Firebase user credential
   */
  async signInWithToken(customToken) {
    try {
      this.initialize();
      
      const userCredential = await signInWithCustomToken(this.auth, customToken);
      this.currentUser = userCredential.user;
      
      console.log('✅ Signed in to Firebase:', this.currentUser.uid);
      return userCredential;
    } catch (error) {
      console.error('Error signing in to Firebase:', error);
      throw error;
    }
  }

  /**
   * Complete Firebase authentication flow
   * Gets token from backend and signs in
   * @returns {Promise<Object>} Firebase user credential
   */
  async authenticateWithBackend() {
    try {
      console.log('🔐 Authenticating with Firebase...');
      
      // Get custom token from backend
      const customToken = await this.getCustomTokenFromBackend();
      
      // Sign in to Firebase with custom token
      const userCredential = await this.signInWithToken(customToken);
      
      console.log('✅ Firebase authentication complete');
      return userCredential;
    } catch (error) {
      console.error('❌ Firebase authentication failed:', error);
      throw error;
    }
  }

  /**
   * Sign out from Firebase
   */
  async signOutFromFirebase() {
    try {
      if (this.auth) {
        await signOut(this.auth);
        this.currentUser = null;
        console.log('✅ Signed out from Firebase');
      }
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
  }

  /**
   * Check if user is signed in to Firebase
   * @returns {boolean}
   */
  isSignedIn() {
    return this.auth?.currentUser !== null;
  }

  /**
   * Get current Firebase user
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  /**
   * Listen for auth state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    this.initialize();
    return this.auth.onAuthStateChanged(callback);
  }
}

// Export singleton instance
export default new FirebaseAuthService();
