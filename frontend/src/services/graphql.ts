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
  query getVideo($id: String) {
    video(id: $id) {
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

export const UpdateViewVideo = `
mutation updateVideoView($id: ID) {
  updateVideoView(id: $id) {
    _id
    views
  }
}
`;
