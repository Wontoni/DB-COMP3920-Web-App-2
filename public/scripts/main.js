$(document).ready(async function () {
    $("#addButton").click(function () {
      let desc = $("#inputDescription").val();
      $.post("/createTodo",
          {
             description: desc
          },
          function (data, status, xhr) {
            console.log("DATA---------");
            console.log(data);
            $("#inputDescription").val('');
            var table = $("#todoTable tbody");
            // table.append('<tr> <th>' + $("#todoTable > tbody > tr").length + ' </th> <th>' + desc + '</th> </tr>');
          });
    });
 });