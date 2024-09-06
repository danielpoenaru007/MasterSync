jQuery.sap.declare("zmmatreq.utils.formatter");
zmmatreq.utils.formatter = {

	priceFormatted: function (e) {
		jQuery.sap.require("sap.ui.core.format.NumberFormat");
		var r = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits: 2,
			groupingEnabled: true,
			groupingSeparator: ".",
			decimalSeparator: ","
		});
		return r.format(e);
	},

	deleteZeros: function (string) {
		return string.replace(/^0+/, '');
	},
	dateFormatter: function (date) {
		if (date)
			return date.toLocaleDateString();
		else
			return "";
	},

	gmpTextFormat: function (type) {
		if (type == "G")
			return "GMP";
		else if (type == "N")
			return "Non-GMP";
		else
			return "";
	},

	changeNumberExistFormat: function (value) {
		if (value == "X")
			return true;
		else
			return false;
	},

	mainTitleFormat: function (value, text) {
		if (value == "X")
			return text;
		else
			return "";
	},
	mainTextFormat: function (value, text) {
		if (value == "X")
			return "";
		else
			return text;
	},

	reqStatStateFormat: function (type) {
		// New
		// In progress
		// Approved
		// On Hold
		// Rejected
		// Cancelled
		if (type == "01")
			return "Warning";
		else if (type == "02")
			return "Information";
		else if (type == "03")
			return "Success";
		else if (type == "04")
			return "Error";
		else if (type == "05")
			return "None";
	},

	iconResultFormat: function (stat) {

		if (stat == "W")
			return "sap-icon://pending";
		else if (stat == "A")
			return "sap-icon://hr-approval";
		else if (stat == "R")
			return "sap-icon://employee-rejections";
	},

	colorResultFormat: function (stat) {

		if (stat == "W")
			return "Warning";
		else if (stat == "A")
			return "Success";
		else if (stat == "R")
			return "Error";
	},

	colorWIStatFormat: function (stat) {

		if (stat == "READY")
			return "Warning";
		else if (stat == "COMPLETED")
			return "Success";
		else if (stat == "STARTED")
			return "Error";
	},

	fileURL: function (guid, line) {

		return encodeURI("/sap/opu/odata/sap/ZM_MAT_MASTER_REQUEST_SRV/DocumentRowSet(Docguid=guid\'" + guid + "\',Filename='" + "test" +
			"',Length=" + line + ")/$value");
	},

	fileSizeFormatted: function (length) {

		return sap.ui.core.format.FileSizeFormat.getInstance({
			binaryFilesize: false,
			maxFractionDigits: 1,
			maxIntegerDigits: 3
		}).format(length);

	},
	deletableFormatted: function (val) {
		return val == "" ? false : true;
	},

};