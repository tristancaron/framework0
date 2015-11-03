'use strict';

function confirmDelete(groupName, groupId) {
  const response = confirm(`Do you really want delete ${groupName}?`);

  if (response) {
    fetch(`/admin/group/delete/${groupId}`, {
      method: 'delete',
      credentials: 'same-origin'
    }).then(response => {
      if (response.status === 200) {
        $('#group-datatable').dataTable().api().ajax.reload();
      } else {
        $.bootstrapGrowl('<h4>Hi there!</h4> <p>The operation failed!</p>', {
          type: 'danger',
          delay: 2500,
          allow_dismiss: true
        });
      }
    }).catch(error => console.error(`Please report: ${error}`));
  }
}

function format(data) {
  return fetch('/admin/group/rules', {
      method: 'get',
      credentials: 'same-origin'
  }).then(response =>
    response.json()
  ).then(rules => {
    let result = `
    <form action="/admin/group/update/${data['_id']}" method="post" class="form-horizontal form-bordered">
    <fieldset>
    <legend>Rules</legend>
    `;

    for (const rule of rules['data']) result += `
        <div class="form-group col-md-12">
        <label class="col-md-3 control-label">${rule}</label>
        <div class="col-md-9">
          <label class="checkbox-inline" for="create-${rule}-write">
            <input type="checkbox" id="create-${rule}-write" name="${rule}.write" ${data.rules[rule] !== null && data.rules[rule]['write'] ? 'checked' : ''}>write
          </label>
          <label class="checkbox-inline" for="create-${rule}-read">
            <input type="checkbox" id="create-${rule}-read" name="${rule}.read" ${data.rules[rule] !== null && data.rules[rule]['read'] ? 'checked' : ''}>read
          </label>
        </div>
        </div>
      `;

    return result += `
    </fieldset>
        <div class="form-group form-actions  col-md-12">
          <div class="col-md-9 col-md-offset-3">
            <button type="submit" class="btn btn-sm btn-primary"><i class="fa fa-user"></i> Update</button>
            <button type="reset" class="btn btn-sm btn-warning"><i class="fa fa-repeat"></i> Reset</button>
            <button type="button" class="btn btn-sm btn-danger" onclick="confirmDelete('${data['name']}', '${data['_id']}');"><i class="fa fa-times"></i> Delete</button>
          </div>
      </div>
    </form>
    `;
  });
}

(() => {
  App.datatables();

  const groupDatable = $('#group-datatable');

  const table = groupDatable.DataTable({
    ajax: '/admin/group/list',
    columns: [
      {
        "className": 'details-control text-center',
        "orderable": false,
        "data": null,
        "defaultContent": '<i class="fa fa-plus-circle fa-2x"></i>'
      },
      {data: 'name'}
    ],
    pageLength: 10,
    lengthMenu: [[10, 20, 30, -1], [10, 20, 30, 'All']]
  });

  $('.dataTables_filter input').attr('placeholder', 'Search');

  groupDatable.find('tbody').on('click', 'td.details-control', function() {
    const tr = $(this).closest('tr');
    const row = table.row(tr);

    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass('shown');
    } else {
      format(row.data()).then(function (res) {
        row.child(res).show();
        tr.addClass('shown');
      });
    }
  });
})();
