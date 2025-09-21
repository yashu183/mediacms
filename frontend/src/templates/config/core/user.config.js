// Dynamic user configuration that fetches from API
const axios = require('axios');

// Fallback static config for development
let staticConfig = {
  name: process.env.MEDIACMS_USER_NAME || 'Anonymous',
  username: process.env.MEDIACMS_USER_USERNAME || null,
  thumbnail: process.env.MEDIACMS_USER_THUMB || null,
  is: {
    admin: 'true' === process.env.MEDIACMS_USER_IS_ADMIN,
    anonymous: 'true' === process.env.MEDIACMS_USER_IS_ANONYMOUS,
    advancedUser: 'true' === process.env.MEDIACMS_USER_IS_ADVANCED,
  },
  can: {
    addMedia: true,
    editMedia: true,
    deleteMedia: true,
    editSubtitle: true,
    readComment: true,
    addComment: true,
    deleteComment: true,
    editProfile: true,
    deleteProfile: true,
    manageMedia: true,
    manageUsers: true,
    manageComments: true,
    contactUser: false,
  },
  pages: {
    about: './profile-about.html',
    media: './profile-media.html',
    playlists: './profile-playlists.html',
  },
};

// For development with backend API integration
if (process.env.NODE_ENV === 'development' && process.env.MEDIACMS_USE_API === 'true') {
  try {
    // This will be used by frontend to dynamically fetch user data
    staticConfig._fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.MEDIACMS_API}/whoami`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
          }
        });

        const userData = response.data;

        return {
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
            about: userData.url ? `${userData.url}/about` : './profile-about.html',
            media: userData.url || './profile-media.html',
            playlists: userData.url ? `${userData.url}/playlists` : './profile-playlists.html',
          },
        };
      } catch (error) {
        console.warn('Failed to fetch user data from API, using static config:', error.message);
        return staticConfig;
      }
    };
  } catch (error) {
    console.warn('API integration setup failed:', error.message);
  }
}

module.exports = staticConfig;