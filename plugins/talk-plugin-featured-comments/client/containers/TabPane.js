import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {compose, gql} from 'react-apollo';
import TabPane from '../components/TabPane';
import {withFragments} from 'plugin-api/beta/client/hocs';
import {setActiveTab} from 'plugin-api/beta/client/actions/stream';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({
    setActiveTab,
  }, dispatch);

const enhance = compose(
  connect(null, mapDispatchToProps),
  withFragments({
    asset: gql`
      fragment TalkFeatured_TabPane_asset on Asset {
        id
        featuredComments: comments(tags: ["FEATURED"], deep: true) {
              nodes {
                  id
                  body
                  created_at
                  replyCount
                  tags {
                    tag {
                      name
                    }
                  }
                  action_summaries {
                    ... on LikeActionSummary {
                      count
                      current_user {
                        id
                      }
                    }
                  }
                  user {
                    id
                    username
                  }
              }
          }
      }`,
  }),
);

export default enhance(TabPane);
