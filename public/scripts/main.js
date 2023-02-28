$(document).ready(async function () {
    $("#addButton").click(function () {
      let desc = $("#inputDescription").val();
       return $.post("/createTodo",
          {
             description: desc
          },
          function (data, status) {
            $("#inputDescription").val('');
            var table = $("#todoTable tbody");
            // table.append('<%- include(templates/todoItem , {todoItem:' + desc + ', index:' + $("#todoTable > tbody > tr").length + '})  %>');
            table.append('<tr> <th>' + $("#todoTable > tbody > tr").length + ' </th> <th>' + desc + '</th> </tr>');
            // console.log(success);
            // table.append(success);
          });
    });
 });