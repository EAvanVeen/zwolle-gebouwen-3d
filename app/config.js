define([], function () {
  return {
    portalUrl: "http://jsapi.maps.arcgis.com/",
    itemId: "263a29e5b7124a11944ea28cf7f38cae",
    buildingLayerTitle: "BAG 3D",
    heightField: "gebouwhoogte",
    usageField: "gebruiksdoel1",
    yearField: "bouwjaar",
    timeline: {
      bin: 5,
      minYear: 1900,
      maxYear: 2020
    },
    noDataColor: "white",
    otherColor: "#FFB55A",
    yearClasses: [{
      minYear: 0,
      maxYear: 1899,
      color: "#bd0026",
      label: "<1900"
    }, {
      minYear: 1900,
      maxYear: 1924,
      color: "#f03b20",
      label: "1900 - 1924"
    }, {
      minYear: 1925,
      maxYear: 1949,
      color: "#fd8d3c",
      label: "1925 - 1949"
    }, {
      minYear: 1950,
      maxYear: 1974,
      color: "#feb24c",
      label: "1951 - 1974"
    }, {
      minYear: 1975,
      maxYear: 1999,
      color: "#fed976",
      label: "1975 - 1999"
    }, {
      minYear: 2000,
      maxYear: 2020,
      color: "#ffffb2",
      label: "2000 - 2020"
    }],
    heightVariable: {
      stops: [
        { value: 5, color: "#e0ecf4", label: "< 10m" },
        { value: 30, color: "#8856a7", label: "> 70m" }
      ],
      binSize: 5
    },
    usageValues: [{
      value: "bijeenkomstfunctie",
      color: "#00FFC5",
      label: "Bijeenkomstfunctie"
    }, {
      value: "gezondheidszorgfunctie",
      color: "#E69800",
      label: "Gezondheidszorgfunctie"
    }, {
      value: "industriefunctie",
      color: "#B53535",
      label: "Industriefunctie"
    }, {
      value: "kantoorfunctie",
      color: "#8400A8",
      label: "Kantoorfunctie"
    }, {
      value: "logiesfunctie",
      color: "#376CBD",
      label: "Logiesfunctie"
    }, {
      value: "onderwijsfunctie",
      color: "#E600A9",
      label: "Onderwijsfunctie"
    }, {
      value: "overige gebruiksfunctie",
      color: "#734C00",
      label: "Overige gebruiksfunctie"
    }, {
      value: "sportfunctie",
      color: "#65A843",
      label: "Sportfunctie"
    }, {
      value: "winkelfunctie",
      color: "#FFFF00",
      label: "Winkelfunctie"
    }, {
      value: "woonfunctie",
      color: "#E1E1E1",
      label: "Woonfunctie"
    }]
  }
});
