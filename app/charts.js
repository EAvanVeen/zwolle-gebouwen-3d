define(["app/config", "app/utils", "app/statistics", "app/main"], function (config, appUtils, statistics,main) {
  Chart.defaults.global.defaultFontFamily = `"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif`;
  Chart.defaults.global.defaultFontSize = 12;


   
  const yearCanvas = document.getElementById("yearChart");
  const usageCanvas = document.getElementById("usageChart");
  const heightCanvas = document.getElementById("heightChart");

  function createYearChart() {
    const yearChart = new Chart(yearCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: config.yearClasses.map(function (element) { return element.label }),
        datasets: [
          {
            label: "Gebouwde gebouwen",
            backgroundColor: config.yearClasses.map(function (element) { return element.color }),
            stack: "Stack 0",
            data: [0, 0, 0, 0, 0, 0]
          }
        ]
      },
      options: {
        responsive: false,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Aantal gebouwen per bouwjaar"
        },
        scales: {
          xAxes: [
            {
              stacked: true
            }
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                precision: 0
              }
            }
          ]
        }
      }
    });
      
  
    return yearChart;
  }
  function createHeightChart() {
    
    const heightBins = appUtils.heightBins;
    const heightChart =  new Chart(heightCanvas.getContext("2d"), {
      type: "horizontalBar",
      data: {
        labels: heightBins.map(function (element) { return element.label }),
        datasets: [
          {
            label: "Gebouwen met deze hoogte",
            backgroundColor: heightBins.map(function (element) { return element.color }),
            data: [0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      },
      options: {
        responsive: false,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Aantal gebouwen op basis van hoogte"
        },
        scales: {
          xAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                precision: 0
              }
            }
          ],
          yAxes: [
            {
              stacked: true
            }
          ]
        }
      }
    });

    
    return heightChart;
  }

  function createUsageChart() {

    const labels = config.usageValues.map(function (element) {
      return element.label;
    })
    labels.push("Other");

    const backgroundColor = config.usageValues.map(function (element) {
      return element.color;
    });
    backgroundColor.push(config.otherColor);

    const usageChart = new Chart(usageCanvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            backgroundColor: backgroundColor,
            borderWidth: 0,
            data: [0, 0, 0, 0, 0]
          }
        ]
      },
      options: {
        responsive: false,
        cutoutPercentage: 35,
        legend: {
          display: false,
          position: "bottom"
        },
        title: {
          display: true,
          text: "Gebruiksfunctie gebouw"
        }
      }
    });

    

    return usageChart;
  }

  const yearChart = createYearChart();
  const heightChart = createHeightChart();
  const usageChart = createUsageChart();
  return {
    yearChart,
    heightChart,
    usageChart,
    yearCanvas,
    heightCanvas,
    usageCanvas,
    updateCharts(result) {
      const allStats = result.features[0].attributes;

      const yearValues = statistics.yearStatDefinitions.map(function (element) {
        return allStats[element.outStatisticFieldName]
      });
      yearChart.data.datasets[0].data = yearValues;
      yearChart.update();

      const heightValues = statistics.heightStatDefinitions.map(function (element) {
        return allStats[element.outStatisticFieldName]
      });
      heightChart.data.datasets[0].data = heightValues;
      heightChart.update();

      const usageValues = statistics.usageStatDefinitions.map(function (element) {
        return allStats[element.outStatisticFieldName]
      });
      usageChart.data.datasets[0].data = usageValues;
      usageChart.update();
    }
  }
});
