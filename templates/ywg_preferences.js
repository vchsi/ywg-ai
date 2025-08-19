document.addEventListener("DOMContentLoaded", function() {
    // Fetch the result from the server - common for every page in YWG
    if(document.cookie === undefined || document.cookie === "") {
        window.location.href = "/"; // Redirect to home page if no cookie is found
    
    }
    curId = document.cookie.split('; ').find(row => row.startsWith('id=')).split('=')[1];
    if(curId === undefined || curId === "") {
        window.location.href = "/"; // Redirect to home page if no ID is found
        return;
    }
    // start unique

    var part = 0
    var data = {"id": curId};
    var dataParts = {}
    var partInitializers = {1: part1(), 2: function(){part2()}, 3: function(){part3()}, 4: function(){part4()}}
    var shown = {}
    var partTitles = {1: "watch_customer_info", 2: "watch_customer_history_experience", 3: "watch_report_features"}
    $("#result").text("Request # " + curId);
    $("#id-span").text(curId);
    $("#footer-id").text(curId);

    $("#restartButton").click(function() {

        // Reset all steps and data
        window.location.href = "/findyourwatch"; // Redirect to the main page
    });
    $("#id-login").click(function() {
        window.location.href = "/login"; // Redirect to the login page
    });
    $("#part0").show();
    // start of form functionality
    $("#startButton").click(function() {
        part++;
        part1()
        $("#part0").hide();
        $("#part1").fadeIn();
        $("#continueButton").fadeIn();
    });
    // preliminary functionality
    $(".include-close-button").each(function() {
        $(this).append('<button class="close-button">X</button>');
        $(this).find(".close-button").css({
            "background-color": "red",
            "border-radius": "50%",
        })
        $(this).find(".close-button").click(function() {
            $(this).closest(".include-close-button").fadeOut();
            shown[this.parentElement.id] = false;
            // the optional box is a child of the input, which means it should have its id
        });
    });
    $("#continueButton").click(function(){
        curPartDataKeys = dataParts[part][0]
        curPartDataInputs = dataParts[part][1]
        temp = {}
        for (const [id, visible] of Object.entries(shown)){
            if(visible == true && id != "undefined"){
                console.log($("#"+curPartDataInputs[id]).prop("tagName"))
                if($("#"+curPartDataInputs[id]).is(":checkbox")){
                    temp[curPartDataKeys[id]] = $("#"+curPartDataInputs[id]).is(":checked")
                }
                else if($("#"+curPartDataInputs[id]).prop("tagName") == "SELECT" ||
                 $("#"+curPartDataInputs[id]).prop("tagName") == "INPUT" || $("#"+curPartDataInputs[id]).prop("tagName") == "TEXTAREA"){
                    temp[curPartDataKeys[id]] = $("#"+curPartDataInputs[id]).val()
                } else {
                    temp[curPartDataKeys[id]] = $("#"+curPartDataInputs[id]).text()
                }
            }
        }
        data[partTitles[part]] = temp
        console.log(data)
        // to add: validate inputs are filled here;
        $("#part" + part).hide()
        part++;
        partInitializers[part].call()
        $("#part" + part).fadeIn()
    })
    // part 1 functionality
    // dictionary for keeping track of which values are chosen, where to read


    console.log(part)
    function part1(){
        var part1Data = {
            "watchIsFor": "for",
            "watchIsForOther": "otherRecipient",
            "watchIsForOccasion": "occasion",
            "watchIsForGift": "gift",
            "watchIsForOtherOccasion": "otherOccasion"
        }
        var part1DataInputs = {
            "watchIsFor": "watchIsFor",
            "watchIsForOther": "watchIsForOtherInput",
            "watchIsForOccasion": "watchIsForOccasion",
            "watchIsForGift": "watchIsForGiftInput",
            "watchIsForOtherOccasion": "watchIsForOtherOccasionInput"
        }
        dataParts[1] = [part1Data, part1DataInputs]
        shown = {
            "watchIsFor": true,
            "watchIsForOther": false,
            "watchIsForOccasion": true,
            "watchIsForGift": false,
            "watchIsForOtherOccasion": false
        }
        
        $("#watchIsFor").change(function() {
            console.log("Watch is for: " + $("#watchIsFor").val());
            if ($("#watchIsFor").val() === "other") {
                $("#watchIsForOther").show();
                $("#watchIsForGift").hide();
                shown["watchIsForOther"] = true
                shown["watchIsForGift"] = false
            } else if ($("#watchIsFor").val() === "gift") {
                $("#watchIsForOther").fadeOut();
                $("#watchIsForGift").show();
                shown["watchIsForOther"] = false
                shown["watchIsForGift"] = true
            } else {
                $("#watchIsForOther").fadeOut();

                $("#watchIsForGift").fadeOut();
                shown["watchIsForOther"] = false
                shown["watchIsForGift"] = false
            }
        });
        $("#watchIsForOccasion").change(function() {
            if ($("#watchIsForOccasion").val() === "none") {
                $("#watchIsForOtherOccasion").fadeOut();
                shown["watchIsForOtherOccasion"] = false
            } else {
                $("#watchIsForOtherOccasion").show();
                shown["watchIsForOtherOccasion"] = true
            }
        });
    }

    // part 2
    function part2(){
       // console.log(data["for"])
        if(data["for"] != "myself"){
            $("#switchable-p2").text("does the recipient")
        }
        var part2Data = {
            "intoWatches": "customer_is_into_watches",
            "previousWatchCollection": "customer_owns_a_previous_watch_collection",
            "ownedNumberOfWatches": "customer_watch_count",
            "watchCollectionOverview": "customer_collection_overview"
        }
        var part2DataInputs = {
            "intoWatches": "intoWatchesInput",
            "previousWatchCollection": "previousWatchCollectionInput",
            "ownedNumberOfWatches": "ownedNumberOfWatches",
            "watchCollectionOverview": "watchCollectionOverview"
        }
        dataParts[2] = [part2Data, part2DataInputs]
        shown = {
            "intoWatches": true,
            "previousWatchCollection": true,
            "ownedNumberOfWatches": false,
            "watchCollectionOverview": false
        }
        $("#intoWatches > .choice").click(function(){
            currentChoice = $("#intoWatches > .selected")
          //  console.log(currentChoice)
            console.log($(this).attr('id'))
            if($(this).attr('id') != currentChoice.attr('id')){
                currentChoice.removeClass("selected")
                this.classList.add("selected")
                $("#intoWatchesInput").text($(this).attr('id'))
            }
        })

        $("input[type='radio'][name='ownedPreviousWatch']").change(function(){
            $("#previousWatchCollectionInput").value = $("input[name='ownedPreviousWatch']:checked".value)
            if($("input[name='ownedPreviousWatch']:checked").val() == "yesOwnedWatches"){
                $("#stateOfCollection").show()
                shown["ownedNumberOfWatches"] = true
                shown["watchCollectionOverview"] = true
            } else {
                $("#stateOfCollection").hide()
                shown["watchCollectionOverview"] = false
                shown["watchCollectionOverview"] = false
            }
        })

        $("#stateOfCollection > .close-button").click(function(){
            shown["watchCollectionOverview"] = false
            shown["watchCollectionOverview"] = false
        })



    }

    // part 3
    function part3(){
        var comfortValues = {
            "noIntoWatches": 1,
            "somewhatIntoWatches": 2, 
            "yesIntoWatches": 3, 
        }
        var possiblePart3Features = {
            1: {
                "isSmartwatch": "Smartwatch (internet capable)",
                "wr_minimum_100": "Water Resistant for Swimming (100m+)",
                "accurate": "How Accurate a Watch Is",
                "how_long_it_lasts": "Battery / Movement PR Length (out of 10)",
                "durability": "Durability",
                "outfitVersatility": "Outfit Versatility (How well it works with different outfits)"
            },
            2: {
                "diveCapable": "How Capable It is for Diving",
                "goodValueRetention": "How Well it holds Value",
                "strapCapability": "How Strap Friendly it is"
            },
            3: {
                "modFriendly": "Mod Friendly? (IYKYK)",
                "lowMaintenance": "Low Servicing/Maintenance Expense",
                "authorizedDealerNetwork": "The AD/Authorized Service Center Network Strength (higher=more convenient/widespread)"
            }
        }
        var part3Data = {}
        var part3DataInputs = {}

        comfortValue = comfortValues[data[partTitles[2]]["customer_is_into_watches"]]
        checkboxGrid = $("#features-checkbox-grid")
        for ([value, category] of Object.entries(possiblePart3Features)){
            if(value <= comfortValue){
                checkboxGrid.append("<h3>Level "+value+" features</h3><div id='values"+value+"' class='grid-div'></div>")
                curLevelDiv = $("#features-checkbox-grid > #values"+value)
                for ([id, labelText] of Object.entries(possiblePart3Features[value])){
                    curLevelDiv.append(`<label for=${id} class="adjacent-label"><input type='checkbox' name=${id} id=${id}>\n
                        ${labelText}</label>`)
                    part3Data[id] = id
                    part3DataInputs[id] = id
                    shown[id] = true
                }
            }
        }
        dataParts[3] = [part3Data, part3DataInputs]

    }
    // part 4 - final sentence + submit for report
    function part4(){

        $("#continueButton").hide()
        $("#submitButton").fadeIn()
        
        $("#customer-desire-sentence").on('input', function(){
            response_leng = $(this).val().length
            $("label[for='customer-desire-sentence']").text(`${150-response_leng} characters remianing`)
        })
    }
    
    $("#submitResult").on("click", function(){
        part4res = {"customer-desire-sentence": $("#customer-desire-sentence").val() , "additional_things_to_include_on_report": $("#additional-concerns-text").val()}
        
        data["additional_requests_for_report"] = part4res
        // console.log(data)

        result = postData("/api/submitpart2", data)
        result.then( data => {
            if(data.status === "success"){
                window.alert("Watch details submitted! Redirecting to generate report.")
                window.location.replace("/results")
            } else {
                alert("Error submitting data: " + data.message)
            }
        }
            
        )
        

    });
});