import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Head from "next/head";
import React from "react";
import CardsSection from "../../components/CardsSection";
import Loader from "../../components/Loader";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import styles from "../../styles/MyList.module.css";
import { getMyListSections, Section } from "../../lib/sections";

type MyListProps = {
  sections: Section[];
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<MyListProps>> => {
  const sections = await getMyListSections(context);
  console.log("MYLIST: Have sections: ", { sections });

  return { props: { sections } };
};

const MyList: NextPage<MyListProps> = (props: MyListProps) => {
  const { sections } = props;
  const { user, loading: loadingUser, signIn } = useAuth();

  return (
    <div>
      <Head>
        <title>My List</title>
      </Head>
      <Navbar gradientBackground={false} />
      {loadingUser ? (
        <Loader />
      ) : (
        <main className={styles.main}>
          {user ? (
            <div className={styles.sectionWrapper}>
              {sections.length > 0 &&
                sections.map((section: Section, index: number) => {
                  if (section.error) {
                    console.warn(
                      `Error in index.tsx, rendering section: ${section.title}`,
                      section.error
                    );
                    return false;
                  }
                  return (
                    <CardsSection
                      key={index}
                      title={section.title}
                      cardSize={section.cardSize}
                      videoList={section.list}
                      wrap={true}
                    />
                  );
                })}
            </div>
          ) : (
            <div className={styles.notLoggedInWrapper}>
              <div className={styles.notLoggedIn}>
                <div className={styles.notLoggedInBody}>
                  <p>Please sign in to view your list</p>
                  <div className={styles.buttonWrapper}>
                    <button className={styles.button} onClick={signIn}>
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default MyList;
