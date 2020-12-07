import React, { useEffect } from "react";
import {
  GeolocationControl,
  Map,
  Placemark,
  YMaps,
  ZoomControl,
  SearchControl,
} from "react-yandex-maps";
import AddInfoModal from "./AddInfoModal";
import { InfoFromDBModal } from "./Modals";

interface NormalMapInterface {
  mapCenter: Array<number>;
  posts: any[];
  setPosts: Function;
}

function NormalMap(props: NormalMapInterface) {
  const [placemarksCoords, setPlacemarksCoords] = React.useState([
    props.mapCenter,
  ]); //for all placemarks on map
  const [placemarkModalIsOpen, setPlacemarkModalIsOpen] = React.useState(false);
  const [DBInfoIsOpen, setDBInfoIsOpen] = React.useState(false);
  const [DBInfoData, setDBInfoData] = React.useState([]);
  const [lock, setLock] = React.useState(false); //for only one user's placemark on map
  const [userPlacemark, setUserPlacemark] = React.useState([]); //for user placemark
  const deleteUserPlacemark = () => {
    setUserPlacemark([]);
    placemarksCoords.pop(); //delete last placemark, it's user's placemark
  };
  useEffect(() => {
    fetch("api/getPlacemarks") //load placemarks' coords
      .then((data) => data.json())
      .then((data) => setPlacemarksCoords(data))
      .catch((err) => {
        console.error(err);
      });
  }, []);
  const Placemarks: any[] = [];
  //NOTE: we have unused modal
  const getPostsByCoords = (coords) => {
    const opts = {
      method: "POST",
      body: JSON.stringify(coords),
    };
    fetch("api/getPostsByCoords", opts)
      .then((data) => data.json())
      .then((data) => setDBInfoData(data)); //data is array of posts
    setDBInfoIsOpen(true); //TODO: something with modal
    //setDBInfoData(data);
  };
  for (let i = 0; i < placemarksCoords.length; i++) {
    const coords = placemarksCoords[i];
    //different onClick for different types of placemarks
    //NOTE: don't try to refactor userPlacemark.length!==0 to !Object.is(up,[])
    if (userPlacemark.length !== 0 && i === placemarksCoords.length - 1) {
      Placemarks.push(
        <Placemark
          key={i}
          geometry={coords}
          onClick={() => setPlacemarkModalIsOpen(true)}
        />,
      );
    } else {
      Placemarks.push(
        <Placemark
          key={i}
          geometry={coords}
          onClick={() => getPostsByCoords(coords)}
        />,
      );
    }
  }
  type EventType = { _sourceEvent: any }; //TODO: rework
  const clickOnMap = (event: EventType) => {
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
      <YMaps
        //query={{ apikey: "4f8f22c0-8eb6-4572-8dcd-ca1a2a078877" }}
        id="map"
      >
        <Map
          onClick={clickOnMap}
          //defaultState={{ center: MOSCOW, zoom: 8 }}
          state={{ center: props.mapCenter, zoom: 8 }}
          options={{ width: 1000, height: 500 }}
        >
          <GeolocationControl />
          <ZoomControl />
          <SearchControl />
          {Placemarks}
          <AddInfoModal
            isOpen={placemarkModalIsOpen}
            setIsOpen={setPlacemarkModalIsOpen}
            userPlacemark={userPlacemark}
            deleteUserPlacemark={deleteUserPlacemark}
          />
          {DBInfoData !== [] && (
            <InfoFromDBModal
              modalIsOpen={DBInfoIsOpen}
              setIsOpen={setDBInfoIsOpen}
              data={DBInfoData}
              setPosts={props.setPosts}
            />
          )}
        </Map>
      </YMaps>
    </>
  );
}
function MapProvider(props) {
  const MOSCOW = [55.4507, 37.3656];
  const [mapCenter, setMapCenter] = React.useState(MOSCOW);

  const opts = {
    enableHighAccuracy: true,
    timeout: 1e4,
    maximumAge: 0,
  };
  function suc(pos) {
    const coords = [pos.coords.latitude, pos.coords.longitude];
    console.log(`Got coords: ${coords}`);
    //saveToCache(coords);
    setMapCenter(coords);
  }
  function err(err) {
    console.warn(`Can\'t get geolocation:${err.message}(${err.code})`);
    alert("Мы не смогли получить доступ к Вашему местоположению.");
    alert("Пожалуйста, найдите объект вручную.");
  }
  useEffect(() => {
    console.log("Request user geolocation");
    navigator.geolocation.getCurrentPosition(suc, err, opts);
  }, []);
  return (
    <NormalMap
      mapCenter={mapCenter}
      setPosts={props.setPosts}
      posts={props.posts}
    />
  );
}
export default MapProvider;
