/* Client UI for students submitting messages and photos */
var $ = require('jquery');
require('bootstrap');
$(function() {
  
  function showAlert(msg) {
    // TODO: If already visible, hide first
    var a = $("#alert");
    $("#alerttext").text(msg);
    a.slideDown();
    window.setTimeout(function() { a.slideUp(); }, 2000);
  }
  
  function closeMessagePanel() {
    $("#toppage,#msgpage").toggleClass("panel-hidden");
    $("textarea").val("").trigger("change");
  }

  function submitmsg(msg) {
    var dispmodal = true;
    window.setTimeout(function() {
      if(dispmodal) {
        $("#msgmodal").modal("show");
        dispmodal = false;
      }        
    }, 500);
    $.ajax({
      data: {message: msg},
      method: "POST",
      url: "sapi/message"
    })
    .always(function() { dispmodal = false; $("#msgmodal").modal("hide"); })
    .done(function() { closeMessagePanel(); showAlert("Message sent!"); })
    .fail(function() { alert('There was a problem. Please try again.'); })
  }
  
  function submitimg(img) {
    var dispmodal = true;
    window.setTimeout(function() {
      if(dispmodal) {
        $("#msgmodal").modal("show");
        dispmodal = false;
      }        
    }, 500);

    var fd = new FormData();
    fd.append('image', img);
    $.ajax({
      data: fd,
      contentType: false,
      processData: false,
      method: "POST",
      url: "sapi/image",
    })
    .always(function() { dispmodal = false; $("#msgmodal").modal("hide"); })
    .done(function() { showAlert("Image sent!"); })
    .fail(function() { alert('There was a problem. Please try again.'); })
  }
  
  
  $("button").addClass("btn");
  $("#msgbutton").on("click", function() {
      $("#toppage,#msgpage").toggleClass("panel-hidden");
    });
  $("#cancelmsg").on("click", function() {
      closeMessagePanel();
    });
  $("#submitmsg").on("click", function() {
      submitmsg($("textarea").val());
    });
  $("#imginput").on("change", function() {
      submitimg($("#imginput")[0].files[0]);
    });
  $("textarea").on("keyup change cut paste input propertychange", function() {
    var val = $(this).val();
    if(val.length>0) {
      $("#submitmsg").prop("disabled", "");
    }
    else {
      $("#submitmsg").prop("disabled", "disabled");
    }
  });
});
