# EngageTech Front End Coding Challenge

## Overview

This coding challenge should allow you to show off your Angular (version 6 or later) and HTML/CSS abilities. Inside the `design` folder are four images which represent the various states of the table we would like you to build, with data supplied from a REST endpoint.

Two of the images show the initial default view of the data set, with the totals at the bottom of the table, Direct Contractors at the top, and the list of providers sorted alphabetically between them.

The remaining two images show how the table is represented when sorted by columns other than Payroll Provider.

You will need to create an Angular application that displays the data returned from a  REST endpoint provided by the included Java application.

For matching the visual aspect of the designs, you are free to use any CSS styles you like, with any methodology you prefer. The font family should be `Open Sans`.

### Requirements

The following list contains the minimum requirements for this project:

* The completed page should accurately represent the design templates
* Clicking the column headings should sort the data from highest to lowest values, or alphabetical as appropriate
* When sorting by Payroll Provider, Direct Contractors should always appear as the first entry
* When sorting by any other column, Direct Contractors should appear sorted with the provider entries

### Extra credits

If you fancy doing a little extra, here are some things that might be nice to add:

* Clicking column headings should toggle sorting in forward and backward directions for that column
* Show the currently sorted column data in a darker colour
* Mobilise the table for small devices
* Animate the re-ordering of the table rows

### Things we are looking for

We want this to match the mocks, you'd be amazed (or maybe you wouldn't?) the percentage of submissions in the past that do not. A good eye for detail is important to us.

How you structure and name classes in your style sheets matters. Is there any methodology, is it scaleable? Can it be re-used for other design patterns? Or are you just hacking things together until they look right?

That things work as the requirements describe. It's okay to ask questions if you don't understand something, but going off and doing the wrong thing is not going to fill us with confidence.

If we like the end result, we will want you to talk us through your code and any decisions you made.

### Running the back end

The back end requires Java 8, and can be run from the `backend` directory with the command `./run.sh`

If it launches correctly you should see the following in the console:

`INFO  [2015-10-29 13:17:10,166] org.eclipse.jetty.server.Server: Started @2126ms`
