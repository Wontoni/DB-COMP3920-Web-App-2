$(document).ready(async function () {
    $("#addButton").click(function () {
      let desc = $("#inputDescription").val();
      var test = $.post("/createTodo",
          {
             description: desc
          },
          function (data, status, xhr) {
            console.log("DATA---------");
            console.log(data);
            var table = $("#todoTable tbody");
            $("#inputDescription").val('');
            table.append(data);
          });
    });
 });