var DataTableBatchApi = {};

DataTableBatchApi.init = function (tableRef, dataTablesSettings, batchSettings) {
    var dtbBatchGrid = {};
    var rowCallback = function (row, data) { };

	if (DataTableBatchApi.checkSetting(dataTablesSettings.rowCallback, function () {
        rowCallback = dataTablesSettings.rowCallback;
    }));
    dtbBatchGrid.data = {};
    dtbBatchGrid.data.selected = [];
    dtbBatchGrid.data.inserted = {};
    dtbBatchGrid.data.edit = {};
    dtbBatchGrid.data.deleted = [];
    dtbBatchGrid.newCount = 0;
    dtbBatchGrid.editForm = {};
    dtbBatchGrid.editControl;
    dtbBatchGrid.cacheObjects = {};
    dtbBatchGrid.lstNumberRows = [];

    if ($(tableRef + " tr[data-editform='true']") !== undefined) {
        $(tableRef + " tr[data-editform='true'] td").each(function (i, ele) {
            dtbBatchGrid.editForm[i] = {};
            dtbBatchGrid.editForm[i].element = $(ele).html();
            if ($(ele).attr("data-call") !== undefined) {
                dtbBatchGrid.editForm[i].call = $(ele).attr("data-call");
                dtbBatchGrid.editForm[i].cache = false;
                if ($(ele).attr("data-cache") !== undefined) {
                    dtbBatchGrid.editForm[i].cache = $(ele).attr("data-cache");
                }
            }
            if ($(ele).children("input[type='number']").length != 0) {
                dtbBatchGrid.lstNumberRows.push(i);
            }
        });
    }

	dtbBatchGrid.grid = $(tableRef).DataTable(dataTablesSettings);
	dtbBatchGrid.batchSettings = batchSettings;
	dtbBatchGrid.domElements = {};

    dtbBatchGrid.batchSettings.selectColumnName = typeof dtbBatchGrid.batchSettings.selectColumnName == "undefined" ? "#" : dtbBatchGrid.batchSettings.selectColumnName;
    
    
    dtbBatchGrid.batchSettings.deleteButtonText = typeof dtbBatchGrid.batchSettings.deleteButtonText == "undefined" ? "Delete" : dtbBatchGrid.batchSettings.deleteButtonText;
    dtbBatchGrid.batchSettings.deleteNewButtonText = typeof dtbBatchGrid.batchSettings.deleteNewButtonText == "undefined" ? dtbBatchGrid.batchSettings.deleteButtonText : dtbBatchGrid.batchSettings.deleteNewButtonText;
    dtbBatchGrid.batchSettings.deleteButtonCss = typeof dtbBatchGrid.batchSettings.deleteButtonCss == "undefined" ? null : dtbBatchGrid.batchSettings.deleteButtonCss;

    dtbBatchGrid.batchSettings.unDeleteButtonText = typeof dtbBatchGrid.batchSettings.unDeleteButtonText == "undefined" ? "Undo Delete" : dtbBatchGrid.batchSettings.unDeleteButtonText;
    dtbBatchGrid.batchSettings.unDeleteButtonCss = typeof dtbBatchGrid.batchSettings.unDeleteButtonCss == "undefined" ? null : dtbBatchGrid.batchSettings.unDeleteButtonCss;

    dtbBatchGrid.batchSettings.actionColumnName = typeof dtbBatchGrid.batchSettings.actionColumnName == "undefined" ? "#" : dtbBatchGrid.batchSettings.actionColumnName;
    dtbBatchGrid.batchSettings.additionalActions = typeof dtbBatchGrid.batchSettings.additionalActions == "undefined" ? [] : dtbBatchGrid.batchSettings.additionalActions;

	if (typeof dtbBatchGrid.batchSettings.actions !== "undefined") { //Else there are no actions, dont show dropdown

		//Container Setup
		dtbBatchGrid.domElements.actionsContainer = $("<div>");
		DataTableBatchApi.checkSetting(dtbBatchGrid.batchSettings.actionsContainerId,
			function () { $(dtbBatchGrid.domElements.actionsContainer).attr("id", dtbBatchGrid.batchSettings.actionsContainerId); },
			function () { $(dtbBatchGrid.domElements.actionsContainer).attr("id", "dtbBatchGridActions"); })

		DataTableBatchApi.checkSetting(dtbBatchGrid.batchSettings.actionsContainerClass, function () { $(dtbBatchGrid.domElements.actionsContainer).attr("class", dtbBatchGrid.batchSettings.actionsContainerClass) })
		DataTableBatchApi.checkSetting(dtbBatchGrid.batchSettings.actionsContainerText, function () { $(dtbBatchGrid.domElements.actionsContainer).html(dtbBatchGrid.batchSettings.actionsContainerText) })

		//Select Setup
		dtbBatchGrid.domElements.actionsSelect = $("<select>");
		DataTableBatchApi.checkSetting(dtbBatchGrid.batchSettings.actionsSelectId,
			function () { $(dtbBatchGrid.domElements.actionsSelect).attr("id", dtbBatchGrid.batchSettings.actionsSelectId); },
			function () { $(dtbBatchGrid.domElements.actionsSelect).attr("id", "dtbBatchGridActions_Select"); })


		$(dtbBatchGrid.domElements.actionsSelect).append("<option selected=\"selected\" value=\"0\"></option>");
		for (var i = 0; i < dtbBatchGrid.batchSettings.actions.split(",").length; i++) {
			$(dtbBatchGrid.domElements.actionsSelect).append("<option value=\"" + (i + 1) + "\">" + dtbBatchGrid.batchSettings.actions.split(",")[i] + "</option>")
			
		}

		$(dtbBatchGrid.domElements.actionsContainer).append(dtbBatchGrid.domElements.actionsSelect);

		$(dtbBatchGrid.grid.settings()[0].nTable).before(dtbBatchGrid.domElements.actionsContainer);


		//EVENTS
		$("html").on("change", "#" + $(dtbBatchGrid.domElements.actionsSelect).attr("id"), function (event) {
			DataTableBatchApi.checkSetting(dtbBatchGrid.batchSettings.actionsSelectEvent, function () { dtbBatchGrid.batchSettings.actionsSelectEvent(event) });
			$(dtbBatchGrid.domElements.actionsSelect).val(0);
		});
	}

	dtbBatchGrid.batchSettings.debug = typeof dtbBatchGrid.batchSettings.debug == "undefined" ? false : dtbBatchGrid.batchSettings.debug

	dtbBatchGrid.reset = function () {
	    dtbBatchGrid.grid.ajax.reload();
	    dtbBatchGrid.data.inserted = {};
	    dtbBatchGrid.data.selected = [];
	    dtbBatchGrid.data.deleted = [];
	    dtbBatchGrid.data.edit = {};
	}

    //Add Columns
	dtbBatchGrid.batchSettings.showSelectionBox = typeof dtbBatchGrid.batchSettings.showSelectionBox == "undefined" ? true : dtbBatchGrid.batchSettings.showSelectionBox
	if (dtbBatchGrid.batchSettings.showSelectionBox) {
	    $(dtbBatchGrid.grid.settings()[0].nTable).children("thead").children("tr").children("th:first").before("<th>" + dtbBatchGrid.batchSettings.selectColumnName + "</th>");
	}
	dtbBatchGrid.batchSettings.showActionColumn = typeof dtbBatchGrid.batchSettings.showActionColumn == "undefined" ? true : dtbBatchGrid.batchSettings.showDeleteColumn
	if (dtbBatchGrid.batchSettings.showActionColumn) {
	    $(dtbBatchGrid.grid.settings()[0].nTable).children("thead").children("tr").children("th:last").after("<th>" + dtbBatchGrid.batchSettings.actionColumnName + "</th>");
	    dtbBatchGrid.batchSettings.showActionsColumn = true;
	} else {
	    dtbBatchGrid.batchSettings.showActionsColumn = false;
	}

    //draw.dt draw event
	$(tableRef).on('draw.dt', function (event, settings) {
	    $(tableRef + " tr td").attr("tabindex", "0");
        if (dtbBatchGrid.batchSettings.showSelectionBox) {
            $(tableRef + " tr td:first-child").each(function (i, ele) {
                var id = $(ele).parent().attr("id");
	                if ($(ele).attr("data-commandcell") === undefined) {
	                    var checked = ($.inArray(id, dtbBatchGrid.data.selected) > -1) ? "checked=\"checked\"" : "";
	                    $(ele).before("<td data-commandcell=\"select\"><input " + checked + " type=\"checkbox\" id=\"chkSelection" + tableRef + "_checkbox_" + $(ele).parent().attr("id") + "\"></td>");
	                }
	            });
        }

        if (dtbBatchGrid.batchSettings.showActionsColumn) {               
            $(tableRef + " tr.dtbNew td:last-child").each(function (i, ele) {
                if ($(ele).attr("data-actioncell") == undefined) {
                    var markup;
                    markup = DataTableBatchApi.generateDeleteButton(ele, tableRef, dtbBatchGrid.batchSettings.deleteNewButtonText, dtbBatchGrid.batchSettings.deleteButtonCss);

                    for (var i = 0; i < dtbBatchGrid.batchSettings.additionalActions.length; i++) {
                        if (typeof dtbBatchGrid.batchSettings.additionalActions[i].newOnly == "undefined" || dtbBatchGrid.batchSettings.additionalActions[i].newOnly) {
                            markup += dtbBatchGrid.batchSettings.additionalActions[i].markup;
                        }
                    }
                    $(ele).after("<td data-actioncell=\"action\">" + markup + "</td>");
                }
            });
            $(tableRef + " tr:not(.dtbNew) td:last-child").each(function (i, ele) {
                if ($(ele).attr("data-actioncell") == undefined) {
                    var id = $(ele).parent().attr("id");
                    var markup;
                    if ($.inArray(id, dtbBatchGrid.data.deleted) === -1) {
                        markup = DataTableBatchApi.generateDeleteButton(ele, tableRef, dtbBatchGrid.batchSettings.deleteButtonText, dtbBatchGrid.batchSettings.deleteButtonCss);
                    } else {
                        markup = DataTableBatchApi.generateDeleteButton(ele, tableRef, dtbBatchGrid.batchSettings.unDeleteButtonText, dtbBatchGrid.batchSettings.unDeleteButtonCss, true);
                    }

                    for (var i = 0; i < dtbBatchGrid.batchSettings.additionalActions.length; i++) {
                        if (typeof dtbBatchGrid.batchSettings.additionalActions[i].newOnly == "undefined") {
                            markup += dtbBatchGrid.batchSettings.additionalActions[i].markup;
                        }
                    }
                    
                    $(ele).after("<td data-actioncell=\"action\">" + markup + "</td>");
                }
            });

            $(tableRef + " tr").each(function (i, ele) {
                $(ele).children().each(function (x, tdEle) {
                    for (var cellIndex = 0; cellIndex < dtbBatchGrid.lstNumberRows.length; cellIndex++) {
                        var realCellIndex = dtbBatchGrid.lstNumberRows[cellIndex];
                        if(dtbBatchGrid.batchSettings.showSelectionBox){
                            realCellIndex = dtbBatchGrid.lstNumberRows[cellIndex] + 1;
                        }
                        if (realCellIndex == x) {
                            $(tdEle).text(DataTableBatchApi.formatNumber($(tdEle).text()));
                        }
                    }
                });
            });
        }

        if (typeof dtbBatchGrid.batchSettings.onGridRendered !== "undefined") dtbBatchGrid.batchSettings.onGridRendered(event, settings);
        debugOutput();
	});

    //CRUD Methods
	dtbBatchGrid.data.addBlank = function () {
	    var columns = dtbBatchGrid.grid.columns();
	    var blankRecord = {};
	    for (var i = 0; i < columns[0].length; i++) {
	        blankRecord[i] = "";
	    }
	    blankRecord.DT_RowId = "dtbNew" + dtbBatchGrid.newCount;
	    dtbBatchGrid.data.inserted[blankRecord.DT_RowId] = blankRecord;
	    if (dtbBatchGrid.batchSettings.showSelectionBox) {
	        $("[data-commandcell]").remove();
	    }
	    if (dtbBatchGrid.batchSettings.showActionsColumn) {
	        $("[data-actioncell]").remove();
	    }
	    dtbBatchGrid.newCount++;

	    dtbBatchGrid.data.processNewRecord(blankRecord);
	}
	dtbBatchGrid.data.addRecord = function (record) {
	    var columns = dtbBatchGrid.grid.columns();
	    var newRecord = {};
	    for (var i = 0; i < columns[0].length; i++) {
	        newRecord[i] = record[i];
	    }
	    newRecord.DT_RowId = "dtbNew" + dtbBatchGrid.newCount;
	    dtbBatchGrid.data.inserted[newRecord.DT_RowId] = newRecord;
	    if (dtbBatchGrid.batchSettings.showSelectionBox) {
	        $("[data-commandcell]").remove();
	    }
	    dtbBatchGrid.newCount++;

	    dtbBatchGrid.data.processNewRecord(newRecord);
	}
	dtbBatchGrid.data.processNewRecord = function (record) {
	    var recordRow = dtbBatchGrid.grid.row.add(record).draw(false).nodes();
	    var deleteActionColumn = $(recordRow).children("td:last-child");
	    $(recordRow).addClass("dtbNew");

	    $(deleteActionColumn).children("button").remove();
	    $(deleteActionColumn).append(DataTableBatchApi.generateDeleteButton($(deleteActionColumn), tableRef, dtbBatchGrid.batchSettings.deleteNewButtonText, dtbBatchGrid.batchSettings.deleteButtonCss));
	    for (var i = 0; i < dtbBatchGrid.batchSettings.additionalActions.length; i++) {
	        if (typeof dtbBatchGrid.batchSettings.additionalActions[i].newOnly == "undefined" || dtbBatchGrid.batchSettings.additionalActions[i].newOnly) {
	            $(deleteActionColumn).append(dtbBatchGrid.batchSettings.additionalActions[i].markup);
	        }
	    }
	}

    //Events
	$("html").on("click", tableRef + " tbody tr td[data-commandcell]", function (event) {
	    var id = $(this).parent().attr("id");
	    var index = $.inArray(id, dtbBatchGrid.data.selected);

	    if (index === -1) {
	        dtbBatchGrid.data.selected.push(id);
	        if (dtbBatchGrid.batchSettings.showSelectionBox) $(this).children("input").prop("checked", true);
	    } else {
	        dtbBatchGrid.data.selected.splice(index, 1);
	        if (dtbBatchGrid.batchSettings.showSelectionBox) $(this).children("input").prop("checked", false);
	    }
	    $(this).parent().toggleClass('selected');
	    if (typeof dtbBatchGrid.batchSettings.onSelectionBoxClick !== "undefined") dtbBatchGrid.batchSettings.onSelectionBoxClick(event, id, index);
	    debugOutput();
	});

	$("html").on("click", tableRef + " tbody tr td button[data-btn='delete']", function (event) {
        var row = $(this).parent().parent();
        if ($(this).attr("data-action") === "delete") {
            $(this).html(dtbBatchGrid.batchSettings.unDeleteButtonText);
            $(this).attr("data-action", "undelete");
            $(row).attr("data-deleted", true);
            if (dtbBatchGrid.batchSettings.unDeleteButtonCss !== null) {
                $(this).attr("class", dtbBatchGrid.batchSettings.unDeleteButtonCss)
            }
            if ($(row).hasClass("dtbNew")) {
                delete dtbBatchGrid.data.inserted[$(row).attr("id")];
                dtbBatchGrid.grid.row(row).remove().draw(false);
            } else {
                dtbBatchGrid.data.deleted.push($(row).attr("id"));
            }
            
        } else {
            $(row).removeAttr("data-deleted");
            if (dtbBatchGrid.batchSettings.DeleteButtonCss !== null) {
                $(this).attr("class", dtbBatchGrid.batchSettings.DeleteButtonCss)
            }
            $(this).parent().children("[data-btn='delete']").html(dtbBatchGrid.batchSettings.deleteButtonText);

            $(this).parent().children("[data-btn='delete']").attr("data-action", "delete");
                var index = DataTableBatchApi.getIndex(dtbBatchGrid.data.deleted, $(row).attr("id"));
                dtbBatchGrid.data.deleted.splice(index, 1);
        }
        if (typeof dtbBatchGrid.batchSettings.onDeleteButtonClick !== "undefined") dtbBatchGrid.batchSettings.onDeleteButtonClick(event);
        debugOutput();
	});

	$("html").on("focus", tableRef + " tbody tr td", function (event) {
	    var isDisabled = (typeof dtbBatchGrid.batchSettings.activateEditModeCondition !== "undefined") ? dtbBatchGrid.batchSettings.activateEditModeCondition(event, $(this).attr("data-editmode")) : false;
	    if (!isDisabled) {
	        if (!$(this).attr("data-commandcell") && !$(this).attr("data-editmode") && !$(this).attr("data-actioncell") && !$(this).parent().attr("data-deleted")) {
	            var oldValue = $(this).text();
	            var editControl = dtbBatchGrid.editForm[DataTableBatchApi.findCellPosition($(this), dtbBatchGrid.batchSettings.showSelectionBox)].element;
	            var controlType = $(editControl).attr("type");
	            if ($(editControl).attr("data-ishtml") == "true") {
	                oldValue = $(this).html();
	            }
	            $(this).attr("data-editmode", "true");
	            if (controlType == "number") {
	                oldValue = DataTableBatchApi.deformatNumber(oldValue);
	            }
	            $(this).attr("data-oldvalue", oldValue);


	            $(this).html(editControl);

	            if ($(this).children("input").length > 0) {
	                dtbBatchGrid.editControl = "input";
	                switch(($(this).children("input").attr("type"))){
	                    case "checkbox":
	                        var trueVal = $(this).children("input").attr("data-trueval");
                            if (oldValue == trueVal) {
	                            $(this).children("input").attr("checked", "checked");
	                        }
	                        break;
	                    case "number":
	                        $($(this).children("input")).val(DataTableBatchApi.deformatNumber(oldValue));
	                        break;
	                    default:
                            $($(this).children("input")).val(oldValue);
	                        break;
	                }
	            } else if ($(this).children("select").length > 0) {
	                dtbBatchGrid.editControl = "select";
	                var selectList = $($(this).children("select"));
	                var colPos = DataTableBatchApi.findCellPosition($(this), dtbBatchGrid.batchSettings.showSelectionBox);
	                if (dtbBatchGrid.editForm[colPos].call !== undefined) {
	                    if (dtbBatchGrid.editForm[colPos].cache && typeof dtbBatchGrid.cacheObjects["column" + colPos + "Data"] !== "undefined") {
	                        DataTableBatchApi.populateSelectList(selectList, dtbBatchGrid.cacheObjects["column" + colPos + "Data"]);
	                        selectList.val(oldValue);
	                    } else {
	                        var ajaxObject = { url: dtbBatchGrid.editForm[colPos].call };
	                        if (typeof dtbBatchGrid.batchSettings.onCallForList !== "undefined") dtbBatchGrid.batchSettings.onCallForList(colPos, ajaxObject);
	                        $.ajax(ajaxObject).success(function (data) {
                                var lstItems = JSON.parse(data);
                                if (typeof dtbBatchGrid.batchSettings.onCellListGet !== "undefined") dtbBatchGrid.batchSettings.onCellListGet(colPos, lstItems);
	                            DataTableBatchApi.populateSelectList(selectList, lstItems);
	                            selectList.val(oldValue);
	                            if (dtbBatchGrid.editForm[colPos].cache) {
	                                dtbBatchGrid.cacheObjects["column" + colPos + "Data"] = lstItems;
	                            }
	                        });
	                    }
	                } else {
	                    selectList.val(oldValue);
	                }
	            }

	            $(this).children(dtbBatchGrid.editControl).focus();
	        
	            debugOutput();
	        }
	    }
	    if (typeof dtbBatchGrid.batchSettings.onCellEnter !== "undefined") dtbBatchGrid.batchSettings.onCellEnter(event, isDisabled);
	});

	$("html").on("focusout", tableRef + " tbody tr td input,  tbody tr td select", function (event) {
	    var oldValue = $(this).parent().attr("data-oldvalue");
	    var control = $(tableRef + " tbody tr td[data-editmode]").children(dtbBatchGrid.editControl);
	    var controlType = control.attr("type");
	    var cell = $(tableRef + " tbody tr td[data-editmode]");
	    var currentValue = (controlType == "checkbox") ? DataTableBatchApi.getCheckBoxValue(control) : control.val();
	    var hasChanged = (currentValue !== oldValue);
	    var isNew = $(this).parent().parent().hasClass("dtbNew");
	    var id = $(this).parent().parent().attr("id");
	    var index = dtbBatchGrid.batchSettings.showSelectionBox ? parseInt($(this).parent().index()) - 1 : parseInt($(this).parent().index());
	    if (hasChanged) {
	        if (isNew) {
	            dtbBatchGrid.data.inserted[id][index] = currentValue;
	        } else {
                if (typeof dtbBatchGrid.data.edit[id] == "undefined") {
                    var colStart = dtbBatchGrid.batchSettings.showSelectionBox ? 1 : 0;
                    var noCols = dtbBatchGrid.batchSettings.showSelectionBox ? dtbBatchGrid.grid.columns()[0].length + 1 : dtbBatchGrid.grid.columns()[0].length;
                    dtbBatchGrid.data.edit[id] = {};
                    dtbBatchGrid.data.edit[id]["DT_RowId"] = id;
                    for (var i = colStart; i < noCols; i++) {
                        var colNum = dtbBatchGrid.batchSettings.showSelectionBox ? i - 1 : i;
                        var record = (index === colNum) ? currentValue : $("#" + id + " td:eq(" + i + ")").text();

                        dtbBatchGrid.data.edit[id][colNum] = record;
                    }
	            } else {
                    dtbBatchGrid.data.edit[id][index] = currentValue;
	            }
	        }
	    }
	    if (controlType == "number") {
	        currentValue = DataTableBatchApi.formatNumber(currentValue);
	    }
	    $(tableRef + " tbody tr td[data-editmode]").html(currentValue);
        $(tableRef + " tbody tr td[data-editmode]").removeAttr("data-editmode");

        if (typeof dtbBatchGrid.batchSettings.onCellLeave !== "undefined") dtbBatchGrid.batchSettings.onCellLeave(event, oldValue, currentValue, hasChanged, isNew, id, index, cell);
        debugOutput();
	});

	var debugOutput = function () {
	    if (dtbBatchGrid.batchSettings.debug) {
	        var divOutput = "<div>Selected Items: <br />" + JSON.stringify(dtbBatchGrid.data.selected, null, 4) + "</div>";
	        divOutput += "<div>New Items: <br />" + JSON.stringify(dtbBatchGrid.data.inserted, null, 4) + "</div>";
	        divOutput += "<div>Deleted Items: <br />" + JSON.stringify(dtbBatchGrid.data.deleted, null, 4) + "</div>";
	        divOutput += "<div>Edited Items: <br />" + JSON.stringify(dtbBatchGrid.data.edit, null, 4) + "</div>";
	        $("#dtbDebug").html(divOutput);
	    }
	}

	debugOutput();
	return dtbBatchGrid;
}

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
        var solidNumber = number.toString().replace(new RegExp("[,]","g"), "");
        return parseFloat(solidNumber);
    }
}