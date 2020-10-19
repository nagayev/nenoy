import React, { useEffect } from "react";
import {
  GeolocationControl,
  Map,
  Placemark,
  YMaps,
  ZoomControl,
} from "react-yandex-maps";
import AddInfoModal from "./AddInfoModal"
import {InfoFromDBModal} from "./Modals";

interface NormalMapInterface{
    mapCenter:Array<number>
}

function MapUnvailble() {
  const LINE_ONE = "К сожалению, карта недоступна.";
  const LINE_TWO = "Похоже Вы не предоставили доступ к местоположению";
  const ZOPA_COORDS = [0.1, 0.1];
  const clickOnMap = () => alert(`${LINE_ONE}\n${LINE_TWO}`);
  //TODO: add support for mouseMove event (stub with preventing mouseMove)
  return (
    <YMaps id="map">
      <Map onClick={clickOnMap} defaultState={{ center: ZOPA_COORDS, zoom: 8 }}>
        <Placemark key={0} geometry={ZOPA_COORDS} onClick={clickOnMap} />
      </Map>
    </YMaps>
  );
}
function NormalMap(props:NormalMapInterface){
  const [placemarksCoords, setPlacemarksCoords] = React.useState([props.mapCenter]); //for all placemarks on map
  const [placemarkModalIsOpen, setPlacemarkModalIsOpen] = React.useState(false);
  const [DBInfoIsOpen,setDBInfoIsOpen] = React.useState(false); 
  const [DBInfoCoords,setDBInfoCoords] = React.useState([]);
  const [lock, setLock] = React.useState(false); //for only one user's placemark on map
  const [userPlacemark,setUserPlacemark] = React.useState([]); //for user placemark
  const deleteUserPlacemark = () => {
    setUserPlacemark([]);
    placemarksCoords.pop(); //delete last placemark, it's user's placemark
  }

  useEffect(() => {
    fetch("api/getPlacemarks") //load placemarks' coords
      .then((data) => data.json())
      .then((data)=>setPlacemarksCoords(data))
  }, []);
  const Placemarks: any[] = [];
  //TODO: rename function
  const f = (coords) => {
    setDBInfoIsOpen(true);
    setDBInfoCoords(coords)
  }
  for (let i = 0; i < placemarksCoords.length; i++) {
    const coords = placemarksCoords[i];
    //different onClick for different types of placemarks
    //NOTE: don't try to refactor userPlacemark.length!==0 to !Object.is(up,[])
    if(userPlacemark.length!==0 && i===placemarksCoords.length-1){
      Placemarks.push(<Placemark key={i} geometry={coords} 
        onClick={() => setPlacemarkModalIsOpen(true)}/>);
    }
    else{
      Placemarks.push(<Placemark key={i} geometry={coords} 
        onClick={() => f(coords)}/>);
    }
  }
  const clickOnMap = (event: any) => {
    //NOTE: type of event is any
    const coords = event._sourceEvent.originalEvent.coords; //get coords where user clicked
    if (!lock) {
      setPlacemarksCoords(placemarksCoords.concat([coords])); //add placemark to screen
      setUserPlacemark(coords);
      setLock(true);
    } else {
      alert("Пожалуйста, добавьте информацию о предыдущем объекте");
    }
  };
  return (
    <>
      <YMaps id="map">
        <Map onClick={clickOnMap} defaultState={{ center: props.mapCenter, zoom: 8 }}>
          <GeolocationControl />
          <ZoomControl />
          {Placemarks}
          <AddInfoModal isOpen={placemarkModalIsOpen}
           setIsOpen={setPlacemarkModalIsOpen} userPlacemark={userPlacemark} deleteUserPlacemark={deleteUserPlacemark}/>
          {DBInfoCoords!==[] && 
          <InfoFromDBModal 
          modalIsOpen={DBInfoIsOpen} setIsOpen={setDBInfoIsOpen} modalCoords={DBInfoCoords} /> }
        </Map>
      </YMaps>
    </>
  );
}
function MapProvider(){
    const [geoError, setGeoError] = React.useState(false);
    const [mapCenter, setMapCenter] = React.useState([0.1, 0.1]); 
    const opts = {
        enableHighAccuracy: true,
        timeout: 1e4,
        maximumAge: 0,
    };
    function suc(pos) {
        console.log(`Got coords: ${pos.coords.latitude}, ${pos.coords.longitude}`);
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
    }
    function err(err) {
        console.warn(`Can\'t get geolocation:${err.message}(${err.code})`);
        setGeoError(true);
    }
    useEffect(() => {
        console.log("Request user geolocation");
        navigator.geolocation.getCurrentPosition(suc, err, opts);
    },[]);
    if (geoError) {
        return <MapUnvailble />;
    }
    return <NormalMap mapCenter={mapCenter} />
}
export default MapProvider;
