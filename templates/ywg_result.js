function regenerateReport() {
    // Function to regenerate the report
    result = postData("/api/regeneratereport", {id: curId})
    result.then(function(data){
        if(data['status'] == "success"){
            alert("Report regenerated successfully!");
            window.location.reload(); // Reload the page to show the new report
        } else {
            alert("Error regenerating report: " + data['message']);
        }
    }).catch(function(error) {
        console.error("Error during report regeneration:", error);
        alert("An error occurred while regenerating the report. Please try again later.");
    });
}

function sendToReportPage(element){
    elementJQ = $(element)
    const requested_report_no = elementJQ.data("report-no")
   // console.log(requested_report_no)
    // save requested report as a cookie so we remember it once we reach the /ywg_report page
    document.cookie=`requested_report_no=${requested_report_no};`
    // console.log(`Just to check, that was ${getCookie("requested_report_no")}`)
    window.location.href='/see_report'
}
function loadLegacyReport(element){
    if(element.value == "none"){
        // do nothing
    } else {
        const selected_index = element.selectedIndex
        const selected_element = element.options[selected_index]
        sendToReportPage(selected_element)
    }
}

document.addEventListener("DOMContentLoaded", function() {
// Fetch the result from the server
$("#result").text("Loading...");
if(document.cookie === undefined || document.cookie === "") {
    window.location.href = "/"; // Redirect to home page if no cookie is found
    return;
}
curId = document.cookie.split('; ').find(row => row.startsWith('id=')).split('=')[1];
if(curId === undefined || curId === "") {
    window.location.href = "/"; // Redirect to home page if no ID is found
    return;
}
$("#result").text("Request # " + curId);
$("#id-span").text(curId);
$("#footer-id").text(curId);

$("#restartButton").click(function() {

    // Reset all steps and data
    deleteAllCookies()
    window.location.href = "/findyourwatch"; // Redirect to the main page
});
var contentDict = {}
var links = {2: "ywg_preferences.html", 3: "ywg_result.html"};
content_by_id = postData("/api/getcontentbyid", {id: curId})





content_by_id.then(function(data){
    contentDict = data['content']['part1_content'];
    
    $("#watch-brand").text(contentDict['watchBrand']);
    $("#watch-model").text(contentDict['watchModel']);
    $("#additional-requests").text(contentDict['specialRequests'])
    if(contentDict['additionalInfo'] != null && contentDict['additionalInfo'] !== "") {
        $("#watch-container").append("&nbsp<span>(" + contentDict['additionalInfo'] + ")</span>");
    }
    current_step = data['content']['step'];
    $("#watch-container").append("<ul id='current-steps'></ul>");
    for (var i = 1; i < 4; i++) {
        if(i > current_step - 1){
            $("#current-steps").append("<li><a href='" + links[i] + "' class='no-underline-link'>Step " + i + ": ❌</a></li>");
            break
        } else {
            $("#current-steps").append("<li>Step " + i + ": ✔️</li>");
        }
    }
    // console.log(current_step)
    // console.log(data['content'])

    // if current step is 3, this means it's time to generate the report
    if(current_step >= 3){
        // report_generated = data['content']['report_generated']
        report_generated = data['content']['report']
        var socket = io()
        socket.emit("join", curId)
        
        // currently generating report - needs to connect to socketio
        if(report_generated == false){

            $("#current-steps").fadeOut()
            // to do here: use socketio to tell when report is generating.
           // alert("Watch done! Generating report.")
            $("#watch-container").append("<div class='centered-in-div' id='loading-box'><h2>Generating report...</h2><br><p id='reportStatus' style='color: red'></p><img src='resources/blue_loading.gif' onContextMenu='return false;'></div>")
            generateReport = postData("/api/generatereport", {id: curId})
            generateReport.then(function(data){
                $("#reportStatus").text(data['message'])
            })
            socket.on("refresh",
                function(data){
                    window.location.reload()
                }
            )


        }
        else {
            console.log(data)
            reportCredits = data['content']['report_credits']
            $("#result").append(` |\n<span>${reportCredits} Regeneration Credits<span>`)
            reportTimes = data['content']['report_generated_times']
            $("#current-steps").hide()
            // alert("Your report has been completed.")
            $("#watch-container > #loading-box").hide()
            $("#watch-container").append("<div class='centered-in-the-div' id='report-box'></div>")
            $("#report-box").append(`<p data-report-no='${reportTimes}' class='link-p' onclick='sendToReportPage(this)'>See your personalized YWG report #${reportTimes}</p><br>`)
            if(reportTimes > 1){
                let report_select = $("<select id='old-reports-selector' onchange='loadLegacyReport(this)'><option value='none'>Or, select a older report.</option></select>")
                for(let i = reportTimes-1; i > 0; i--){
                    report_select.append(`<option data-report-no='${i}'>YWG Report #${i}</option>`) // will redirect user to this report # when called
                }
                $("#report-box").append(report_select)
            }
            
            $("#report-box").append("<button id='regenerate' onclick='regenerateReport()'>Regenerate your Report (1 credit)</button>")
            $("#report-box").append("<a href='/demoreport'>Confused on how to read your report?</a>")
        }

    }
    console.log("Content fetched: ", contentDict);
})

});