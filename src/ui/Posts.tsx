import React from "react";

import { Post } from "./Post";

//FIXME: fix the first useEffect

type postType = 0|1|2
interface PostData {
  date: postType;
  header: string;
  content: string;
}

const fetchSinglePost = async (postUrl: string): Promise<PostData> => {
  const response = await fetch(postUrl);
  return (await response.json()) as PostData;
};

const getListOfPosts = async (type:postType): Promise<any> =>
  await fetchSinglePost(`1/posts.json`);

const loadPosts = async (postUrls: string[],type:postType): Promise<any> =>
  await Promise.all(postUrls.map((postUrl) => fetchSinglePost(`${type}/${postUrl}`)));

interface PostsProps {
  postType: number; //0 is blog, 1 is ambulances, 2 is zavod
}

const Posts: any = (props:PostsProps) => {
  const [postUrls, setPostUrls] = React.useState([]);
  const [posts, setPosts] = React.useState([]);

  React.useEffect(() => {
    console.warn(props.postType)
    getListOfPosts(props.postType as postType).then((list) => setPostUrls(list));
    console.error(postUrls)
  },[props.postType]);

  React.useEffect(() => {
    if (postUrls.length) {
      loadPosts(postUrls,props.postType as postType).then((loadedPosts) => setPosts(loadedPosts));
    }
  }, [postUrls]);

  return (
    <div className="posts">
      {posts.map((post, index) => {
        return <Post key={index} data={post} />;
      })}
    </div>
  );
};
export default Posts;
