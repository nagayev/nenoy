import React from "react";

import { Post } from "./Post";

interface PostData {
  date: number;
  header: string;
  content: string;
}

const fetchSinglePost = async (postUrl: string): Promise<PostData> => {
  const response = await fetch(postUrl);
  return (await response.json()) as PostData;
};

const getListOfPosts = async (): Promise<any> =>
  await fetchSinglePost("posts.json");

const loadPosts = async (postUrls: string[]): Promise<any> =>
  await Promise.all(postUrls.map((postUrl) => fetchSinglePost(postUrl)));

interface PostsProps {
  postType: number;
}

const Posts: React.FunctionComponent<PostsProps> = () => {
  const [postUrls, setPostUrls] = React.useState([]);
  const [posts, setPosts] = React.useState([]);

  React.useEffect(() => {
    getListOfPosts().then((list) => setPostUrls(list));
  }, []);

  React.useEffect(() => {
    if (postUrls.length) {
      loadPosts(postUrls).then((loadedPosts) => setPosts(loadedPosts));
    }
  }, [postUrls]);

  return (
    <div className="App">
      {posts.map((post, index) => {
        return <Post key={index} data={post} />;
      })}
    </div>
  );
};
export default Posts;
