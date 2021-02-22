var ctx = document.getElementById('chart').getContext("2d");
var card = document.getElementById('card');
var dates = [];
var prices = [];

var currentDate = new Date()
var week = currentDate.setDate(currentDate.getDate() - 7)
var month = currentDate.setDate(currentDate.getDate() - 30)
var chartScale = formatDate(week)

// chrome.storage.sync.get(["chart", "chart_prod_id"], function (result) {
    let prod_id = localStorage.getItem("chart_prod_id")
    // console.log(prod_id)
    let check = localStorage.getItem("chart");
    check = JSON.parse(check);
    // console.log(check)
    let url = check.url;
    let currency = check.currency;
    // console.log(url)
    check = Array(check);
    
    check.forEach(element => {
        var gradient = ctx.createLinearGradient(0, 0, 0, 135);
        gradient.addColorStop(0, 'rgba(170, 170, 170, 0.75)');
        gradient.addColorStop(0.5, 'rgba(175, 175, 175, 0.65)');
        gradient.addColorStop(1, 'rgba(180, 180, 180, 0.55)');
 
        var checks = Object.values(element.check);

        for(let id of Object.keys(checks)){
            dates.push(formatDate(checks[id].date));
            // dates.push(checks[id].date);
            prices.push(checks[id].price);
        }

        // for(var i=1; i<=prices.length; ++i){
        //     if( (prices[i] == prices[i-1])){
        //         // console.log(prices[i])
        //         // console.log(dates[i])
        //         dates[i] = "";
        //     }
        //     // if()
        // }
    
        var data  = {
            labels: dates,
            datasets: [{
                    title: "Price change (" + currency + ")",
                    backgroundColor: gradient,
                    pointBackgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: '#858585',
                    data: prices
            }]
        };
           
        var options = {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                easing: 'easeInOutQuad',
                duration: 520
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        color: 'rgba(200, 200, 200, 0.05)',
                        lineWidth: 1
                    },
                    ticks:{
                        min: chartScale,
                        // interval: 2,
                        valueFormatString: "MMM-DD"
                    },
                    labelFormatter: function (e) {return CanvasJS.formatDate( e.value, "DD MMM");},
                }],
                yAxes: [{
                    gridLines: {
                        color: 'rgba(200, 200, 200, 0.08)',
                        lineWidth: 1
                    },
                }]
            },
            elements: {
                line: {
                    tension: 0.4
                }
            },
            legend: {
                display: false
            },
            point: {
                backgroundColor: 'white'
            },
            tooltips: {
                titleFontFamily: 'Open Sans',
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFontColor: 'white',
                caretSize: 10,
                cornerRadius: 10,
                xPadding: 10,
                yPadding: 10
            }
        };

        let chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });

        var scaleForm = document.scaleForm.scale_selector;
        var scale = null;
        for(var button of scaleForm){
            button.addEventListener('change', function() {
                if (this !== scale) {
                    scale = this;
                    if(scale.value == "week") chart.options.scales.xAxes[0].ticks.min = formatDate(week)
                    if(scale.value == "month") chart.options.scales.xAxes[0].ticks.min = formatDate(month);
                    if(scale.value == "alltime") chart.options.scales.xAxes[0].ticks.min = 0;
                }
                chart.update();
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
    });



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
