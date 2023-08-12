import { Pipe, PipeTransform } from '@angular/core';
import { Dict } from './load.service';

@Pipe({
  name: 'liveEarthViewPipe',
})
export class LiveEarthViewPipePipe implements PipeTransform {
  transform(value: string, n: Array<Dict<any>>) {
    var markers: Array<{
      coords: Dict<number>;
      address: Dict<string>;
      views: number;
      sales: number;
      docId: string;
      timestamp: Date;
    }> = [];
    n.forEach((p) => {
      let same = markers?.findIndex(
        (k) =>
          p['address'].city == k.address['city'] &&
          p['address'].region == k.address['region'] &&
          p['address'].country == k.address['country'] &&
          p['docId'] == k.docId
      );
      if (same >= 0) {
        if (p['type'] == 'SALE') {
          markers[same].sales += p['num'];
        } else {
          markers[same].views += p['num'];
        }
      } else {
        var views = 0;
        var sales = 0;
        if (p['type'] == 'SALE') {
          sales += p['num'];
        } else {
          views += p['num'];
        }
        markers?.push({
          coords: p['coords'],
          address: p['address'],
          views: views,
          sales: sales,
          docId: p['docId'],
          timestamp: p['timestamp'],
        });
      }
    });
    var mystr = '';
    markers.forEach((i) => {
      var color = '';
      var scale = 0;

      if (i.views > 0 && i.sales > 0) {
        color = '"#ce5eff"';
        scale = 0.5;
      } else {
        scale = 0.3;
        if (i.views == 0) {
          color = '"rgb(48, 184, 48)"';
        } else {
          color = '"#ff003f"';
        }
      }
      mystr += `
      var mymarker = this.addMarker( 
        {
          location: { 
            lat :${i.coords['LATITUDE']}, 
            lng : ${i.coords['LONGITUDE']} 
          },
          mesh: ['Pin3'],
          color: ${color},
          hotspot: true,
          transparent:true,
          opacity:1.0,
          scale: ${scale}
        } 
      );
      mymarker.animate( 'scale', 0.2, { 
          loop: true, 
          oscillate: true, 
          duration: 2000, 
          easing: 'in-out-quad' 
        }
      );
      mymarker.animate( 'opacity', 0.75, { 
          loop: true, 
          oscillate: true, 
          duration: 2000,
           easing: 'in-out-quad'
        } 
      );
      mymarker.addEventListener( 'click', function() { 

        this.earth.goTo(
          { 
            lat :${i.coords['LATITUDE']}, 
            lng : ${i.coords['LONGITUDE']}
          }, 
          { 
            duration: 500 
          } 
        ); 
        parent.openCard(
          {
            long: ${i.coords['LONGITUDE']}, 
            lat: ${i.coords['LATITUDE']},
            time: ${JSON.stringify(i.timestamp)},
            address: ${JSON.stringify(i.address)},
            docId: '${i.docId}',
            views: ${i.views},
            sales: ${i.sales},
          }
        ); 
      });
      `;
    });
    return value.replace('yyyy;', mystr != '' ? mystr : ';');
  }
}
