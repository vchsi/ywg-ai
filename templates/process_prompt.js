// process_prompt.js: Where the json string from part 1 is written
let data_string = {"Version": "1.3"};

function updatePrompt(text, replace = false) {
    let promptText = document.getElementById("prompt-text");
    if (replace) {
        promptText.innerText = text;
    } else {
        promptText.innerText += text;
    }
}
function getInputValue(input, allowEmpty = false) {
    let value = input.value.trim();
    if (value === "" && !allowEmpty) {
        alert("Please fill in the required field.");
        return null;
    }
    return value;
}
function processStep1Option1() {
    let watchModel = $("#watchBrandInput").val() + " " + $("#watchModelInput").val();
    data_string["watchBrand"] = getInputValue(document.querySelector("#watchBrandInput"), true);
    data_string["watchModel"] = getInputValue(document.querySelector("#watchModelInput"), true);
    data_string["purchaseDecision"] = "exact_model"
    data_string["additionalInfo"] = getInputValue(document.querySelector("#additionalInfo"), true);
    let additionalInfo = data_string["additionalInfo"] ? ` I would like to add the following information: ${data_string["additionalInfo"]}.` : "";
    updatePrompt(` I want to buy the ${watchModel}.${additionalInfo}`, false);
    

}
function processStep2(){
    let specialRequests = getInputValue(document.getElementById("specialRequests"), true);
    if (specialRequests) {
        data_string["specialRequests"] = specialRequests;
        updatePrompt(` I would like to add the following options: ${specialRequests}.`, false);
    } else {
        data_string["specialRequests"] = "no additional options at this time";
    }
}
function processStep3() {
    let lowerBound = getInputValue(document.querySelector("#cost-value-lowerbound"), true);
    let upperBound = getInputValue(document.querySelector("#cost-value-upperbound"), true);
    if (lowerBound && upperBound) {
        data_string["priceRange"] = {
            "lowerBound": lowerBound,
            "upperBound": upperBound
        };
        updatePrompt(` I would like to buy a watch in the price range of $${lowerBound} to $${upperBound}.`, false);
    }
    else {
        alert("Please fill in both price range fields.");
        return;
    }
    data_string["pricingStrategy"] = document.querySelector("#pricingStrategy").value;
    updatePrompt(` I would like to use the ${data_string["pricingStrategy"]} pricing strategy.`, false);
 
    let promptText = document.getElementById("prompt-text");
    promptText.innerText += " I have provided all the information I can. Please help me find the best watch for me.";
   
}
function processPrompt(step, choice) {
    let promptText = document.getElementById("prompt-text");
    let stepText = `Step ${step}: `;
    if (choice === -1) {
        alert("Please make a choice before proceeding.");
        return;
    } else if (choice === 1) {
        stepText += "Choice 1 made.";
        processStep1Option1();
    } else {
        stepText += `Choice ${choice} made.`;
    }

}



