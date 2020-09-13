import React, { useEffect } from "react";
import {
  GeolocationControl,
  Map,
  Placemark,
  YMaps,
  ZoomControl,
} from "react-yandex-maps";
//import {AddPlacemarkModal} from "./Modal"

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
  const [mapCoords, setMapCoords] = React.useState([0.1, 0.1]);
  const [placemarksCoords, setPlacemarksCoords] = React.useState([mapCoords]);
  //const [placemarkModalIsOpen, setPlacemarkModalIsOpen] = React.useState(!true);
  const [lock, setLock] = React.useState(false);
  const [geoError, setGeoError] = React.useState(false);

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
    //alert("Произошла ошибка при получении геоположения(");
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
    //console.log(coords)
    Placemarks.push(
      <Placemark
        key={i}
        geometry={coords}
        //onClick={() => setPlacemarkModalIsOpen(true)}
      />,
    );
  }
  const clickOnMap = (event: any) => {
    //fix typo any
    //console.log(typeof e);
    const coords = event._sourceEvent.originalEvent.coords; //get original coords
    if (!lock) {
      setPlacemarksCoords(placemarksCoords.concat([coords])); //add placemark to screen
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
      {/*<AddPlacemarkModal isOpen={placemarkModalIsOpen} setIsOpen={setPlacemarkModalIsOpen} /> */}
      <YMaps id="map">
        <Map onClick={clickOnMap} defaultState={{ center: mapCoords, zoom: 8 }}>
          <GeolocationControl />
          <ZoomControl />
          {Placemarks}
        </Map>
      </YMaps>
    </>
  );
}
export default MapProvider;
