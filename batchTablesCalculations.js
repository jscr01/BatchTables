DataTableBatchApi.calculations = {};
DataTableBatchApi.calculations.sum = function (data, deletedItems, column, format) {
    var rtnSum = 0;
    for (i = 0; i < data.length; i++) {
        if ($.inArray(data[i]["DT_RowId"], deletedItems) === -1) {
            if (isNaN(parseFloat(data[i][column]))) {
                rtnSum += 0;
            } else {
                rtnSum += parseFloat(data[i][column]);
            }
        }
    }

    if (format) {
        return DataTableBatchApi.formatNumber(rtnSum);
    } else {
        return rtnSum;
    }
}

DataTableBatchApi.calculations.average = function (data, deletedItems, column, format) {
    var sumOfNumbers = 0;
    var average;
    for (i = 0; i < data.length; i++) {
        if ($.inArray(data[i]["DT_RowId"], deletedItems) === -1) {
            if (isNaN(parseFloat(data[i][column]))) {
                sumOfNumbers += 0;
            } else {
                sumOfNumbers += parseFloat(data[i][column]);
            }
        } 
    }
    if (sumOfNumbers == 0 || data.length == 0) {
        average = 0;
    } else {
        average = sumOfNumbers / data.length;
    }
    if (format) {
        return DataTableBatchApi.formatNumber(average);
    } else {
        return average;
    }
}

DataTableBatchApi.calculations.max = function (data, deletedItems, column, format) {
    var arrNumbers = [];
    var maxNumber;
    for (i = 0; i < data.length; i++) {
        if ($.inArray(data[i]["DT_RowId"], deletedItems) === -1) {
            if (isNaN(parseFloat(data[i][column]))) {
                arrNumbers.push(0);
            } else {
                arrNumbers.push(parseFloat(data[i][column]));
            }
        }
    }

    maxNumber = Math.max.apply(Math, arrNumbers);

    if (format) {
        return DataTableBatchApi.formatNumber(maxNumber);
    } else {
        return maxNumber;
    }
}

DataTableBatchApi.calculations.min = function (data, deletedItems, column, format) {
    var arrNumbers = [];
    var minNumber;
    for (i = 0; i < data.length; i++) {

        if ($.inArray(data[i]["DT_RowId"], deletedItems) === -1) {
            if (isNaN(parseFloat(data[i][column]))) {
                arrNumbers.push(0);
            } else {
                arrNumbers.push(parseFloat(data[i][column]));
            }
        }
    }

    minNumber = Math.min.apply(Math, arrNumbers);

    if (format) {
        return DataTableBatchApi.formatNumber(minNumber);
    } else {
        return minNumber;
    }
}


DataTableBatchApi.calculations.range = function (data, deletedItems, column, format) {
    var maxValue = DataTableBatchApi.calculations.max(data, deletedItems, column, false);
    var minValue = DataTableBatchApi.calculations.min(data, deletedItems, column, false);
    var range = maxValue - minValue;

    if (format) {
        return DataTableBatchApi.formatNumber(range);
    } else {
        return range;
    }
}