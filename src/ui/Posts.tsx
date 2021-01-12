import React from "react";
import { Post } from "./Post";

interface PostsProps {
  posts: any[];
  setPosts: Function;
  postType: number;
}

function Posts(props: PostsProps) {
  const { posts, setPosts } = props;
  const [page, setPage] = React.useState(1);
  React.useEffect(() => {
    const sendData = {
      type: props.postType,
      page,
    };
    const opts = {
      method: "POST",
      body: JSON.stringify(sendData),
    };
    fetch("api/getPosts", opts)
      .then((data) => data.json())
      .then((data) => setPosts(data));
  }, [props.postType, page]);
  function safetySetPage(page: number, direction: number) {
    if (page === 1 && direction === -1) return;
    else if (posts.length < 3 && direction === 1) return;
    setPage(page + direction);
  }
  const back = () => safetySetPage(page, -1);
  const forward = () => safetySetPage(page, 1);
  return (
    <div className="posts">
      {posts.map((post, index) => {
        return <Post key={index} data={post} />;
      })}
      <div>
        <span>Страница: {page}</span>
        <div>
          <button onClick={back}>&lt;</button>
          <button onClick={forward}>&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default Posts;
