// script unique to index.html
window.onload = function(){
    // If id is part of cookies, go to results.html since user is already logged in.
    const id = getCookie("id")
    if(id !== undefined && id!==""){
        window.location.href="/results"
    }


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

    const texts = ["find your next watch.", "discover styles you’ll love.", "rank based on YOUR scale!", "jumpstart your collecting journey.", "reduce your buyers remorse.", "unearth your next grail!", "find the best grad gift!", "dress you to impress.", "visualize complex watch performance stats."];
    const typingElement = document.getElementById("typing-effect");

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentText = texts[textIndex];

      if (!isDeleting) {
        // typing forward
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
          isDeleting = true;
          setTimeout(typeEffect, 1500); // pause at end of word
          return;
        }
      } else {
        // deleting
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % texts.length; // loop through texts
        }
      }

      const speed = isDeleting ? 45 : 95; // typing vs deleting speed
      setTimeout(typeEffect, speed);
    }

    typeEffect();


}