import React from "react";
import { useState, useEffect } from 'react';
import {Post} from "./Post"

interface PostData {
  date:number,
  header:string,
  content:string
}
interface PostsInterface {
  postType:number
}

const fetchSinglePost = async (postUrl: string):Promise<PostData> => {
  const response = await fetch(postUrl);
  return (await response.json()) as PostData;
};
const getListOfPosts = async(): Promise<any> =>
await fetchSinglePost('posts.json');

const loadPosts = async (postUrls:string[]): Promise<any> => 
await Promise.all(postUrls.map((postUrl) => fetchSinglePost(postUrl)));

const Posts: any = (props:PostsInterface) => {
    const [postUrls,setURLs] = useState([]);
    const [posts, setPosts] = useState([]);
    useEffect(() => {
      getListOfPosts().then((list)=> setURLs(list));
      loadPosts(postUrls).then((posts) => setPosts(posts));
    }, []);
  
    return (
      <div className="App">
        {posts.map((post, index) => {
          //if(Math.random()>0.51) console.log(post);
          //FIXME:
          const n = Math.round(Math.random()*5)
          //import(`./1234${n}`)
          return <Post key={index} data={post} />
      })}
      </div>
    );
};
export default Posts;