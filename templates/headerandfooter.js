document.addEventListener("DOMContentLoaded", function() {
    $("#id-login").click(function() {
        window.location.href = "/login";
    });
    
    $("#header > h1").on("click", function(){
        window.location = "/"
    })
    $("footer > p").click(function(){
        window.open("https://www.github.com/vchsi","_blank")
    })
});