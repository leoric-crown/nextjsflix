export type YoutubeVideo = {
  title: string;
  imgUrl: string;
  description: string;
  id: string;
  channelTitle: string;
  channelId: string;

  publishTime: string;
  viewCount: number;
};

export enum YoutubeEndpoint {
  search = "https://youtube.googleapis.com/youtube/v3/search?part=snippet",
  popular = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet" +
    "%2CcontentDetails%2Cstatistics&chart=mostPopular",
  byVideoIds = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics",
}

export type QueryParameters = {
  endpoint: YoutubeEndpoint;
  id?: string;
  query?: string;
  maxResults?: number;
  regionCode?: string;
};

const fetchYoutubeVideosData = async (queryParameters: QueryParameters) => {
  try {
    const {
      endpoint,
      query,
      maxResults = 30,
      regionCode = "US",
      id,
    } = queryParameters;
    const { YOUTUBE_DATA_API_KEY } = process.env;

    const getSuffix = (parameters: object) => {
      let suffix = "";
      Object.entries(parameters).forEach(([key, value]) => {
        if (value && key !== "query") {
          suffix += `&${key}=${value}`;
        }
      });
      return suffix;
    };

    const getQueryUrl = ({ endpoint, ...parameters }: QueryParameters) => {
      let queryUrl = endpoint as string;
      switch (endpoint) {
        case YoutubeEndpoint.search:
          Object.entries(parameters).forEach(([key, value]) => {
            if (value) {
              queryUrl += `&${key === "query" ? "q" : key}=${value}`;
            }
          });
          break;
        case YoutubeEndpoint.popular:
          queryUrl = queryUrl + getSuffix(parameters);
          break;
        case YoutubeEndpoint.byVideoIds:
          queryUrl = queryUrl + getSuffix(parameters);
          break;
      }
      return queryUrl;
    };

    const queryUrl = getQueryUrl({
      endpoint,
      query,
      maxResults,
      regionCode,
      id,
    });
    console.log("youtube:tsx || Fetching from: ", queryUrl);
    const response = await fetch(queryUrl + `&key=${YOUTUBE_DATA_API_KEY}`);

    const json = await response.json();

    if (json.error) throw json.error;
    return json;
  } catch (error) {
    console.error(
      "There was an unexpected error in fetchYoutubeVideosData: ",
      (error as Error).message
    );
    throw error;
  }
};

type item = {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { high: { url: string } };
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
  };
};

const getVideoDataFromItems = (items: item[]) => {
  return items
    .map((item) => {
      return {
        title: item?.snippet?.title || null,
        imgUrl: item?.snippet?.thumbnails?.high?.url || null,
        description: item?.snippet?.description || null,
        id: item?.id?.videoId || item?.id || null,
        channelTitle: item?.snippet?.channelTitle || null,
        channelId: item?.snippet?.channelId || null,
        publishTime: item?.snippet?.publishedAt || null,
        viewCount: parseInt(item?.statistics?.viewCount) || null,
      } as YoutubeVideo;
    })
    .filter((item) => {
      return !!item.id && !!item.title && !!item.imgUrl;
    }) as YoutubeVideo[];
};

export const getVideoData = async (queryParameters: QueryParameters) => {
  try {
    const jsonResponse = await fetchYoutubeVideosData(queryParameters);
    const videoData: YoutubeVideo[] = getVideoDataFromItems(
      jsonResponse.items as item[]
    );

    return videoData as YoutubeVideo[];
  } catch (error) {
    console.error(
      "There was an error in getVideoData: ",
      (error as Error).message
    );
    throw error;
  }
};

// const ChannelFilters = [
//     { title: "Pixar", id: "UC_IRYSp4auq7hKLvziWVH6w" },
//     { title: "Walt Disney Animation Studios", id: "UC_976xMxPgzIa290Hqtk-9g" },
//     { title: "Walt Disney Studios", id: "UCuaFvcY4MhZY3U43mMt1dYQ" },
//     { title: "Star Wars", id: "UCZGYJFUizSax-yElQaFDp5Q" },
//     { title: "Marvel Entertainment", id: "UCvC4D8onUfXzvjTOM-dBfEA" },
//   ];
// const filterChannels = (items: any[]) => {
//   return items.filter((item) => {
//     const keep = ChannelFilters.map(
//       (channelFilter) => channelFilter.id
//     ).includes(item?.snippet?.channelId);
//     if (!keep) return keep;
//   });
// };

// export const decodeURIs = (dataArray: any[]) => {
//   const decodedArray = dataArray.map((item) => {
//     const keys = Object.keys(item);
//     const decoded = item;
//     for (let i = 0; i < keys.length; i++) {
//       if (typeof item[keys[i]] === "string") {
//         decoded[keys[i]] = decodeURIComponent(JSON.parse(`"${item[keys[i]]}"`));
//       }
//     }
//     return decoded;
//   });
//   return decodedArray;
// };
