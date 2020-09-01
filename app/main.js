define([
  "app/config",
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch/SketchViewModel",
  "esri/config",
  "esri/core/promiseUtils",
  "app/time",
  "app/statistics",
  "app/renderers",
  "app/charts"
], function (config,
  WebScene,
  SceneView,
  GraphicsLayer,
  SketchViewModel,
  esriConfig,
  promiseUtils,
  time,
  statistics,
  renderers,
  charts) {

  return {
    init: function () {
      esriConfig.portalUrl = config.portalUrl;

      let bdgLayer = null;
      let bdgLayerView = null;

      const appState = {
        minYear: 0,
        maxYear: null,
        totalCount: null,
        filterGeometry: null,
        features: null
      };

      const webscene = new WebScene({
        portalItem: {
          id: config.itemId
        }
      });

      const view = new SceneView({
        container: "viewDiv",
        qualityProfile: "high",
        map: webscene
      });

      view.when(function () {
        webscene.allLayers.forEach(layer => {
          if (layer.title === config.buildingLayerTitle) {
            bdgLayer = layer;
            bdgLayer.popupTemplate = {
              content: `Dit gebouw is {${config.heightField}}m lang, gebouwd in
              {${config.yearField}} en het heeft een {${config.usageField}}.`
            };
            bdgLayer.outFields = [config.heightField, config.yearField, config.usageField];

            view.whenLayerView(layer).then(function (lyrView) {
              bdgLayerView = lyrView;
              
              // add time slider
              const timeSlider = time.createTimeSlider(view, config);
              timeSlider.watch("timeExtent", function (timeExtent) {
                appState.maxYear = timeExtent.end.getFullYear();
                updateMap();
                runQuery();
              });

              // watch for changes on the layer
              bdgLayerView.watch("updating", function (updating) {
                console.log("try updating");

                if (!updating) {
                  console.log("updating");
                  runQuery();
                  addChartEventListeners();
                }
              });
            });
          }
        });
      });

      var def_expression_date = "1=1 ";
      var def_expression_height = "AND 1=1 ";
      var def_expression_usage = "AND 1=1";

      var click_year = false;
      var click_height = false;
      var click_usage = false;


      function addChartEventListeners() {

        charts.usageCanvas.onclick = function(evt)
        {   
          if (click_usage == false){

            click_usage = true;
            var activePoints = charts.usageChart.getElementsAtEvent(evt);
            var clickedElementindex = activePoints[0]["_index"];
            var label = charts.usageChart.data.labels[clickedElementindex];

            if (label == "Other"){
              def_expression_usage = "AND Gebruiksfunctie IS NULL ";
            }
            else{
              def_expression_usage = "AND Gebruiksfunctie LIKE '" + label.toLowerCase() + "'";
            }
          }

          else {
            click_usage = false;
            def_expression_usage = "AND 1=1";
          }
          

          defExpression(def_expression_date,def_expression_height,def_expression_usage);  
        }


        charts.heightCanvas.onclick = function(evt)
        {   
          if (click_height == false){

            click_height = true;
            var activePoints = charts.heightChart.getElementsAtEvent(evt);
            var clickedElementindex = activePoints[0]["_index"];
            var label = charts.heightChart.data.labels[clickedElementindex];
            var heights = label.split(" ");
            
            
            if (heights[2] != null) {
              var start_height = heights[0];
              var end_height = heights[2].substring(0, heights[2].lastIndexOf("m"));

              def_expression_height = "AND Pandhoogte >= " + start_height + " AND Pandhoogte < " + end_height + " ";
            }

            else {
              var height = heights[1].substring(0, heights[1].lastIndexOf("m"));
              def_expression_height = "AND Pandhoogte " + heights[0] + " " + height + " ";
            }
              
            
          }
            
          else{
            click_height = false;
            def_expression_height = "AND 1=1 ";
          }
          

          defExpression(def_expression_date,def_expression_height,def_expression_usage);  
        }



        charts.yearCanvas.onclick = function(evt)
        {   
          if (click_year == false){

            click_year = true;
            var activePoints = charts.yearChart.getElementsAtEvent(evt);
            var clickedElementindex = activePoints[0]["_index"];
            var label = charts.yearChart.data.labels[clickedElementindex];
            var dates = label.split(" ");
            
            
            if (dates[2] != null) {
              var start_date = dates[0];
              var end_date = dates[2];
              def_expression_date = "Bouwjaar >= " + start_date + " AND Bouwjaar < " + end_date + " ";
            }
            else {
              var date = dates[0].substring(dates[0].lastIndexOf("<") + 1, dates[0].length);
              def_expression_date = "Bouwjaar < " + date + " ";
            }
          }
            
          else{
            click_year = false;
            def_expression_date = "1=1 ";
          }
          

          defExpression(def_expression_date,def_expression_height,def_expression_usage);  
          }
      }

      function defExpression(date_expression, height_expression, usage_expression){
        def_expression = date_expression+height_expression+usage_expression;
        console.log(def_expression);
        bdgLayer.definitionExpression = def_expression;
      }
      

      // add sketch functionality

      const sketchLayer = new GraphicsLayer({
        elevationInfo: {
          mode: "on-the-ground"
        }

      });
      webscene.add(sketchLayer);

      const sketchViewModel = new SketchViewModel({
        layer: sketchLayer,
        defaultUpdateOptions: {
          tool: "reshape",
          toggleToolOnClick: false
        },
        view: view,
        defaultCreateOptions: { hasZ: false }, // follow the elevation profile
        polygonSymbol: {
          type: "polygon-3d",
          symbolLayers: [
            {
              type: "fill",
              material: {
                color: [100, 200, 210, 0.6]
              },
              outline: {
                color: [0, 0, 0, 1],
                size: "5px"
              }
            }
          ]
        }
      });

      sketchViewModel.on("create", function (event) {
        if (event.state === "complete") {
          appState.filterGeometry = event.graphic.geometry;
          bdgLayerView.filter = {
            geometry: appState.filterGeometry,
            spatialRelationship: "intersects"
          };
          runQuery();
        }
      });

      sketchViewModel.on("update", function (event) {
        if (!event.cancelled && event.graphics.length) {
          appState.filterGeometry = event.graphics[0].geometry;
          bdgLayerView.filter = {
            geometry: appState.filterGeometry,
            spatialRelationship: "intersects"
          };
          runQuery();
        }
      });

      const debouncedRunQuery = promiseUtils.debounce(function () {
        const query = bdgLayerView.createQuery();
        query.geometry = appState.filterGeometry;
        query.outStatistics = statistics.totalStatDefinitions;
        return bdgLayerView.queryFeatures(query).then(charts.updateCharts);
      });

      function runQuery() {
        debouncedRunQuery().catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
          console.error(error);
        });
      }

      document.getElementById("drawPolygon").addEventListener("click", function () {
        sketchViewModel.create("polygon");
      });

      document.getElementById("clearSelection").addEventListener("click", function () {
        appState.filterGeometry = null;
        bdgLayerView.filter = null;
        sketchViewModel.cancel();
        sketchLayer.removeAll();
        runQuery();
      });

      document.getElementById("applyYearRenderer").addEventListener("click", function () {
        renderers.applyYearRenderer(bdgLayer);
        console.log(bdgLayerView.suspended);
      });

      document.getElementById("applyHeightRenderer").addEventListener("click", function () {
        renderers.applyHeightRenderer(bdgLayer);
      });

      document.getElementById("applyUsageRenderer").addEventListener("click", function () {
        renderers.applyUsageRenderer(bdgLayer);
      });

      document.getElementById("clearRenderer").addEventListener("click", function () {
        renderers.applyOriginalTexture(bdgLayer);
      });

      function updateMap() {
        bdgLayer.definitionExpression = `${config.yearField} <= ${appState.maxYear}`;
      }
    }
  }

});

