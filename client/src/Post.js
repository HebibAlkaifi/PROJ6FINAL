import React,{useContext,useState,useEffect} from 'react'
import {formatISO9075} from "date-fns";
import {Link} from "react-router-dom"; 
import {UserContext} from "./UserContext";

const Post = ({_id,title,summary,cover,content,createdAt,author}) => {
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);
   
  const username = userInfo?.username;

  return (
        <div className="post">
        <div className="image">
          <Link to={`/post/${_id}`}>
            <div >
            <img src={'http://localhost:4000/'+cover} alt="" width='90%' height='70%'/>
            </div>
          </Link>
        </div>
        <div className="texts">
          <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
          </Link>
          <p className="info"> 
            <span style={{color:"black"}}>
            Posted By:
            </span>

            <span className=" info"  style={{
          color: '#888',
          fontSize:"1rem",
          fontWeight: "bold"}}>
              {author.username}
            </span> 
            <time>
              <span style={{color:"black" ,marginRight:"9px"}}>
              Posted At: 
              </span>
              {formatISO9075(new Date(createdAt))}
            </time>
          </p>
          <p className="summary">{summary}</p>
        </div>
        </div>
  );
}

export default Post
