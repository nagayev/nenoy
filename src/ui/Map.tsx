import React, { useEffect } from "react";
import {
  GeolocationControl,
  Map,
  Placemark,
  YMaps,
  ZoomControl,
} from "react-yandex-maps";
import {AddPlacemarkModal} from "./Modal"

function MapUnvailble() {
  const LINE_ONE = "К сожалению, карта недоступна.";
  const LINE_TWO = "Возможно Вы не предоставили доступ к местоположению";
  const ZOPA_COORDS = [0.1, 0.1];
  const clickOnMap = () => alert(`${LINE_ONE}\n${LINE_TWO}`);
  return (
    <YMaps id="map">
      <Map onClick={clickOnMap} defaultState={{ center: ZOPA_COORDS, zoom: 8 }}>
        <Placemark key={0} geometry={ZOPA_COORDS} onClick={clickOnMap} />
      </Map>
    </YMaps>
  );
}
function MapProvider() {
  //FIXME: delete debug and dead code
  const [mapCoords, setMapCoords] = React.useState([0.1, 0.1]); //center of map
  const [placemarksCoords, setPlacemarksCoords] = React.useState([mapCoords]);
  const [placemarkModalIsOpen, setPlacemarkModalIsOpen] = React.useState(false);
  const [lock, setLock] = React.useState(false); //for only one user's placemark on map
  const [geoError, setGeoError] = React.useState(false); //for Geolocation error
  
  let userPlacemark=[];

  const opts = {
    enableHighAccuracy: true,
    timeout: 1e4,
    maximumAge: 0,
  };
  function suc(pos) {
    console.log(`Got coords: ${pos.coords.latitude}, ${pos.coords.longitude}`);
    setMapCoords([pos.coords.latitude, pos.coords.longitude]);
  }
  function err(err) {
    console.warn(`Can\'t get geolocation:${err.message}(${err.code})`);
    setGeoError(true);
  }

  useEffect(() => {
    console.log("Request user geolocation");
    navigator.geolocation.getCurrentPosition(suc, err, opts);
  }, []);
  useEffect(() => {
    //load coords
    fetch("placemarks.json")
      .then((data) => data.json())
      .then((data) => setPlacemarksCoords(data));
  }, []);
  const Placemarks: any[] = [];
  for (let i = 0; i < placemarksCoords.length; i++) {
    const coords = placemarksCoords[i];
    Placemarks.push(
      <Placemark
        key={i}
        geometry={coords}
        onClick={() => setPlacemarkModalIsOpen(true)}
      />,
    );
  }
  const clickOnMap = (event: any) => {
    //NOTE: type of event is any
    const coords = event._sourceEvent.originalEvent.coords; //get original coords
    if (!lock) {
      setPlacemarksCoords(placemarksCoords.concat([coords])); //add placemark to screen
      userPlacemark=coords;
      setLock(true);
    } else {
      alert("Пожалуйста, добавьте информацию о предыдущем объекте");
    }
  };
  if (geoError) {
    return <MapUnvailble />;
  }
  return (
    <>
      <YMaps id="map">
        <Map onClick={clickOnMap} defaultState={{ center: mapCoords, zoom: 8 }}>
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
export default MapProvider;
