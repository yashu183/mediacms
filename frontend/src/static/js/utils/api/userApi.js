import { ApiUrlConsumer } from '../contexts/';

// User API utilities for fetching real user data
class UserAPI {
  constructor() {
    this.userData = null;
    this.loading = false;
  }

  async fetchUserData() {
    if (this.loading) return this.userData;

    this.loading = true;

    try {
      const response = await fetch('http://localhost/api/v1/whoami', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();

        this.userData = {
          name: userData.name || 'Anonymous',
          username: userData.username || null,
          thumbnail: userData.thumbnail_url || null,
          is: {
            admin: userData.is_staff || false,
            anonymous: !userData.username,
            advancedUser: userData.advancedUser || false,
          },
          can: {
            addMedia: userData.advancedUser || userData.is_staff || false,
            editMedia: userData.advancedUser || userData.is_staff || false,
            deleteMedia: userData.advancedUser || userData.is_staff || false,
            editSubtitle: userData.advancedUser || userData.is_staff || false,
            readComment: true,
            addComment: !!userData.username,
            likeMedia: !!userData.username,
            dislikeMedia: !!userData.username,
            watchMedia: true,
            deleteComment: userData.is_manager || userData.is_editor || userData.is_staff || false,
            editProfile: !!userData.username,
            deleteProfile: userData.is_manager || userData.is_staff || false,
            manageMedia: userData.is_editor || userData.is_manager || userData.is_staff || false,
            manageUsers: userData.is_manager || userData.is_staff || false,
            manageComments: userData.is_editor || userData.is_manager || userData.is_staff || false,
            contactUser: false,
          },
          pages: {
            about: userData.url ? `${userData.url}/about` : '/profile/about',
            media: userData.url || '/profile/media',
            playlists: userData.url ? `${userData.url}/playlists` : '/profile/playlists',
          },
        };

        return this.userData;
      } else if (response.status === 401 || response.status === 403) {
        // User not authenticated
        console.log('🔒 User not authenticated, using anonymous config');
        this.userData = {
          name: null,
          username: null,
          thumbnail: null,
          is: {
            admin: false,
            anonymous: true,
            advancedUser: false,
          },
          can: {
            addMedia: false,
            editMedia: false,
            deleteMedia: false,
            editSubtitle: false,
            readComment: true,
            addComment: false,
            likeMedia: false,
            dislikeMedia: false,
            watchMedia: true,
            deleteComment: false,
            editProfile: false,
            deleteProfile: false,
            manageMedia: false,
            manageUsers: false,
            manageComments: false,
            contactUser: false,
          },
          pages: {
            about: '/profile/about',
            media: '/profile/media',
            playlists: '/profile/playlists',
          },
        };
        return this.userData;
      } else {
        throw new Error(`API request failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('❌ Failed to fetch user data from API:', error.message);

      // Fallback to window.MediaCMS config or default
      this.userData = window.MediaCMS?.user || {
        name: 'Development User',
        username: 'devuser',
        thumbnail: null,
        is: {
          admin: true,
          anonymous: false,
          advancedUser: true,
        },
        can: {
          addMedia: true,
          editMedia: true,
          deleteMedia: true,
          editSubtitle: true,
          readComment: true,
          addComment: true,
          likeMedia: true,
          dislikeMedia: true,
          watchMedia: true,
          deleteComment: true,
          editProfile: true,
          deleteProfile: true,
          manageMedia: true,
          manageUsers: true,
          manageComments: true,
          contactUser: false,
        },
        pages: {
          about: '/profile/about',
          media: '/profile/media',
          playlists: '/profile/playlists',
        },
      };
      return this.userData;
    } finally {
      this.loading = false;
    }
  }

  getUserData() {
    return this.userData;
  }

  clearUserData() {
    this.userData = null;
  }

  async signOut() {
    try {
      const response = await fetch('http://localhost/accounts/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken(),
        }
      });

      if (response.ok) {
        console.log('✅ Successfully signed out');
        this.clearUserData();
        // Redirect to home page or login page
        window.location.href = 'http://localhost/';
        return true;
      } else {
        console.error('❌ Signout failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Signout error:', error);
      return false;
    }
  }

  getCSRFToken() {
    // Get CSRF token from cookie
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
}

// Create singleton instance
const userAPI = new UserAPI();

export default userAPI;