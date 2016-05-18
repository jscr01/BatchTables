var _Test;
    _Test = DataTableBatchApi.init('#example', {
        "ajax": "data/data.json"
    }, {
        "debug": true,
        "actions": "Delete,Duplicate",
        "actionsContainerText": "Actions: ",
        "actionsSelectEvent": function (e) { _Test = e.target.value; },
        "deleteNewButtonText": "Undo",
        "additionalActions": [{ "markup": "<button>Duplicate</button>" }],
        
    });