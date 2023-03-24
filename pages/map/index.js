function loginfo(...str) {
  let info = str.shift();
  console.log(
    `%c ${info} `,
    "color:white; background-color: #78d6fa; border-radius:10px;",
    ...str
  );
}
function logmarker(...str) {
  let info = str.shift();
  console.log(
    `%c ${info} `,
    "color:white; background-color: #9300fc; border-radius:10px;",
    ...str
  );
}
function logland(...str) {
  let info = str.shift();
  console.log(
    `%c ${info} `,
    "color:white; background-color: #0c7700; border-radius:10px;",
    ...str
  );
}
function logoccupation(...str) {
  let info = str.shift();
  console.log(
    `%c ${info} `,
    "color:white; background-color: #B22222; border-radius:10px;",
    ...str
  );
}

function onMapClick(e) {
  loginfo("Даблклик", e.latlng.toString());
}

window.onload = async () => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYXJ0ZWdvc2VyIiwiYSI6ImNrcDVhaHF2ejA2OTcyd3MxOG84bWRhOXgifQ.N3knNrPFIceTHVcIoPPcEQ";
  let movc = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/artegoser/clfm612fg002601nlcika2018?optimize=true",
    center: [53.19, 41.28],
    zoom: 6,
    projection: "globe",
  });

  movc.on("load", async () => {
    movc.loadImage(
      "https://erth2.github.io/movc/icons/city.png",
      (error, image) => {
        if (error) throw error;
        movc.addImage(`city`, image);
      }
    );

    movc.loadImage(
      "https://erth2.github.io/movc/icons/capital.png",
      (error, image) => {
        if (error) throw error;
        movc.addImage(`capital-city`, image);
      }
    );

    movc.loadImage(
      "https://erth2.github.io/movc/icons/landmark.png",
      (error, image) => {
        if (error) throw error;
        movc.addImage(`landmark-0`, image);
      }
    );

    let lasticocords;

    loginfo("Получаю карту");
    let geo = await fetch("https://erth2.github.io/movc/geo/geo.geojson"); //await fetch("/geo.geojson");
    loginfo("Получаю страны MOVC");
    let coarray = await fetch(
      "https://erth2.github.io/movc/geo/countries.json"
    );
    coarray = await coarray.json();
    let countries = {};
    for (let i = 0; i < coarray.length; i++)
      countries[coarray[i].idc] = coarray[i];

    let geojson = await geo.json();
    // geo = (await geo.json()).features;
    movc.addSource("map-data", {
      type: "geojson",
      data: geojson,
    });

    movc.addLayer({
      id: "map-data-fill",
      type: "fill",
      source: "map-data",
      paint: {
        "fill-color": ["get", "fill"],
        "fill-opacity": ["get", "fill-opacity"],
      },
    });

    movc.addLayer({
      id: "map-data-symbol",
      type: "symbol",
      source: "map-data",
      layout: {
        "icon-image": ["get", "type"],
        "icon-size": 0.15,
      },
      minzoom: 3,
    });

    movc.on("click", "map-data-fill", (e) => {
      const coordinates = e.lngLat;
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      onEachFeature(e.features[0], coordinates);
    });

    movc.on("click", "map-data-symbol", (e) => {
      const coordinates = e.lngLat;
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      onEachFeature(e.features[0], coordinates);
    });

    function onEachFeature(feature, coordinates) {
      if (feature.geometry.type === "Point") {
        lasticocords = coordinates;
        return new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `
                ${
                  feature?.properties?.amount
                    ? `<div class="row" style="padding: 5px; color: "white"; background-color: rgb(162, 162, 162);">Население - ${feature.properties.amount} чел.</div>`
                    : ""
                }
                <div class="row" style="padding: 5px;">
                  <div class="col-md-12 col-sm-12" style="padding: 0px;">
                    ${
                      feature?.properties?.img
                        ? `<img class="w-100" src="${feature.properties.img}" style="border-radius: 20px; margin-bottom: 5px" alt="${feature.properties.name} img">`
                        : ""
                    }
                  </div>
                  <div class="col-md-12 col-sm-12 text-center" style="border-radius: 20px; background-color: rgb(231, 231, 231)">
                    <h5 className="card-title">${feature.properties.name}</h5>
                    ${
                      feature.properties.description
                        ? `<div>${feature.properties.description}</div>`
                        : ""
                    }
                  </div>
                </div>
                `
          )
          .addTo(movc);
      } else if (feature.geometry.type === "Polygon") {
        let country = countries[feature.properties.name] || {
          name: "gl js mapbox is awesome",
        };
        setTimeout(() => {
          if (country.name !== "gl js mapbox is awesome")
            if (lasticocords !== coordinates)
              return new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                  `
                    <div class="row" style="padding: 5px;">
                            <div class="col-md-12 col-sm-12" style="padding: 0px;">
                                    <img class="w-100" src="${country.img}" style="border-radius: 20px 20px 0px 0px;">
                            </div>
                            <div class="col-md-12 col-sm-12 text-center" style="border-radius: 0px 0px 20px 20px; background-color: rgb(231, 231, 231)">
                                    <h5 class="card-title">
                                            ${country.name}
                                    </a>
                                    </h5>
                                    <a href="${country.about}" class="btn btn-primary mb-2" style="color:white;border-radius: 20px;">Подробнее</a>
                            </div>
                    </div>`
                )
                .addTo(movc);
        }, 1);
      }
    }
  });
};
