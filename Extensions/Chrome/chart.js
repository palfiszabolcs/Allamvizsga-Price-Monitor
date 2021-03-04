var card = document.getElementById('card');

var currentDate = new Date()
var week = currentDate.setDate(currentDate.getDate() - 7)
var month = currentDate.setDate(currentDate.getDate() - 30)
// var chartScale = formatDate(week)

// chrome.storage.sync.get(["chart", "chart_prod_id"], function (result) {
    let prod_id = localStorage.getItem("chart_prod_id")
    // console.log(prod_id)
    let product = localStorage.getItem("chart");
    product = JSON.parse(product);
    // var element = check;

    // console.log(product.check)
    let url = product.url;
    let currency = product.currency;
    // console.log(url)
    // check = Array(check);
    // check.forEach(element => {
        // var gradient = ctx.createLinearGradient(0, 0, 0, 135);
        // gradient.addColorStop(0, 'rgba(170, 170, 170, 0.75)');
        // gradient.addColorStop(0.5, 'rgba(175, 175, 175, 0.65)');
        // gradient.addColorStop(1, 'rgba(180, 180, 180, 0.55)');
        var checks = Object.values(product.check);
        var allTime = checks[0].date
        
        var data = [];
        for(let id of Object.keys(checks)){
            data.push([checks[id].date, checks[id].price])
        }

        // for(var i=1; i<=prices.length; ++i){
        //     if( (prices[i] == prices[i-1])){
        //         // console.log(prices[i])
        //         // console.log(dates[i])
        //         dates[i] = "";
        //     }
        //     // if()
        // }
    
        // var data  = [{
        //     x: dates,
        //     y: prices
        // }];
          
        // var options = {
        //     responsive: true,
        //     maintainAspectRatio: true,
        //     animation: {
        //         easing: 'easeInOutQuad',
        //         duration: 520
        //     },
        //     scales: {
        //         xAxes: [{
        //             gridLines: {
        //                 color: 'rgba(200, 200, 200, 0.05)',
        //                 lineWidth: 1
        //             },
        //             ticks:{
        //                 min: chartScale,
        //                 // interval: 2,
        //                 valueFormatString: "MMM-DD"
        //             },
        //             labelFormatter: function (e) {return CanvasJS.formatDate( e.value, "DD MMM");},
        //         }],
        //         yAxes: [{
        //             gridLines: {
        //                 color: 'rgba(200, 200, 200, 0.08)',
        //                 lineWidth: 1
        //             },
        //         }]
        //     },
        //     elements: {
        //         line: {
        //             tension: 0.4
        //         }
        //     },
        //     legend: {
        //         display: false
        //     },
        //     point: {
        //         backgroundColor: 'white'
        //     },
        //     tooltips: {
        //         titleFontFamily: 'Open Sans',
        //         backgroundColor: 'rgba(0,0,0,0.8)',
        //         titleFontColor: 'white',
        //         caretSize: 10,
        //         cornerRadius: 10,
        //         xPadding: 10,
        //         yPadding: 10
        //     }
        // };

        // let chart = new Chart(ctx, {
        //     type: 'line',
        //     data: data,
        //     options: options
        // });

        

        var options = {
            series: [{
                name: "Price",
                data: data
            }],
            chart: {
                id: 'area-datetime',
                type: 'area',
                height: 355,
                width: 380,
                zoom: {
                  autoScaleYaxis: true
                },
                animations:{
                    enabled: false
                }
              },
              dataLabels: {
                enabled: false
              },
              markers: {
                size: 0,
                style: 'hollow',
              },
              xaxis: {
                type: 'datetime',
                tickAmount: 6,
                min: week
              },
              yaxis:{
                title: {
                    text: product.currency
                },
                tickAmount: 10
              },
              tooltip: {
                x: {
                  format: 'dd MMM yyyy'
                }
              },
              fill: {
                type: 'gradient',
                gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.7,
                  opacityTo: 0.9,
                  stops: [0, 100]
                }
              },
          };
    
        var chart = new ApexCharts(document.querySelector("#timeline-chart"), options);
        chart.render();

        var scaleForm = document.scaleForm.scale_selector;
        var scale = null;
        for(var button of scaleForm){
            button.addEventListener('change', function() {
                if (this !== scale) {
                    console.log(options.xaxis.min)
                    scale = this;
                    
                    if(scale.value == "week") chart.zoomX(week)
                    if(scale.value == "month") chart.zoomX(month)
                    if(scale.value == "alltime") chart.zoomX(alltime)
                }
                // chart.update();
            });
        }

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


        // let a_url = document.createElement("a");
        // a_url.setAttribute("href", url);
        // a_url.setAttribute("target", "_blank");
        // a_url.textContent = url

        let url_button = document.createElement("button");
        url_button.setAttribute("type", "button");
        url_button.setAttribute("id", "url_button");
        url_button.setAttribute("class", "btn btn-info btn-block");
        // url_button.setAttribute("onclick", url);

        let url_icon = document.createElement("i");
        url_icon.setAttribute("class", "fa fa-shopping-cart");
        url_button.appendChild(url_icon);

        let url_button_text = document.createTextNode(" See product page");
        url_button.appendChild(url_button_text);
        // a_url.appendChild(url_button);
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
    // });



// });

// console.log("referrer " + document.referrer)

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
