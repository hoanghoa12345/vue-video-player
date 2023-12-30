export const createVideoMutation = /* GraphQL */ `
  mutation createVideo($videoInput: VideoInput) {
    createVideo(video: $videoInput) {
      _id
      title
      description
      uploadedBy {
        _id
      }
      filePath
      duration
      privacy
      thumbnail
      createdAt
      category {
        _id
      }
      views
    }
  }
`;
export const AllVideos = /* GraphQL */ `
  query AllVideos {
    videos {
      _id
      title
      description
      uploadedBy {
        _id
        name
      }
      filePath
      duration
      thumbnail
      createdAt
      views
    }
  }
`;
export const VideosRelated = /* GraphQL */ `
  query VideosRelated($id: String) {
    videosRelated(id: $id) {
      _id
      title
      description
      uploadedBy {
        _id
        name
      }
      filePath
      duration
      thumbnail
      createdAt
      views
    }
  }
`;
export const GetVideo = /* GraphQL */ `
  query getVideo($id: String, $userId: String) {
    video(id: $id, userId: $userId) {
      _id
      title
      description
      uploadedBy {
        _id
        name
      }
      filePath
      duration
      thumbnail
      createdAt
      views
      comments {
        _id
        body
        createdAt
        user {
          _id
          name
        }
        replies {
          _id
          body
          user {
            _id
            name
          }
          createdAt
        }
      }
      likes {
        user {
          _id
        }
      }
      isLike
    }
  }
`;

export const UpdateViewVideo = /* GraphQL */ `
  mutation updateVideoView($id: ID) {
    updateVideoView(id: $id) {
      _id
      views
    }
  }
`;

export const UpdateVideo = /* GraphQL */ `
  mutation updateVideo($id: ID!, $video: VideoInput!) {
    updateVideo(id: $id, video: $video) {
      _id
      title
      description
      uploadedBy {
        _id
      }
      filePath
      duration
      privacy
      thumbnail
      createdAt
      category {
        _id
      }
      views
    }
  }
`;

export const CreateComment = /* GraphQL */ `
  mutation createComment($videoId: ID!, $comment: String!) {
    createComment(comment: $comment, videoId: $videoId) {
      _id
    }
  }
`;

export const ReplyComment = /* GraphQL */ `
  mutation MyMutation($commentId: ID!, $reply: String!, $videoId: ID!) {
    replyComment(commentId: $commentId, reply: $reply, videoId: $videoId) {
      _id
    }
  }
`;

export const LikeVideo = /* GraphQL */ `
  mutation likeVideo($videoId: ID!) {
    likeVideo(videoId: $videoId) {
      _id
    }
  }
`;
