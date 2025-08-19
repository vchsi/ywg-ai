document.addEventListener("DOMContentLoaded", function(){
    if(document.cookie === undefined || document.cookie === "") {
        window.location.href = "/"; // Redirect to home page if no cookie is found
    
    }
    curId = document.cookie.split('; ').find(row => row.startsWith('id=')).split('=')[1];
    if(curId === undefined || curId === "") {
        window.location.href = "/"; // Redirect to home page if no ID is found
        return;
    }
    // start unique
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
    // get requested report no
    const requested_report_no = getCookie("requested_report_no")
    if(requested_report_no == "" || isNaN(requested_report_no)){
        window.location.href = "/results"
    }


    // part 1 - get report (if any)
    reportResponse = postData('/api/getreportbyid', {"id": curId, "requested_report_no": requested_report_no})
    reportResponse.then(function(data){
        if(data['status'] == "success"){
            content = data['content']
            watchesList = content['output']
            generateReport(watchesList, curId, $("#main-content"))

        } else {
            alert(data['message'])
        }
    })
})