var card = document.getElementById('card');
var currentDate = new Date()
var week = currentDate.setDate(currentDate.getDate() - 7)
var month = currentDate.setDate(currentDate.getDate() - 30)
let prod_id = localStorage.getItem("chart_prod_id")
let product = localStorage.getItem("chart");
product = JSON.parse(product);

let url = product.url;
let currency = product.currency;

var checks = Object.values(product.check);
var allTime = checks[0].date

var data = [];
for(let id of Object.keys(checks)){
  data.push({date: new Date(checks[id].date), price: checks[id].price})
}

am4core.ready(function() {
    am4core.useTheme(am4themes_dataviz);
    am4core.useTheme(am4themes_animated);
    
    var chart = am4core.create("chartContainer", am4charts.XYChart);
    chart.data = data;

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.baseInterval = {
        "timeUnit": "day",
        "count": 0.5
    };
    dateAxis.tooltipDateFormat = "d MMM";

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.title.text = product.currency;

    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "price";
    series.tooltipText = "Price: [bold]{valueY}[/]";
    series.fillOpacity = 0.3;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineY.opacity = 0;
    chart.scrollbarX = new am4charts.XYChartScrollbar();
    chart.scrollbarX.series.push(series);

    dateAxis.start = 0.8;
    dateAxis.keepSelection = true;
});

let link_div = document.createElement("div");
link_div.setAttribute("class", "prod_link");
card.appendChild(link_div);

let button_div = document.createElement("div");
button_div.setAttribute("class", "delete_div")
card.appendChild(button_div)

let delete_button = document.createElement("button");
delete_button.setAttribute("type", "button");
delete_button.setAttribute("id", "delete_button");
delete_button.setAttribute("class", "btn btn-danger btn-block");
button_div.appendChild(delete_button);

let icon = document.createElement("i");
icon.setAttribute("class", "fa fa-trash");
delete_button.appendChild(icon);

let button_text = document.createTextNode(" Delete");
delete_button.appendChild(button_text);

let url_button = document.createElement("button");
url_button.setAttribute("type", "button");
url_button.setAttribute("id", "url_button");
url_button.setAttribute("class", "btn btn-info btn-block");

let url_icon = document.createElement("i");
url_icon.setAttribute("class", "fa fa-shopping-cart");
url_button.appendChild(url_icon);

let url_button_text = document.createTextNode(" See product page");
url_button.appendChild(url_button_text);
link_div.appendChild(url_button); 

document.getElementById("delete_button").onclick = function(){
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      
      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "Your product will be permanently deleted!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel!',
        reverseButtons: false
      }).then((result) => {
        if (result.value) {
            chrome.runtime.sendMessage({
                msg: "delete",
                id: prod_id
            });
          
            swalWithBootstrapButtons.fire({
                title: "Deleted!",
                text: "You won't follow this product anymore.",
                icon: "success",
                timer: 2500
            }
            ).then(function(){
                history.back();
            })
        } else if (result.dismiss === Swal.DismissReason.cancel){
                    return;
                }
    })
    
}

document.getElementById("url_button").onclick = function(){
    window.open(url, "_blank");
}

document.getElementById("back_button").onclick = function(){
    history.back();
}

function formatDate(date) {
    var d = new Date(date);
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }

    return [year, month, day].join('-');
}
