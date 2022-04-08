import { CardSizeEnum } from "../components/Card";
import { getVideoData, YoutubeVideo } from "./youtube";
import { YoutubeEndpoint } from "./youtube";
import getClient from "./ssrGraphQlClient";
import { gql } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import { LikeDislikeState } from "./types";
import sectionsJson from "../data/sections.json";
// import fs from "fs";

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
  id?: string;
  query?: string;
  endpoint: YoutubeEndpoint;
  cardSize: CardSizeEnum;
};

const getGraphQlData = async (context: GetServerSidePropsContext) => {
  const ssrGraphQlClient = getClient(context);
  try {
    const { data } = await ssrGraphQlClient.query({
      query: gql`
        query StatsQueryNew($input: StatsQueryInput) {
          stats(input: $input) {
            id
            watched
            likeDislike
            videoId
          }
        }
      `,
      variables: {
        input: {
          watched: true,
          // likeDislike: ["LIKE", "NONE"],
        },
      },
    });
    return data.stats as Array<{
      id: string;
      watched: boolean;
      likeDislike: LikeDislikeState;
      videoId: string;
    }>;
  } catch (error) {
    console.error(
      "There was an error in sections.ts/getGraphQlData",
      (error as Error).message
    );
    return [] as Array<{
      id: string;
      watched: boolean;
      likeDislike: LikeDislikeState;
      videoId: string;
    }>;
  }
};

export const getSections = async (context: GetServerSidePropsContext) => {
  if (process.env.DEVELOPMENT) {
    console.log("IN DEVELOPMENT: Returning sections from sections.json");
    return sectionsJson as Section[];
  }

  const sectionQueries: SectionQuery[] = [];
  const graphQlData = await getGraphQlData(context);
  if (graphQlData && graphQlData.length > 0) {
    const videoIds = graphQlData.map((x) => x.videoId);
    sectionQueries.push({
      title: "Watch it Again",
      endpoint: YoutubeEndpoint.byVideoIds,
      cardSize: CardSizeEnum.small,
      id: videoIds.join(`%2C`),
    });
  }

  [
    {
      title: "Disney",
      query: "disney trailer official",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.large,
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
      cardSize: CardSizeEnum.medium,
    },
    {
      title: "Popular Videos",
      endpoint: YoutubeEndpoint.popular,
      cardSize: CardSizeEnum.large,
    },
  ].forEach((q) => sectionQueries.push(q));

  try {
    const sections = await Promise.all(
      sectionQueries.map(async ({ query, endpoint, title, cardSize, id }) => {
        console.log({ query, endpoint, title, cardSize, id });
        return new Promise((resolve) => {
          getVideoData({ endpoint, query, id })
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

    // fs.writeFile(
    //   "./my-sections.json",
    //   JSON.stringify(sections),
    //   "utf8",
    //   (err) => {
    //     console.log({ err });
    //   }
    // );

    return sections as Section[];
  } catch (error) {
    console.error(
      "There was an error in getSections: ",
      (error as Error).message
    );
    throw error;
  }
};
