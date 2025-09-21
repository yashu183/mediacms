import React, { useState, useEffect } from 'react';
import { ApiUrlConsumer, LinksConsumer, MemberConsumer } from '../utils/contexts/';
import { PageStore } from '../utils/stores/';
import { MediaListRow } from '../components/MediaListRow';
import { MediaMultiListWrapper } from '../components/MediaMultiListWrapper';
import { ItemListAsync } from '../components/item-list/ItemListAsync.jsx';
import { InlineSliderItemListAsync } from '../components/item-list/InlineSliderItemListAsync.jsx';
import { Page } from './Page';
import { translateString } from '../utils/helpers/';
import userAPI from '../utils/api/userApi.js';

const EmptyMedia: React.FC = ({}) => {
  const [realUser, setRealUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealUserData = async () => {
      try {
        const userData = await userAPI.fetchUserData();
      } catch (error) {
        console.error('❌ Failed to fetch real user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealUserData();
  }, []);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  return (
    <LinksConsumer>
      {(links) => (
        <MemberConsumer>
          {(staticUser) => {
            // Use real user data if available, otherwise fall back to static config
            const user = realUser || staticUser;

            return (
            <div className="empty-media">
              <div className="welcome-title">Welcome to YashuFlix {user.name ? `, ${user.name}` : ''}!</div>
                {!user.is.anonymous && (user.is.advancedUser || user.is.admin) ? (
                <div className="start-uploading">Start uploading media and sharing your work!</div>
                ) : (
                <div className="start-uploading">Admin yet to upload the videos. Sit tight until then!</div>
                )}
                
              {!user.is.anonymous && user.can.addMedia && (user.is.advancedUser || user.is.admin) && (
                <a href={links.user.addMedia} title="Upload media" className="button-link">
                  <i className="material-icons" data-icon="video_call"></i>UPLOAD MEDIA
                </a>
              )}
            </div>
          )
          }}
        </MemberConsumer>
      )}
    </LinksConsumer>
  );
};

interface HomePageProps {
  id?: string;
  latest_title: string;
  featured_title: string;
  recommended_title: string;
  latest_view_all_link: boolean;
  featured_view_all_link: boolean;
  recommended_view_all_link: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  id = 'home',
  //featured_title = PageStore.get('config-options').pages.home.sections.featured.title,
  //recommended_title = PageStore.get('config-options').pages.home.sections.recommended.title,
  //latest_title = PageStore.get('config-options').pages.home.sections.latest.title,
  featured_title = translateString('Featured'),
  recommended_title = translateString('Recommended'),
  latest_title = translateString('Latest'),
  latest_view_all_link = false,
  featured_view_all_link = true,
  recommended_view_all_link = true,
}) => {
  const [zeroMedia, setZeroMedia] = useState(false);
  const [visibleLatest, setVisibleLatest] = useState(false);
  const [visibleFeatured, setVisibleFeatured] = useState(false);
  const [visibleRecommended, setVisibleRecommended] = useState(false);

  const onLoadLatest = (length: number) => {
    setVisibleLatest(0 < length);
    setZeroMedia(0 === length);
  };

  const onLoadFeatured = (length: number) => {
    setVisibleFeatured(0 < length);
  };

  const onLoadRecommended = (length: number) => {
    setVisibleRecommended(0 < length);
  };

  return (
    <Page id={id}>
      <LinksConsumer>
        {(links) => (
          <ApiUrlConsumer>
            {(apiUrl) => (
              <MediaMultiListWrapper className="items-list-ver">
                {PageStore.get('config-enabled').pages.featured &&
                  PageStore.get('config-enabled').pages.featured.enabled && (
                    <MediaListRow
                      title={featured_title}
                      style={!visibleFeatured ? { display: 'none' } : undefined}
                      viewAllLink={featured_view_all_link ? links.featured : null}
                    >
                      <InlineSliderItemListAsync
                        requestUrl={apiUrl.featured}
                        itemsCountCallback={onLoadFeatured}
                        hideViews={!PageStore.get('config-media-item').displayViews}
                        hideAuthor={!PageStore.get('config-media-item').displayAuthor}
                        hideDate={!PageStore.get('config-media-item').displayPublishDate}
                      />
                    </MediaListRow>
                  )}

                {PageStore.get('config-enabled').pages.recommended &&
                  PageStore.get('config-enabled').pages.recommended.enabled && (
                    <MediaListRow
                      title={recommended_title}
                      style={!visibleRecommended ? { display: 'none' } : undefined}
                      viewAllLink={recommended_view_all_link ? links.recommended : null}
                    >
                      <InlineSliderItemListAsync
                        requestUrl={apiUrl.recommended}
                        itemsCountCallback={onLoadRecommended}
                        hideViews={!PageStore.get('config-media-item').displayViews}
                        hideAuthor={!PageStore.get('config-media-item').displayAuthor}
                        hideDate={!PageStore.get('config-media-item').displayPublishDate}
                      />
                    </MediaListRow>
                  )}

                <MediaListRow
                  title={latest_title}
                  style={!visibleLatest ? { display: 'none' } : undefined}
                  viewAllLink={latest_view_all_link ? links.latest : null}
                >
                  <ItemListAsync
                    pageItems={30}
                    requestUrl={apiUrl.media}
                    itemsCountCallback={onLoadLatest}
                    hideViews={!PageStore.get('config-media-item').displayViews}
                    hideAuthor={!PageStore.get('config-media-item').displayAuthor}
                    hideDate={!PageStore.get('config-media-item').displayPublishDate}
                  />
                </MediaListRow>

                {zeroMedia && <EmptyMedia />}
              </MediaMultiListWrapper>
            )}
          </ApiUrlConsumer>
        )}
      </LinksConsumer>
    </Page>
  );
};
