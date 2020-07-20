var ctx = document.getElementById('chart');
var card = document.getElementById('card');
var dates = [];
var prices = [];

chrome.storage.sync.get(["chart", "chart_prod_id"], function (result) {
    var checks = Object.values(result.chart.check);
    var prod_id = result.chart_prod_id;

    let url = result.chart.url;
    for(let id of Object.keys(checks)){
        dates.push(checks[id].date);
        prices.push(checks[id].price);

    }

    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Price (' + result.chart.currency + ')',
                data: prices,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    });

    let div = document.createElement("div");
    div.setAttribute("class", "prod_link");
    card.appendChild(div);

    let delete_button = document.createElement("button");
    delete_button.setAttribute("type", "button");
    delete_button.setAttribute("id", "delete_button");
    delete_button.setAttribute("class", "btn btn-outline-danger btn-block");
    card.appendChild(delete_button);

    let icon = document.createElement("i");
    icon.setAttribute("class", "fa fa-trash");
    delete_button.appendChild(icon);

    let button_text = document.createTextNode(" Delete");
    delete_button.appendChild(button_text);

    let a_url = document.createElement("a");
    a_url.setAttribute("href", url);
    a_url.setAttribute("target", "_blank");
    a_url.textContent = url
    div.appendChild(a_url);

    
    document.getElementById("delete_button").onclick = function(){
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-success',
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
                // chrome.runtime.sendMessage({
                // msg: "delete",
                // id: prod_id
                // });
              
                swalWithBootstrapButtons.fire(
                "Deleted!",
                "You won't follow this product anymore.",
                "success"
                ).then(function(){
                    history.back();
                })
            } else if (result.dismiss === Swal.DismissReason.cancel){
                        return;
                    }
          })
        
    }
});

// console.log("referrer " + document.referrer)

document.getElementById("back_button").onclick = function(){
    history.back();
}


