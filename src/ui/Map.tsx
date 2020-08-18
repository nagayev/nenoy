import React, { useEffect } from "react";
import { YMaps,Map,Placemark,ZoomControl, GeolocationControl } from 'react-yandex-maps';
import Modal from 'react-modal';

const customStyles = {
  content : {
    color:'black',
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

function MapProvider(){
    const [mapCoords,setMapCoords] = React.useState([55.75, 37.57]);
    const [modalIsOpen,setIsOpen] = React.useState(false);
    const [modalCoords,setModalCoords] = React.useState([55.75, 37.57]);

    let subtitle;
    function openModal(coords) {
        setModalCoords(coords);
        setIsOpen(true);
    }
    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        //subtitle.style.color = '#f00';
    }
    function closeModal(){
        setIsOpen(false);
    }
    var opts = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    function suc(pos){
        console.log(`Got coords: ${pos.coords.latitude}, ${pos.coords.longitude}`);
        setMapCoords([pos.coords.latitude,pos.coords.longitude])
    }
    function err(err){
        console.warn(`Can\'t get geolocation:${err.message}(${err.code})`);
        alert('Произошла ошибка при получении геоположения(');
    }
    
    useEffect(()=>{
        console.log('Request user geolocation');
        navigator.geolocation.getCurrentPosition(suc,err,opts);
    },[]); 
    const testCoords = [mapCoords[0]*0.99,mapCoords[1]*0.99];
    const placemarksCoords = [mapCoords,testCoords];
    const Placemarks = placemarksCoords.map((v)=>{
        return <Placemark geometry={v} onClick={()=>openModal(v)} />
    }); 
    return (
        <>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
                >

                {/*<h2 ref={_subtitle => (subtitle = _subtitle)}>Hello</h2> */}
                <button onClick={closeModal}>close</button>
                <div>Кажется, об этом объекте никто не писал.</div>
                <div>Станьте первым!</div>
    <div>Объект с координатами ({modalCoords[0]});({modalCoords[1]}) </div>
            </Modal>
            <YMaps id="map">
                <Map defaultState={{ center: mapCoords, zoom: 8 }}>
                    <GeolocationControl />
                    <ZoomControl />
                    {Placemarks}
                </Map>
            </YMaps>
        </>
    );
}
export default MapProvider;