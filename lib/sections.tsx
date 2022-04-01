import { CardSizeEnum } from "../components/card";
import { getVideoData, YoutubeVideo } from "./youtube";
import { YoutubeEndpoint } from "./youtube";

export type Section = {
  title: string;
  cardSize: CardSizeEnum;
  list: YoutubeVideo[];
  error: {
    code: number;
    message: string;
    domain: string;
    reason: string;
  };
};

type SectionQuery = {
  title: string;
  query?: string;
  endpoint: YoutubeEndpoint;
  cardSize: CardSizeEnum;
};

export const getSections = async () => {
  const sectionQueries: SectionQuery[] = [
    {
      title: "Disney",
      query: "disney trailer official",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.small,
    },
    {
      title: "Programming",
      query: "programming",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.small,
    },
    {
      title: "Music Production",
      query: "music production",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.small,
    },
    {
      title: "Popular Videos",
      endpoint: YoutubeEndpoint.popular,
      cardSize: CardSizeEnum.small,
    },
  ];

  try {
    const sections = await Promise.all(
      sectionQueries.map(async ({ query, endpoint, title, cardSize }) => {
        return new Promise((resolve) => {
          getVideoData({ endpoint, query })
            .then((list) => {
              resolve({ title, cardSize, list });
            })
            .catch((error) => {
              resolve({
                title,
                cardSize,
                list: [],
                error: {
                  code: error?.code || null,
                  message: (error as Error).message,
                  reason: error?.reason || null,
                },
              });
            });
        });
      })
    );

    return sections as Section[];
  } catch (error) {
    console.error(
      "There was an error in getSections: ",
      (error as Error).message
    );
    throw error;
  }
};
