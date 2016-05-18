DataTableBatchApi.checkSetting = function (setting, alternative, original) {
    if (typeof setting === "undefined") {
        if (typeof original !== "undefined") {
            original();
        }
    } else {
        alternative();
    }
}
DataTableBatchApi.getIndex = function (array, compare) {
    var index = null;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === compare) {
            index = i;
            break;
        }
    }
    return index;
}
DataTableBatchApi.generateDeleteButton = function (container, tableRef, text, css, undelete) {
    css = (typeof css == "undefined") ? "" : "class=\"" + css + "\"";
    undelete = (typeof undelete == "undefined") ? false : undelete;
    var action = (undelete) ? "undelete" : "delete";
    return "<button type=\"button\" " + css + " data-action=\"" + action + "\" data-btn=\"delete\" id=\"btnDelete" + tableRef + "_button_" + $(container).parent().attr("id") + "\">" + text + "</button>";

}
DataTableBatchApi.findCellPosition = function (cell, hasSelectionCell) {
    var postion = $(cell).index();
    if (hasSelectionCell) {
        postion--;
    }
    return postion;
}
DataTableBatchApi.populateSelectList = function (select, lstItems) {
    for (var i = 0; i < lstItems.length; i++) {
        var val = (typeof lstItems[i].value === "undefined") ? lstItems[i].text : lstItems[i].value;
        select.append("<option value=\"" + val + "\">" + lstItems[i].text + "</option>");
    }
}
DataTableBatchApi.getCheckBoxValue = function (checkbox) {
    if (checkbox.is(":checked")) {
        return checkbox.attr("data-trueval");
    } else {
        return checkbox.attr("data-falseval");
    }
}
DataTableBatchApi.formatNumber = function (number) {
    if (typeof DataTableBatchApi.formatNumberOverride != "undefined") {
        return DataTableBatchApi.formatNumberOverride(number);
    } else {
        number += '';
        x = number.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

}
DataTableBatchApi.deformatNumber = function (number) {
    if (typeof DataTableBatchApi.deformatNumberOverride != "undefined") {
        return DataTableBatchApi.deformatNumberOverride(number);
    } else {
        var solidNumber = number.toString().replace(new RegExp("[,]", "g"), "");
        return parseFloat(solidNumber);
    }
}