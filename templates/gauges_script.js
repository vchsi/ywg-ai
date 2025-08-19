function changeGauge(gauge, newValue){
    const color = {
        0: "red",
        1: "red",
        2: "red",
        3: "orange",
        4: "orange",
        5: "yellow",
        6: "yellow",
        7: "yellow",
        8: "green",
        9: "green",
        10: "green"
    }
    if(gauge.classList.contains('circular-gauge')){
        const valueText = gauge.querySelector(".gauge__value__span");
        percent = newValue * 10
        percent = Math.max(0, Math.min(100, percent));
        const degrees = (percent / 100) * 242;
        

        gauge.style.background = `conic-gradient(from -30deg, ${color[Math.ceil(percent / 10)]} ${degrees}deg, #ddd ${degrees}deg 180deg)`;
        valueText.textContent = `${percent / 10} / 10`;
    
    } else if (gauge.classList.contains('static-score-gauge')){
        const valueText = gauge.querySelector(".static-score-gauge-score > .top");
        if(!isNaN(newValue)){
            chosen_color = color[parseInt(Math.floor(newValue / 10))]
        } else {
            chosen_color = "black"
        }
        gauge.style.color = chosen_color
        gauge.style.border = `4px solid ${chosen_color}`
        valueText.innerHTML = newValue
    }
}
function calcPosRatio(min, max, val){
    return (val - min) / (max - min)
}

// initialize a numerical (price) scale
/* parameters: {
    scale (element): The scale (div element) which we are manipulating,
    customerLow, customerHigh (int): Customer range low and high values,
    marketLow, marketHigh (int): Watch average low and high trading prices,
    MSRP (int): Watch MSRP,
    flexibility (string "strict"/"moderate"/"flexible"): Customer's pricingStrategy,
    lowRange, highRange (int): Low and High Range of the chart
}
*/
function changeImage(element, direction){
    elementJQ = $(element)
    const carousel = elementJQ.parent().parent().find(".watch-image-carousel")
    const numImages = parseInt(carousel.data("num-images"))
    const shownImage = carousel.find(".shown-image")
    //console.log(shownImage)
    const currentImageNo = parseInt(carousel.data("cur-image"))
    let newImageNo = Math.abs((currentImageNo + direction) % numImages)
    carousel.data("cur-image", currentImageNo + direction)
    
    let newImage = carousel.find(`img[data-image-no="${newImageNo}"]`)
   // console.log(newImageNo)
    newImage.removeClass("hidden-image")
    newImage.addClass("shown-image")

    shownImage.removeClass("shown-image")
    shownImage.addClass("hidden-image")
}

function clarifyValue(element, trueValue, defaultBG, defaultZIndex=1){
    elementJQ = $(element)
    const value = elementJQ.data("value")
    const assoc_meter = elementJQ.parent().parent().parent().find(`.numerical-meter-container`)
    const popup = assoc_meter.find(`.numerical-meter > div[data-popup=${value}-popup]`)
    const bar = assoc_meter.find(`.numerical-meter > div[data-value=${value}]`)
    // console.log(assoc_meter)
    if(bar.css("display") !== "none"){
        if(trueValue === true){
            popup.show()
            if(value === "msrp"){
                bar.css("color", "#00aaff")
            } else {
                bar.css("background-color", " yellow ")
            }
            bar.css("z-index", "10")
        } else {
            popup.hide()
            if(value === "msrp"){
                bar.css("color", defaultBG)
            } else {
                bar.css("background-color", defaultBG)
            }
            bar.css("z-index", defaultZIndex)
        }
    }
        

}

function initScale(scale, customerLow, customerHigh, marketLow, marketHigh, MSRP, flexibility, lowRange=0, highRange=400){
    
    const jQ_scale = $(scale).find(".numerical-meter")
    const scale_width = jQ_scale.width()
    const scale_height = jQ_scale.height()
    // console.log(`${jQ_scale.attr("id")} ${jQ_scale.width()} x ${jQ_scale.height()}.`)
    const left = $(scale).find("h3.left")
    const right = $(scale).find("h3.right")
    const customer_bar = jQ_scale.find("div.customer-range")
    const market_bar = jQ_scale.find("div.market-range")
    left.text(`$${lowRange}`)
    right.text(`$${highRange}`)

    const customer_bar_start = calcPosRatio(lowRange, highRange, customerLow) * scale_width
    const customer_bar_end = calcPosRatio(lowRange, highRange, customerHigh) * scale_width
    customer_bar.width(customer_bar_end - customer_bar_start)
    customer_bar.css("transform", `translateX(${customer_bar_start}px)`)

    const market_bar_start = calcPosRatio(lowRange, highRange, marketLow) * scale_width
    const market_bar_end = calcPosRatio(lowRange, highRange, marketHigh) * scale_width
    market_bar.width(market_bar_end - market_bar_start)
    market_bar.css("transform", `translateX(${market_bar_start}px)`)

    const overflow_bar = jQ_scale.find("div.overflow-bar")

    if(market_bar_end > customer_bar_end && market_bar_start < customer_bar_start){
        customer_bar.css("z-index", "4")
    }

    if(market_bar_start > customer_bar_end){
        overflow_bar.show()
        overflow_bar.css("background-color", "red")
        overflow_bar.width(market_bar_start - customer_bar_end)
        overflow_bar.css("transform", `translateX(${customer_bar_end}px)`)
    } else if (market_bar_end < customer_bar_start){
        overflow_bar.show()
        overflow_bar.css("background-color", "green")
        overflow_bar.width(customer_bar_start - market_bar_end)

        overflow_bar.css("transform", `translateX(${market_bar_end}px)`)
    } 
    const pricing_flexibility_colors = {
        "strict": "red",
        "moderate": "#E47303",
        "flexible": "green"
    }
    const msrp_marker = jQ_scale.find(".msrp")
    // console.log(market_bar_start, market_bar_end, customer_bar_start, customer_bar_end)
    if( MSRP > lowRange && MSRP < highRange){
        msrp_position = (calcPosRatio(lowRange, highRange, MSRP) * scale_width) - (msrp_marker.width() / 2)
        // console.log(msrp_position)
        msrp_marker.css("transform", `translate(${msrp_position}px, -${scale_height * 0.65}px)`)
        msrp_marker.css("color", pricing_flexibility_colors[flexibility])
    } else if (MSRP < lowRange){
        msrp_position = 0
        msrp_marker.css("transform", `translate(${msrp_position}px, -${scale_height * 0.65}px)`)
        msrp_marker.css("color", pricing_flexibility_colors[flexibility])
    } else if (MSRP > highRange){
        msrp_position = scale_width - msrp_marker.width()
        msrp_marker.css("transform", `translate(${msrp_position}px, -${scale_height * 0.65}px)`)
        msrp_marker.css("color", pricing_flexibility_colors[flexibility])
    }

    const popup_required = [customer_bar, market_bar, msrp_marker]
    const popup_titles = {"customer-range": [`Customer Range (${flexibility}): $${customerLow} - $${customerHigh}`, customer_bar_start, customer_bar_end, "-125%"], 
        "market-range": [`Market Range: $${marketLow} - $${marketHigh}`, market_bar_start, market_bar_end, "-125%"],
        "msrp": [`MSRP: $${MSRP}`, msrp_position*1.75, msrp_position, "-210%"]}
    // , market_bar, msrp_marker
    for (element of popup_required) {
        assoc_popup = jQ_scale.find(`*[data-popup=${element.data('value')}-popup]`)
        // console.log(assoc_popup)
        popup_info = popup_titles[element.data('value')]
        assoc_popup.text(`${popup_info[0]}`)
        // move popup directly on top of bar
        popup_width = assoc_popup.width(); popup_height = assoc_popup.height();
        assoc_popup.css("transform", `translate(${(popup_info[2] + popup_info[1]) / 3}px, ${popup_info[3]})`)
        element.hover(
            function(e){
                // Find the popup associated with THIS element
                const popup = $(this).closest(".numerical-meter").find(`*[data-popup=${$(this).data('value')}-popup]`);
                popup.show();
            },
            function(e){
                const popup = $(this).closest(".numerical-meter").find(`*[data-popup=${$(this).data('value')}-popup]`);
                popup.hide();
            }
        )
    }

}
function collapseCollapsible(collapsible){
    console.log(collapsible)
    collapsible = $(collapsible)
    mainCollapsible = collapsible.parent()
    button = collapsible.find(".open-close-icon")
    content = mainCollapsible.find(".collapsible-box-content")
    hidden = content.css("display") == "none"
    console.log(content)
    if(hidden == true){
        content.fadeIn(100)
        button.text("▼")
    } else {
        content.fadeOut(100)
        button.text("▶")
    }
    
}
/* (Include this script for testing only; Regular gauge initiation happens in initiate_report.js)

document.addEventListener("DOMContentLoaded", 
    function(){
        
        
        for(let i = 0; i < 2; i++){
            initScale($("#test-meter-3"), 100, 200, 200, 250, 295, "flexible", 50, 300)
        }
        window.onresize = function(){
            initScale($("#test-meter-3"), 100, 200, 200, 250, 295, "flexible", 50, 300)
        }
        
        
        Sample gauge values

         //   initScale($("#test-meter"), 50, 100, 175, 220, 350, "moderate")
         //   initScale($("#test-meter-2"), 190, 200, 200, 220, 200, "strict", 150, 230)
        
        changeGauge(document.getElementById("gauge"), 7)
        changeGauge(document.getElementById("versGauge"), 5)
        changeGauge(document.getElementById("valGauge"), 10)


        changeGauge(document.getElementById("versGauge_2"), 9)
        changeGauge(document.getElementById("durabilityGauge"), 4)
        changeGauge(document.getElementById("budgetGauge"), 6)

        changeGauge(document.getElementById("fitScore"), 87)

        changeGauge(document.getElementById("fitScore2"), 91)
        changeGauge(document.getElementById("fitScore3"), 67)
        

        changeGauge(document.getElementById("gauge"), 7)


        changeGauge(document.getElementById("versGauge_2"), 9)
        changeGauge(document.getElementById("durabilityGauge"), 4)
        changeGauge(document.getElementById("budgetGauge"), 6)


        changeGauge(document.getElementById("fitScore2"), 91)


        
    }
)
*/