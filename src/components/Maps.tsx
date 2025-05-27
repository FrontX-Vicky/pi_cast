import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { get } from '../helpers/api_helper';
import L from 'leaflet';
import Pusher from 'pusher-js';
import '../index.css'
import React from 'react';
import Notifications from '../notification/Notifications';
const positions = [19.11442400000, 72.8679400003]
class Maps extends React.Component {
  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      color: "lightgreen",
      redIcon: new L.Icon({
        iconUrl: '../images/error/red_marker.png',
      }),
      showNotificatins: 'false',
      notificationMessage: [],
      greenIcon: new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      positions: [],
      activePis: [],
    };
  }

  componentDidMount(): void {
    this.fetchVenues();
      this.availablePis();
  }


  async fetchVenues() {
    console.log('function call')
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
        this.setState({ positions: pos });

      }
    } catch (e) {
      console.log(e)
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // if (prevState.positions !== this.state.positions) {
    //   this.availablePis();
    // }

    if (prevState.activePis !== this.state.activePis) {
      this.markerChange();
    }
  }

  async availablePis() {
    // console.log('function call websocket')
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
    channel.bind_global((eventName: String, data: any) => {
      if (data.message) {
        if (activeVenues && !activeVenues.includes(data.message.venue_id)) {
          activeVenues.push(data.message.venue_id);
          this.setState({ activePis: activeVenues })
        }
      }
    })
  }

  async markerChange() {
    console.log(this.state.positions)
    if (this.state.positions.length > 0) {
      const updatedPositions = this.state.positions.map((item: any) => {
        if (this.state.activePis.includes(item[3])) {
          if (item[4] != 1) {
            this.setState({ showNotificatins: 'true' });
            this.setState({
              notificationMessage : [
                'New TRATOM came online',
                item[0]
              ]
            });
            // this.setState({ venue: item[0] });
            // console.log(this.state.notificationMessage)
          }
          // this.setState({showNotificatins:  'false'});

          return { ...item, 4: 1 };
        }
        return item;
      });

      this.setState({ positions: updatedPositions });

    } else {
      console.log('positions is set to zero')
    }
  }

  render() {
    return (
      <>
        {this.state.showNotificatins == 'true' &&
          <Notifications message={this.state.notificationMessage} />
        }
        {/* <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-7"> */}
        < div className="leaflet-control-attribution dark:filter dark:invert dark:hue-rotate-180 dark:brightness-95 dark:contrast-90" >
          <MapContainer center={[19.0760, 72.8777]} zoom={12} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {this.state.positions && this.state.positions.map((item, index) => {
              const markerIcon = item[4] == 1 ? this.state.redIcon : this.state.greenIcon;
              const lat = item[1];
              const lng = item[2];
              if (lat && lng) {
                return (
                  // <Marker key={index} position={[item[1], item[2]]} >

                  <Marker key={index} position={[item[1], item[2]]} icon={markerIcon} >
                    <Popup>
                      {item[0]}
                    </Popup>
                    <Tooltip>{item[0]}</Tooltip>
                  </Marker>)
              }
            })}
          </MapContainer>

        </div>
      </>
    );
  }
};

export default Maps;

