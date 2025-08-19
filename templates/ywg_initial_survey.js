
// useless at this point - will implement later
function showSearchResults() {
        const searchBox = document.getElementById("feature-search-box");
        const searchDisplay = document.getElementById("feature-search-display");
        searchDisplay.style.display = "block";
        searchBox.classList.add("searchbox-focused");
}
// useless at this point - will implement later
function hideSearchResults() {
    const searchDisplay = document.getElementById("feature-search-display");
    searchDisplay.style.display = "none";
    const searchBox = document.getElementById("feature-search-box");
    searchBox.classList.remove("searchbox-focused");
}

document.addEventListener("DOMContentLoaded", function() {
    let step0choice = -1
    const submitButton = document.getElementById("submitButton");
    const watchBrandInput = document.getElementById("watchBrandInput");
    const movementType = document.getElementById("movementType");
    let shown_features = [];

    // popup close event
    $("#popup-body > button").click(function(){
        $("#popup-container").fadeOut(200)
    })
    
    movementType.addEventListener("change", function() {
        if (movementType.value === "specific") {
            specificMovement.style.display = "inline";
        }else {
            specificMovement.style.display = "none";
        }
    });
    
    // search box functionality

    const featureSearchBox = document.getElementById("feature-search-box");

    // open search results on focus
    featureSearchBox.addEventListener("focus", function() {
        showSearchResults();
    });
    // filter search results on input
    featureSearchBox.addEventListener("input", function() {
        const searchTerm = featureSearchBox.value.toLowerCase();
        const searchResults = document.querySelectorAll(".feature-item.button-text");
        let found = false;
        searchResults.forEach(function(item) {
            const featureText = item.textContent.toLowerCase();
            if (featureText.includes(searchTerm)) {
                item.style.display = "block";
                found = true;
            } else {
                item.style.display = "none";
            }
        });
        if (found) {
            showSearchResults();
        } else {
            hideSearchResults();
        }
    });
    $("#show-help-popup").click(function(){
        $("#popup-container").fadeIn(100)
    })
    const searchResults = document.querySelectorAll(".feature-item.button-text");
    console.log("Search results:", searchResults);
    const searchDisplay = document.getElementById("feature-search");

    searchDisplay.addEventListener("click", function(event) {
        featureSearchBox.focus();
    })

    function hideStep(step) {
        document.getElementById(`step${step}`).style.display = "none";
    }  
    // Collapsible functionality
    const collapsible = document.querySelectorAll(".collapsible");
    collapsible.forEach(function(collapsibleItem) {
        collapsibleTitle = collapsibleItem.querySelector(".collapsible-title");
        const content = collapsibleItem.querySelector(".collapsible-content");
        collapsibleTitle.addEventListener("click", function() {
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
        content.style.display = "none"; // Initially hide the content
        collapsibleTitle.style.cursor = "pointer"; // Set cursor to pointer for collapsible titles
    });
    $("#restartButton").hide(); // Hide the restart button initially
    $("#restartButton").click(function() {
        // Reset all steps and data
        window.location.reload();
    });
    

    // Step 0 content click events
    const step0Content = document.querySelectorAll(".step0-content.button-text:not(.disabled)");
    let step = 0;
    step0Content.forEach(function(content) {
        content.addEventListener("click", function() {
            let stepTxt = document.getElementById("step");
            step += 1;
            $("#restartButton").show();

            stepTxt.innerText = `Step ${step})`;
            if( content.id === "step0-choice1") {
                step0choice = 1;
                document.getElementById("step1-option1").style.display = "block";
                updatePrompt(" I know which watch model I want to buy.", false);
            } else if (content.id === "step0-choice2") {
                step0choice = 2;
                document.getElementById("step1-option2").style.display = "block";
                updatePrompt(" I'm unsure of which watches I want to buy. These are some features I would like though.", false);
            }
            document.getElementById("step0").style.display = "none";
            document.getElementById("submitFormButton").style.display = "block";
            document.getElementById("prompt-submission").style.display = "block";
            
        });
    });

    let additionalFeatureBoxes = {}
    const additionalFeatureSelectors = document.querySelectorAll(".additional-feature-selector");
    additionalFeatureSelectors.forEach(function(selector) {
        const featureName = selector.getAttribute("data-feature");
        additionalFeatureBoxes[featureName] = selector;
    });
    // update "additional features" section based on selected features
    function updateFeaturesShown(featureList) {
        const shownFeaturesContainer = document.getElementById("shown-features");
        const allFeatures = document.querySelectorAll(".additional-feature-selector");
        allFeatures.forEach(function(featureBox) {
            featureBox.style.display = "none"; // Hide all initially
        });
        featureList.forEach(function(featureName) {
            additionalFeatureBoxes[featureName].style.display = "flex";
        });
    }
    const featureList = document.querySelectorAll(".feature-item")
    featureList.forEach(function(item) {
        item.addEventListener("click", function() {
            const feature = item.getAttribute("data-feature");
            if (shown_features.includes(feature)) {
                shown_features = shown_features.filter(f => f !== feature);
                item.classList.remove("selected");
            } else {
                shown_features.push(feature);
                item.classList.add("selected");
            }
            console.log("Selected features:", shown_features);
            updateFeaturesShown(shown_features)
        });
    });

    submitFormButton.addEventListener("click", function() {
        const brand = watchBrandInput.value;
        if(step === 1){
            if(step0choice === 1){
                document.getElementById("step1-option1").style.display = "none";
            }
            else if (step0choice === 2) {
                document.getElementById("step1-option2").style.display = "none";
            }
            processPrompt(step, step0choice);
            document.getElementById("step2").style.display = "block";

            let stepTxt = document.getElementById("step");
            step += 1;
            stepTxt.innerText = `Step ${step})`;
        }
        else if(step === 2){
            step += 1;
            document.getElementById("step2").style.display = "none";
            document.getElementById("step3").style.display = "block";
            let stepTxt = document.getElementById("step");
            stepTxt.innerText = `Step ${step})`;
            processStep2();
        }
        else if (step === 3) {
            processStep3();
            step += 1;
            document.getElementById("step3").style.display = "none";
            document.getElementById("step4").style.display = "block";
            $("#submitText").fadeIn()
            $("#submitWatchToServer").fadeIn()
            document.getElementById("submitFormButton").style.display = "none";
            let stepTxt = document.getElementById("step");
            stepTxt.innerText = `Step ${step})`;
        }

       // document.getElementById("result").innerText = resultText;
    });

    // step 3 functions
    const costValueLowerbound = document.getElementById("cost-value-lowerbound");
    const costValueUpperbound = document.getElementById("cost-value-upperbound");
    const pricingStrategy = document.getElementById("pricingStrategy");
    const costRange = document.getElementById("cost-range");
    let pricingStrategyValue = pricingStrategy.value;
    document.querySelector(".pricing-strategy.hover-info-mark").addEventListener("mouseover", function() {
        const hoverInfo = document.querySelector(".pricing-strategy.hover-info");
        hoverInfo.style.display = "block";
    });
    document.querySelector(".pricing-strategy.hover-info-mark").addEventListener("mouseout", function() {
        const hoverInfo = document.querySelector(".pricing-strategy.hover-info");
        hoverInfo.style.display = "none";
    });
    pricingStrategy.addEventListener("change", function() {
        if(pricingStrategy.value === "strict") {
            costRange.style.color = "red";
        } else if (pricingStrategy.value === "moderate") {
            costRange.style.color = "orange";
        } else {
            costRange.style.color = "green";
        }
    });
    function updateCostRange() {
        const lowerBound = parseFloat(costValueLowerbound.value);
        const upperBound = parseFloat(costValueUpperbound.value);
        if (isNaN(lowerBound) || isNaN(upperBound)) {
            costRange.innerText = "Invalid cost range";
            return;
        }
        if (lowerBound === upperBound) {
            costRange.innerText = `$${lowerBound}`;
        } else {
            costRange.innerText = `$${lowerBound} - $${upperBound}`;
        }
    }
    costValueLowerbound.addEventListener("input", function() {
        const lowerBound = parseFloat(costValueLowerbound.value);
        const upperBound = parseFloat(costValueUpperbound.value);
        if (lowerBound > upperBound) {
            costValueUpperbound.value = lowerBound;
        }
        updateCostRange();
    });
    costValueUpperbound.addEventListener("input", function() {
        const lowerBound = parseFloat(costValueLowerbound.value);
        const upperBound = parseFloat(costValueUpperbound.value);
        if (upperBound < lowerBound) {
            costValueLowerbound.value = upperBound;
        }
        updateCostRange();
    });
    document.getElementById("submitWatchToServer").addEventListener("click", function() {
        
        // window.location.replace("ywg_result.html")
        console.log("Data submitted:", data_string);
        fetch('/api/submitpart1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: data_string })
        })
        .then(response => response.json())
        .then(data => {
            document.cookie = 'id=' + data.id + ';'
            if (data.status === "success") {
                window.alert("Watch details submitted successfully!");
                window.location.replace("ywg_preferences.html");
            } else {
                alert("Error submitting data: " + data.message);
            }
        })
    });

    
});

document.addEventListener("click", function(event) {
    const searchBox = document.getElementById("feature-search-box");
    const searchDisplay = document.getElementById("feature-search");
    // Check if click is inside search box or search results
    if (
        !searchBox.contains(event.target) &&
        !searchDisplay.contains(event.target)
    ) {
        hideSearchResults();
    }
});