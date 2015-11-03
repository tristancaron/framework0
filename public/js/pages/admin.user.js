'use strict';

ace.config.set("basePath", "/js/ace");

function confirmDelete(userEmail, userId) {
  const response = confirm(`Do you really want delete ${userEmail}?`);

  if (response) {
    fetch(`/admin/user/delete/${userId}`, {
      method: 'delete',
      credentials: 'same-origin'
    }).then(response => {
      if (response.status === 200) {
        $('#group-datatable').dataTable().api().ajax.reload();
      } else {
        $.bootstrapGrowl('<h4>Delete User</h4> <p>The operation failed!</p>', {
          type: 'danger',
          delay: 2500,
          allow_dismiss: true
        });
      }
    }).catch(error => console.error(`Please report: ${error}`));
  }
}

function updateUser(userId) {
  const editor = ace.edit(userId);
  const content = jsyaml.safeLoad(editor.getValue());

  fetch(`/admin/user/update/${userId}`, {
    credentials: 'same-origin',
    method: 'put',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content)
  }).then(response => {
    if (response.status === 200) {
      $('#group-datatable').dataTable().api().ajax.reload();
    } else {
      $.bootstrapGrowl('<h4>Update User</h4> <p>The operation failed!</p>', {
        type: 'danger',
        delay: 2500,
        allow_dismiss: true
      });
    }
  }).catch(error => console.error(`Please report: ${error}`));
}

function addUser(event, form) {
  event.preventDefault();

  const editor = ace.edit('create-user');
  const content = jsyaml.safeLoad(editor.getValue());

  fetch('/admin/user/add/', {
    credentials: 'same-origin',
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content)
  }).then(response => {
    if (response.status === 200) {
      $('#group-datatable').dataTable().api().ajax.reload();
    } else {
      $.bootstrapGrowl('<h4>Add User</h4> <p>The operation failed!</p>', {
        type: 'danger',
        delay: 2500,
        allow_dismiss: true
      });
    }
  }).catch(error => console.error(`Please report: ${error}`));
}

function format(data) {
  return fetch(`/admin/user/get/${data['_id']}`, {
      method: 'get',
      credentials: 'same-origin'
  }).then(response =>
    response.json()
  ).then(infos => {
    return `
    <div id="${data['_id']}" style="height: 200px">${jsyaml.safeDump(Object.assign(infos['data'], {group: infos['data']['group']['name']}))}</div>
    <button type="submit" class="btn btn-sm btn-primary" onclick="updateUser('${data['_id']}');">Update</button>&nbsp;
    <button type="submit" class="btn btn-sm btn-danger" onclick="confirmDelete('${data['email']}', '${data['_id']}');">Delete</button>
    `;
  });
}

(() => {
  const langTools = ace.require("ace/ext/language_tools");

  var userCompleter = {
    getCompletions: (editor, session, pos, prefix, callback) => {
      const groupField = session.getLine(pos.row).search(/^group: /);

      if (groupField != -1) {
        fetch('/admin/group/list', {
          credentials: 'same-origin'
        }).then(r => r.json())
          .then(groups => {
          const result = [];
          for (const group of groups['data']) {
            result.push({
              name: group.name,
              value: group.name,
              meta: 'group'
            });
          }
          callback(null, result);
        });
      } else {
        callback(null, []);
      }
    }
  };
  langTools.setCompleters([userCompleter]);

  App.datatables();

  const groupDatable = $('#group-datatable');

  const table = groupDatable.DataTable({
    ajax: '/admin/user/list',
    columns: [
      {
        "className": 'details-control text-center',
        "orderable": false,
        "data": null,
        "defaultContent": '<i class="fa fa-plus-circle fa-2x"></i>'
      },
      {data: 'email'},
      {data: 'group.name'}
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
      const data = row.data();
      format(data).then(function (res) {
        row.child(res).show();
        tr.addClass('shown');

        const editor = ace.edit(data['_id']);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/yaml");
        editor.setOptions({
          enableBasicAutocompletion: true
        });
        editor.$blockScrolling = 'Infinity';
      });
    }
  });


  const editor = ace.edit('create-user');
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/yaml");
  editor.setOptions({
    enableBasicAutocompletion: true
  });
  editor.$blockScrolling = 'Infinity';
})();
