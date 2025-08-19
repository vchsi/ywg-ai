const PREVIEW_DESCRIPTIONS = {
    "status-bar": {
        "title": "Watch Basic Information Bar",
        "descr": {
            "Tells you some basic facts about your watch and its specifications, like: ": "p",
            "": "ul",
            "the Suggested Retail Price <b>(MSRP)</b>": "li",
            "the thing that's powering the watch <b>(the Movement)</b>": "li",
            "the release date of the watch.": "li"
        }
    },
    "ranking": {
        "title": "Ranking Circle",
        "descr": {
            "Lists how well this watch ranks in our generated report of multiple best-fit watches, based on score.": "p"
        }
    },
    "fit-score": {
        "title": "Watch Fit Score",
        "descr": {
            "A interactive gauge which shows how well YWG determined this watch fits your specific needs, requirements, and budget.": "p",
            "This scale is also color-coded for easy visibility and comprehension.": "p"
        }
    },
    "watch-images": {
        "title": "Watch Image Carousel",
        "descr": {
            "Provides a few glances of the desired watch to inform your purchasing decision and give you a idea on what to expect. Click on the blue boxes below to try it out!": "p",
            "<b>Note that some images may be inaccurate, so we've provided a few to ensure accuracy.</b>": "p"
        }
    },
    "watch-fit-paragraph": {
        "title": "Watch Fit Paragraph",
        "descr": {
            "A paragraph prepared by YWG explaining why it recommends this watch, catered to your preferences and survey results.": "p"
        }
    },
    "watch-stats": {
        "title": "Watch Facts Display",
        "descr": {
            "Provides a list of important watch statistics users should consider before purchasing.": "p",
            "": "ol",
            "<b>Water Resistance</b>: The rated depth a watch can handle underwater.": "li",
            "<b>Material</b>: The case material and the crystal (glass top) material": "li",
            "<b>Case Diameter</b>: The size of the watch's dial (not including the lugs)": "li",
            "<b>Lug-to-Lug</b>: The distance between one end of the watch to another.": "li",
            "<b>Strap Width</b>: Width of compatible straps (and spring bars)": "li",
            "<b>Great fit for</b>: Compatible wrist sizes": "li"
        }
    },
    "gauges-grid": {
        "title": "Personalized Watch Gauges",
        "descr": {
            "Easy-to-read, numerical, color-coded gauges representing a watch's performance in certain areas of your choice.": "p",
            "<br>Our survey <b>includes 8 options which we can rank</b>, but in the future, you will be able to add many more, so stay tuned!": "p"
        }
    },
    "gauge-analysis": {
        "title": "Deeper Analysis Section",
        "descr": {
            "Justification on why each factor is scored the way that it is.": "p"
        }
    },
    "pricing-meter": {
        "title": "Watch Pricing Bar Chart",
        "descr": {
            "An interactive bar chart which informs the user visually of the watch's price trends, MSRP, and other important data. ": "p",
            "": "ul",
            "<b>Orange Bar</b>: Average Market Price Range (low avg-high avg)": "li",
            "<b>Blue Bar</b>: The customer's stated price range, along with their flexibility to overspend/underspend out of their budget." : "li",
            "<b>Triangle</b>: MSRP of a watch model, color coded with customer's pricing preference": "li",
            "<b>Green/Red Bar</b>: Not always visible. Overflow bar, which is how much the two price ranges differ.": "li"
            
        }
    },
    "conclusion": {
        "title": "Report Conclusion",
        "descr": {
            "A succinct conclusion and takeaways section on the watch's features, and how it appeals to your unique preferences.": "p"
        }
    }
}
// script to enable report preview mode for new users (opens popups and hovers for extended information)
window.onload = function(){
    $(".login-button").each(function(i){
        $(this).click(function(){
            window.location.href="/login"
            
            })
    });
    $(".start-new-button").each(function(i){
        $(this).click(function(){
            window.location.href="/findyourwatch"
        })
    })
    $("#get-started-dropdown").on("mouseenter", function(i){
        $(this).find(".dropdown-content").show()
    })

    $("#get-started-dropdown").on("mouseleave", function(i){

        console.log("here")
        $(this).find(".dropdown-content").hide()
    })

    const allReqdPreviews = $(".preview")
    console.log(allReqdPreviews)
    allReqdPreviews.each(function(i){
        val = $(allReqdPreviews[i])
        console.log(val)
        val.click(function(){
            $("#popup-content")[0].innerHTML = ""
            val = $(allReqdPreviews[i])
            const data_val = val.data("preview-id")

            const preview_content = PREVIEW_DESCRIPTIONS[data_val]
            let curListed = false
            curList = $("#popup-content").append(`<ul></ul>`)
            $("#popup-title").text(preview_content["title"])
            for ([content, tag] of Object.entries(preview_content["descr"])){
                if(curListed == true && tag != "li"){
                    curListed = false;
                    $("#popup-content").append(curList)
                }
                if(tag == "p" || tag == "h3"){
                    $("#popup-content").append(`<${tag}>${content}</${tag}>`)
                } else if (tag == "ul" || tag == "ol"){
                    curList = $("#popup-content").append(`<${tag}></${tag}>`)
                    curListed = true
                }
                else if (tag == "li" && curListed){
                    curList.append(`<li>${content}</li>`)
                } else {
                    curList.append(`${content}`) // if a tag, whole tag must be in content
                }
            }
            $("#popup-container").fadeIn()
        })

        $("#close-popup").click(function(){
            $("#popup-container").fadeOut()
        })
    })
}