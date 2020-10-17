import React from "react";
import { Post } from "./Post";
import {getPosts} from '../db';


interface PostData {
  date: number;
  header: string;
  content: string;
}
interface PostsProps {
  number: number; 
}

const Posts: any = (props: PostsProps) => {
  const [posts,setPosts] = React.useState([]);
  React.useEffect(()=>{
    getPosts(1).then(data=>setPosts(data));
  },[])

  return (
    <div className="posts">
      {posts.map((post, index) => {
        return <Post key={index} data={post} />;
      })}
    </div>
  );
};
export default Posts;
