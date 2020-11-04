import React from "react";

type CommentaryType = {ranking:number,user:string,text:string};

function Commentary(props:{data:CommentaryType}){
    //const data = {props};
    let color = props.data.ranking>0?"green":"red";
    if (props.data.ranking===0) color = "black";
    const sign = props.data.ranking>0?"+":"";
    return (
        <div>
            <div style={{display:'inline-flex'}}>
            <p>{props.data.user}&nbsp;</p> 
            <p style={{color:color}}>{sign}{props.data.ranking}</p>
            </div>
            <p>{props.data.text}</p>   
        </div>
    );
}
function Commentaries(props:{data:CommentaryType[]}){
    const commentaries = props.data.map((v,i)=>{
        return <Commentary data={v} key={i} />
    });
    return (
        <>
        <h2>Комментарии ({props.data.length})</h2> 
        {commentaries}
        </>
    );
}
export default Commentaries;