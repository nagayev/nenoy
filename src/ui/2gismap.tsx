import React from "react"
import { useEffect } from "react";

var DG = require('2gis-maps');
function gisMap():JSX.Element{
    function componentDidMount(){
        var map = DG.map('map', {
            'center': [54.98, 82.89],
            'zoom': 13
        });
        debugger;
        console.log(map);    
    }
    useEffect(componentDidMount,[]);
    return (
        <>
        <div id="map" style={{width:'200px',height:'200px'}}>
            &nbsp;
        </div>
        </>
    );
}
export default gisMap;