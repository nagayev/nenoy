import React, { useEffect } from "react";
import {
  GeolocationControl,
  Map,
  Placemark,
  YMaps,
  ZoomControl,
} from "react-yandex-maps";
import {AddPlacemarkModal} from "./Modal"

interface NormalMapInterface{
    mapCenter:Array<number>
}
/*
Новая версия карт - теперь есть MapProvider (base), NormalMap и MapUnvailable
Normal map это старый map без определения местоположения и недоступности карты (это в MapProvider)
*/
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
function NormalMap(props:NormalMapInterface) {
  const [placemarksCoords, setPlacemarksCoords] = React.useState([props.mapCenter]); //for all placemarks on map
  const [placemarkModalIsOpen, setPlacemarkModalIsOpen] = React.useState(false);
  const [lock, setLock] = React.useState(false); //for only one user's placemark on map
  const [userPlacemark,setUserPlacemark] = React.useState([]); //for user placemark
  
  useEffect(() => {
    fetch("api/getPlacemarks") //load placemarks' coords
      .then((data) => data.json())
      .then((data)=>setPlacemarksCoords(data))
  }, []);
  const Placemarks: any[] = [];
  for (let i = 0; i < placemarksCoords.length; i++) {
    const coords = placemarksCoords[i];
    Placemarks.push(
      <Placemark key={i} geometry={coords} onClick={() => setPlacemarkModalIsOpen(true)} />,
    );
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
          <AddPlacemarkModal isOpen={placemarkModalIsOpen}
           setIsOpen={setPlacemarkModalIsOpen} userPlacemark={userPlacemark} />
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
