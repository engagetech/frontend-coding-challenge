/******************************************************************************************

Angular Filters for use in common apps

******************************************************************************************/

var app = angular.module("alchemytec.filters", []);

// Filter for nice currency display - GBP symbol, commas every three places, 0 decimal places
// Usage: {{ 1235022 | sterling }}
//	outputs £12,350
app.filter("sterling", [ function() {
	return function(inputPence, showPence) {
		var amount = Number(inputPence) / 100;
		var inputPounds = new String(showPence ? Math.floor(amount) : Math.round(amount));
		var currency = "";

		while (inputPounds.length > 3) {
			// When we dump IE8 we can use negatives in substr, won't that be nice?
			currency = "," + inputPounds.substr(inputPounds.length - 3, 3) + currency;
			inputPounds = inputPounds.substr(0, inputPounds.length - 3);
		}

		if (showPence) {
			var pence = new String(inputPence - (Math.floor(Number(inputPence) / 100) * 100));
			if (pence.length == 1)
				pence = "0" + pence;

			currency += "." + pence;
		}

		return "\u00A3" + inputPounds + currency;
	};
} ]);

// Filter for percentage display
// Usage: {{ 34.5 | percentage }}
//	outputs 35%
// Usage: {{ 34.547 | percentage:2 }}
//	outputs 35.55%
app.filter("percentage", [ function() {
	return function(input, places) {
		places = places? places : 0;

		return (input? parseFloat(input) : 0).toFixed(places) + "%";
	};
} ]);

// Filter for totalling columns in an array
// Usage: {{ variable | total:'price' }}
//	output adds the price properties of every entry in the array variable
// Usage: {{ 34.547 | total:'price,vat' }}
//	output adds the price and vat properties of every entry in the array variable
app.filter("total", [ function() {
	return function(values, columns) {
		var total = 0;
		columns = columns.split(",");
		
		for (var u = 0; u < values.length; u++) {
			for (var p = 0; p < columns.length; p++)
				total += parseFloat(values[u][columns[p]]);
		}

		return total;
	};
} ]);

// Filter for reducing an array into a smaller array
// Usage: ng-repeat="row in columns | slice:2"
//	repeats columns[2] onwards
// Usage: ng-repeat="row in columns | slice:2,4"
//	repeats columns[2] to columns[6]
app.filter("slice", function() {
	return function(items, start, count) {
		start = start || 0;
		
		if (count)
			count = start + count;

		return (items || []).slice(start, count);
	};
});

// Filter for padding out a string with a provided prefix
// Usage: {{ somemoney | prefix:0:7 }}
//	might output 0000123 if somemoney is 123
app.filter("prefix", function() {
	return function(input, prefix, length) {
		var output = new String(input);
		
		output = new Array(length - output.length + 1).join(prefix) + output;

		return output;
	};
});

// Filter for converting an object with first, middle and surnames into one name
// Usage: {{ personDetails | personfullname }}
//	might output Paul Robinson
app.filter("personfullname", [ function() {
	return function(object) {
		if (!object)
			return "";
		
		if (_.isArray(object))
			object = object[0];
		var name = object? _.compact([ object.firstname, object.middlename, object.surname ]) : [];

		return name.join(" ");
	};
} ]);

// Filter for converting an object with first, middle and surnames into initials
// Usage: {{ personDetails | personinitials }}
//	might output PR
app.filter("personinitials", [ function() {
	return function(object) {
		var name = "";
		
		if (object) {
			if (_.isArray(object))
				object = object[0];
			
			if (!object)
				return "";

			_.each(_.compact([ object.firstname, object.middlename, object.surname ]), function(element, index, list) {
				if (element)
					name += element.charAt(0).toUpperCase();
			});
		}

		return name;
	};
} ]);

// Filter for returning an 's' if a noun should be plural
// Usage: Attachment{{ attachments.length | pluralise }}
//	might output Attachments
app.filter("pluralise", function () {
	return function (value) {
		if (value != 1)
			return "s";
		
		return "";
	};
});
