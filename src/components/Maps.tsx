import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { get } from '../helpers/api_helper';
import L from 'leaflet';
import Pusher from 'pusher-js';
import '../index.css'
const positions = [19.11442400000, 72.8679400003]
const Maps = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [activePis, setActivePis] = useState([]);
  useEffect(() => {
    fetchVenues()
  }, []);


  const fetchVenues = async () => {
    try {
      const response = await get("rpi/respData", {}); // Wa

      if (response.length > 0) {
        let pos: any = [];
        response.map((item: any) => {
          if (item['lng'] && item['lat'] && item['venue_id']) {

            const lat = parseFloat(item['lat']);
            const lng = parseFloat(item['lng']);
            var type: Number = 0;
            if (!isNaN(lat) && !isNaN(lng) && item['venue_id']) {
              pos.push([item['venue'], lat, lng, item['venue_id'], type]);
            } else {
              console.error('Invalid latitude or longitude:', item);
            }
          }
        });
        setPositions(pos);
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    availablePis()
  }, [positions]);

  useEffect(() => {
    markerChange();
  }, [activePis]);

  const availablePis = () => {
    var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });
    // Subscribe to a channel and log incoming events
    var channel = pusher.subscribe('pi_cast');
    var activeVenues: any = [];
    channel.bind_global(function (eventName: String, data: any) {
      if (data.message) {
        if (activeVenues && !activeVenues.includes(data.message.venue_id)) {
          activeVenues.push(data.message.venue_id)
          setActivePis(activeVenues);

        }
      }
    })
  }

  const markerChange = () => {
    if (positions.length > 0) {

      const updatedPositions = positions.map((item: any) => {
        if (activePis.includes(item[3])) {
          return { ...item, 4: 1 };
        }
        return item;
      });

      setPositions(updatedPositions);

    } else {
      console.log('positions is set to zero')
    }
  }

  const redIcon = new L.Icon({
    iconUrl: '../images/error/red_marker.png',
  });

  const greenIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <>
      {/* <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-7"> */}
      <div className="leaflet-control-attribution dark:filter dark:invert dark:hue-rotate-180 dark:brightness-95 dark:contrast-90">
        <MapContainer center={[19.0760, 72.8777]} zoom={12} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {positions && positions.map((item, index) => {
            const markerIcon = item[4] == 1 ? redIcon : greenIcon;
            return (
              // <Marker key={index} position={[item[1], item[2]]} >
              <Marker key={index} position={[item[1], item[2]]} icon={markerIcon} >
                <Popup>
                  {item[0]}
                </Popup>
                <Tooltip>{item[0]}</Tooltip>
              </Marker>)
          })}
        </MapContainer>
      </div>
      {/* </div> */}
    </>
  );
};

export default Maps;

