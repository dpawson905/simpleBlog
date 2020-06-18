(function ($) {


  /*global $:true, jQuery:true */

  function checkPasswordMatch() {
    var password = $("#password").val();
    var confirmPassword = $("#password2").val();

    if (password != confirmPassword)
      $("#checkPw")
        .addClass("form-error")
        .removeClass("form-success")
        .html("Passwords do not match!");
    else
      $("#checkPw")
        .addClass("form-success")
        .removeClass("form-error")
        .html("Passwords match."),
        $("#registerButton").prop("disabled", false);
  }

  var $nav = $(".fixed-top");
  var $nav1 = $(".fixed-bottom");

  var $navHeight = $(".header-img");
  var $profileHeight = $(".profile-hero");

  $(document).scroll(function () {
    $nav.toggleClass(
      "scrolled",
      $(this).scrollTop() > $navHeight.height() - 50 ||
        $(this).scrollTop() > $profileHeight.height()
    );

    $nav1.toggleClass("scrolled", $(this).scrollTop() > $nav1.height());
  });

  $("#password2, #checkPw").keyup(checkPasswordMatch);

  window.setTimeout(function () {
    $(".toast").slideUp(500, function () {
      $(this).remove();
    });
  }, 10000);

  
})(jQuery); // end of jQuery name space
