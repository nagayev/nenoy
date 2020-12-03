import React from "react";
import { Post } from "./Post";

interface PostsProps {
  posts: any[];
  setPosts: Function;
  postType: number;
}

function Posts(props: PostsProps) {
  const { posts, setPosts } = props; //React.useState([]);
  React.useEffect(() => {
    const opts = {
      method: "POST",
      body: props.postType.toString(),
    };
    fetch("api/getPosts", opts)
      .then((data) => data.json())
      .then((data) => setPosts(data));
  }, [props.postType]);
  return (
    <div className="posts">
      {posts.map((post, index) => {
        return <Post key={index} data={post} />;
      })}
    </div>
  );
}

export default Posts;
