import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import gismap from "./2gismap"

const MyMapComponent = withScriptjs(withGoogleMap((props:any) =>
  <GoogleMap
    defaultZoom={8}
    defaultCenter={{ lat: -34.397, lng: 150.644 }}
  >
    {props.isMarkerShown && <Marker position={{ lat: -34.397, lng: 150.644 }} />}
  </GoogleMap>
))

/*
function MapProvider(){
    return (
        <MyMapComponent
        isMarkerShown={true}
        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    );
} */

function MapProvider(){
    return gismap;
   
}
export default MapProvider;